import fs from "fs";
import path from "path";
import {
  closeDatabaseConnection,
  closeDatabaseConnectionSync,
  flushDatabaseToDiskSync,
  getDatabasePath,
  getDatabaseStatus,
  markUnsavedChanges,
  openDatabaseConnection,
} from "./driver.js";
import { runMigrations } from "./migrate.js";
import {
  loadAppStateRecord,
  saveAppStateRecord,
} from "./repositories/appStateRepository.js";
import {
  countBudgets,
  createBudget,
  deleteBudget,
  listBudgets,
  replaceBudgets,
  updateBudget,
} from "./repositories/budgetsRepository.js";
import {
  countCategories,
  createCategory,
  deleteCategory,
  listCategories,
  replaceCategories,
  updateCategory,
} from "./repositories/categoriesRepository.js";
import {
  countGoals,
  createGoal,
  deleteGoal,
  listGoals,
  replaceGoals,
  updateGoal,
} from "./repositories/goalsRepository.js";
import {
  countRecurringPayments,
  createRecurringPayment,
  deleteRecurringPayment,
  listRecurringPayments,
  replaceRecurringPayments,
  updateRecurringPayment,
} from "./repositories/recurringPaymentsRepository.js";
import {
  countTransactions,
  createTransaction,
  deleteTransaction,
  listTransactions,
  replaceTransactions,
  updateTransaction,
} from "./repositories/transactionsRepository.js";

let hasPreparedDatabase = false;
let cachedMigrationInfo = null;

const ensureDatabaseReady = async () => {
  const db = await openDatabaseConnection();

  if (!db) {
    return null;
  }

  if (!hasPreparedDatabase) {
    cachedMigrationInfo = runMigrations(db);
    hasPreparedDatabase = true;
  }

  return db;
};

const buildStatus = () => {
  const driverStatus = getDatabaseStatus();

  return {
    ...driverStatus,
    storage: driverStatus.available ? "sqlite" : "renderer-localStorage",
    migrations: cachedMigrationInfo,
  };
};

const getStorageStatus = async () => {
  await ensureDatabaseReady();
  return buildStatus();
};

const loadPersistedAppState = async () => {
  try {
    const db = await ensureDatabaseReady();
    if (!db) {
      return {
        success: false,
        state: null,
        status: buildStatus(),
        error:
          "SQLite driver недоступен. Используется fallback на localStorage в renderer.",
      };
    }

    const result = loadAppStateRecord(db);

    return {
      success: true,
      ...result,
      status: buildStatus(),
    };
  } catch (error) {
    return {
      success: false,
      state: null,
      status: buildStatus(),
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

const savePersistedAppState = async (state) => {
  try {
    const db = await ensureDatabaseReady();
    if (!db) {
      return {
        success: false,
        status: buildStatus(),
        error:
          "SQLite driver недоступен. Данные будут сохранены только в localStorage renderer-процесса.",
      };
    }

    const result = saveAppStateRecord(db, state);

    // better-sqlite3 уже сохранил данные на диск, но делаем checkpoint для гарантии
    flushDatabaseToDiskSync();

    return {
      success: true,
      ...result,
      status: buildStatus(),
    };
  } catch (error) {
    return {
      success: false,
      status: buildStatus(),
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

const bootstrapDomainDataFromState = async (state) => {
  const db = await ensureDatabaseReady();
  if (!db || !state) {
    return null;
  }

  const hasBudgets = countBudgets(db) > 0;
  const hasCategories = countCategories(db) > 0;
  const hasGoals = countGoals(db) > 0;
  const hasRecurringPayments = countRecurringPayments(db) > 0;
  const hasTransactions = countTransactions(db) > 0;

  if (!hasBudgets && Array.isArray(state.budgets) && state.budgets.length > 0) {
    replaceBudgets(db, state.budgets);
  }

  if (
    !hasCategories &&
    Array.isArray(state.categories) &&
    state.categories.length > 0
  ) {
    replaceCategories(db, state.categories);
  }

  if (!hasGoals && Array.isArray(state.goals) && state.goals.length > 0) {
    replaceGoals(db, state.goals);
  }

  if (
    !hasRecurringPayments &&
    Array.isArray(state.recurringPayments) &&
    state.recurringPayments.length > 0
  ) {
    replaceRecurringPayments(db, state.recurringPayments);
  }

  if (
    !hasTransactions &&
    Array.isArray(state.transactions) &&
    state.transactions.length > 0
  ) {
    replaceTransactions(db, state.transactions);
  }

  // better-sqlite3 уже сохранил данные на диск, делаем checkpoint для гарантии
  flushDatabaseToDiskSync();

  return {
    budgets: listBudgets(db),
    categories: listCategories(db),
    goals: listGoals(db),
    recurringPayments: listRecurringPayments(db),
    transactions: listTransactions(db),
  };
};

const listDomainData = async () => {
  const db = await ensureDatabaseReady();
  if (!db) {
    return {
      success: false,
      budgets: [],
      categories: [],
      goals: [],
      recurringPayments: [],
      transactions: [],
      status: buildStatus(),
      error: "SQLite driver недоступен.",
    };
  }

  return {
    success: true,
    budgets: listBudgets(db),
    categories: listCategories(db),
    goals: listGoals(db),
    recurringPayments: listRecurringPayments(db),
    transactions: listTransactions(db),
    status: buildStatus(),
  };
};

const createDomainEntity = async (entityType, payload) => {
  try {
    const db = await ensureDatabaseReady();
    if (!db) {
      return {
        success: false,
        status: buildStatus(),
        error: "SQLite driver недоступен.",
      };
    }

    let result;
    switch (entityType) {
      case "budget":
        result = {
          success: true,
          item: createBudget(db, payload),
          status: buildStatus(),
        };
        break;
      case "category":
        result = {
          success: true,
          item: createCategory(db, payload),
          status: buildStatus(),
        };
        break;
      case "goal":
        result = {
          success: true,
          item: createGoal(db, payload),
          status: buildStatus(),
        };
        break;
      case "recurringPayment":
        result = {
          success: true,
          item: createRecurringPayment(db, payload),
          status: buildStatus(),
        };
        break;
      case "transaction":
        result = {
          success: true,
          item: createTransaction(db, payload),
          status: buildStatus(),
        };
        break;
      default:
        result = {
          success: false,
          status: buildStatus(),
          error: `Неизвестный тип сущности: ${entityType}`,
        };
    }

    // better-sqlite3 уже сохранил данные на диск, делаем checkpoint для гарантии
    flushDatabaseToDiskSync();
    return result;
  } catch (error) {
    return {
      success: false,
      status: buildStatus(),
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

const updateDomainEntity = async (entityType, id, updates) => {
  try {
    const db = await ensureDatabaseReady();
    if (!db) {
      return {
        success: false,
        status: buildStatus(),
        error: "SQLite driver недоступен.",
      };
    }

    let result;
    switch (entityType) {
      case "budget":
        result = {
          success: true,
          item: updateBudget(db, id, updates),
          status: buildStatus(),
        };
        break;
      case "category":
        result = {
          success: true,
          item: updateCategory(db, id, updates),
          status: buildStatus(),
        };
        break;
      case "goal":
        result = {
          success: true,
          item: updateGoal(db, id, updates),
          status: buildStatus(),
        };
        break;
      case "recurringPayment":
        result = {
          success: true,
          item: updateRecurringPayment(db, id, updates),
          status: buildStatus(),
        };
        break;
      case "transaction":
        result = {
          success: true,
          item: updateTransaction(db, id, updates),
          status: buildStatus(),
        };
        break;
      default:
        result = {
          success: false,
          status: buildStatus(),
          error: `Неизвестный тип сущности: ${entityType}`,
        };
    }

    // better-sqlite3 уже сохранил данные на диск, делаем checkpoint для гарантии
    flushDatabaseToDiskSync();
    return result;
  } catch (error) {
    return {
      success: false,
      status: buildStatus(),
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

const deleteDomainEntity = async (entityType, id) => {
  try {
    const db = await ensureDatabaseReady();
    if (!db) {
      return {
        success: false,
        status: buildStatus(),
        error: "SQLite driver недоступен.",
      };
    }

    let result;
    switch (entityType) {
      case "budget":
        result = { success: deleteBudget(db, id), status: buildStatus() };
        break;
      case "category":
        result = { success: deleteCategory(db, id), status: buildStatus() };
        break;
      case "goal":
        result = { success: deleteGoal(db, id), status: buildStatus() };
        break;
      case "recurringPayment":
        result = {
          success: deleteRecurringPayment(db, id),
          status: buildStatus(),
        };
        break;
      case "transaction":
        result = { success: deleteTransaction(db, id), status: buildStatus() };
        break;
      default:
        result = {
          success: false,
          status: buildStatus(),
          error: `Неизвестный тип сущности: ${entityType}`,
        };
    }

    // better-sqlite3 уже сохранил данные на диск, делаем checkpoint для гарантии
    flushDatabaseToDiskSync();
    return result;
  } catch (error) {
    return {
      success: false,
      status: buildStatus(),
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

/**
 * Проверить наличие SQLite-файлов в указанной директории
 * @param {string} directoryPath - путь к директории для поиска
 * @returns {{ found: boolean, files: string[], defaultPath: string }}
 */
const checkExternalDatabase = (directoryPath) => {
  try {
    const validExtensions = [".db", ".sqlite", ".sqlite3"];
    const files = fs.readdirSync(directoryPath).filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return validExtensions.includes(ext);
    });

    return {
      found: files.length > 0,
      files,
      defaultPath: directoryPath,
    };
  } catch (error) {
    return {
      found: false,
      files: [],
      defaultPath: directoryPath,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

/**
 * Импортировать данные из внешнего SQLite-файла в текущую БД
 * @param {string} sourcePath - путь к внешнему SQLite-файлу
 * @returns {{ success: boolean, imported: object, errors: string[] }}
 */
/**
 * Получить список колонок таблицы во внешней БД
 */
const getTableColumns = (db, tableName) => {
  try {
    const result = db.prepare(`PRAGMA table_info(${tableName})`).all();
    return result.map((row) => row.name);
  } catch {
    return [];
  }
};

/**
 * Проверить, существует ли таблица во внешней БД
 */
const tableExists = (db, tableName) => {
  try {
    const result = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?")
      .get(tableName);
    return !!result;
  } catch {
    return false;
  }
};

/**
 * Импортировать данные из внешнего SQLite-файла в текущую БД
 * Автоматически определяет структуру таблиц во внешней БД
 * и подстраивает запросы под доступные колонки.
 *
 * @param {string} sourcePath - путь к внешнему SQLite-файлу
 * @returns {{ success: boolean, imported: object, errors: string[] }}
 */
const importFromExternalDatabase = async (sourcePath) => {
  const errors = [];
  const skipped = [];
  const imported = {
    transactions: 0,
    categories: 0,
    budgets: 0,
    goals: 0,
    recurringPayments: 0,
    appState: false,
  };

  try {
    // Проверяем существование файла
    if (!fs.existsSync(sourcePath)) {
      return {
        success: false,
        error: `Файл не найден: ${sourcePath}`,
        imported,
        errors: [`File not found: ${sourcePath}`],
      };
    }

    // Открываем внешнюю БД через better-sqlite3 (только для чтения)
    const Database = (await import("better-sqlite3")).default;
    const externalDb = new Database(sourcePath, { readonly: true });
    if (!externalDb || !externalDb.open) {
      return {
        success: false,
        error: "Не удалось открыть внешнюю БД",
        imported,
        errors: ["Failed to open external database"],
      };
    }

    // Получаем текущую БД через openDatabaseConnection (без миграций!)
    const currentDb = await openDatabaseConnection();
    if (!currentDb) {
      externalDb.close();
      return {
        success: false,
        error: "Текущая БД недоступна",
        imported,
        errors: ["Current database is unavailable"],
      };
    }

    // Импортируем в транзакции
    const importTransaction = currentDb.transaction(() => {
      // 1. Импорт категорий
      if (tableExists(externalDb, "categories")) {
        try {
          const extCols = getTableColumns(externalDb, "categories");
          const commonCols = [
            "id",
            "name",
            "type",
            "color",
            "parent",
            "budget",
            "created_at",
            "updated_at",
            "version",
          ].filter((col) => extCols.includes(col));

          if (commonCols.length > 0) {
            const colList = commonCols.join(", ");
            const paramList = commonCols.map((c) => `@${c}`).join(", ");
            const externalCategories = externalDb
              .prepare(`SELECT ${colList} FROM categories`)
              .all();

            for (const cat of externalCategories) {
              const existing = currentDb
                .prepare("SELECT id FROM categories WHERE id = ?")
                .get(cat.id);
              if (!existing) {
                // Заполняем отсутствующие колонки значениями по умолчанию
                if (!("version" in cat)) cat.version = 1;
                currentDb
                  .prepare(
                    `INSERT INTO categories (${colList}) VALUES (${paramList})`,
                  )
                  .run(cat);
                imported.categories++;
              }
            }
          }
        } catch (err) {
          errors.push(`Categories import error: ${err.message}`);
        }
      } else {
        skipped.push("categories");
      }

      // 2. Импорт транзакций
      if (tableExists(externalDb, "transactions")) {
        try {
          const extCols = getTableColumns(externalDb, "transactions");
          const commonCols = [
            "id",
            "type",
            "amount",
            "category",
            "description",
            "date",
            "tags_json",
            "is_recurring",
            "recurring_id",
            "created_at",
            "updated_at",
            "version",
          ].filter((col) => extCols.includes(col));

          if (commonCols.length > 0) {
            const colList = commonCols.join(", ");
            const paramList = commonCols.map((c) => `@${c}`).join(", ");
            const externalTransactions = externalDb
              .prepare(`SELECT ${colList} FROM transactions`)
              .all();

            for (const tx of externalTransactions) {
              const existing = currentDb
                .prepare("SELECT id FROM transactions WHERE id = ?")
                .get(tx.id);
              if (!existing) {
                if (!("version" in tx)) tx.version = 1;
                if (!("tags_json" in tx)) tx.tags_json = null;
                if (!("is_recurring" in tx)) tx.is_recurring = 0;
                currentDb
                  .prepare(
                    `INSERT INTO transactions (${colList}) VALUES (${paramList})`,
                  )
                  .run(tx);
                imported.transactions++;
              }
            }
          }
        } catch (err) {
          errors.push(`Transactions import error: ${err.message}`);
        }
      } else {
        skipped.push("transactions");
      }

      // 3. Импорт бюджетов
      if (tableExists(externalDb, "budgets")) {
        try {
          const extCols = getTableColumns(externalDb, "budgets");
          const commonCols = [
            "id",
            "category_id",
            "amount",
            "period",
            "spent",
            "remaining",
            "budget_group",
            "percentage",
            "created_at",
            "updated_at",
            "version",
          ].filter((col) => extCols.includes(col));

          if (commonCols.length > 0) {
            const colList = commonCols.join(", ");
            const paramList = commonCols.map((c) => `@${c}`).join(", ");
            const externalBudgets = externalDb
              .prepare(`SELECT ${colList} FROM budgets`)
              .all();

            for (const budget of externalBudgets) {
              const existing = currentDb
                .prepare("SELECT id FROM budgets WHERE id = ?")
                .get(budget.id);
              if (!existing) {
                if (!("version" in budget)) budget.version = 1;
                if (!("remaining" in budget)) budget.remaining = 0;
                currentDb
                  .prepare(
                    `INSERT INTO budgets (${colList}) VALUES (${paramList})`,
                  )
                  .run(budget);
                imported.budgets++;
              }
            }
          }
        } catch (err) {
          errors.push(`Budgets import error: ${err.message}`);
        }
      } else {
        skipped.push("budgets");
      }

      // 4. Импорт финансовых целей (таблица может отсутствовать в старой БД)
      if (tableExists(externalDb, "financial_goals")) {
        try {
          const extCols = getTableColumns(externalDb, "financial_goals");
          const commonCols = [
            "id",
            "name",
            "target_amount",
            "current_amount",
            "deadline",
            "monthly_contribution",
            "priority",
            "description",
            "inflation_rate",
            "adjust_for_inflation",
            "expected_return",
            "inflation_adjusted_target",
            "created_at",
            "updated_at",
            "version",
          ].filter((col) => extCols.includes(col));

          if (commonCols.length > 0) {
            const colList = commonCols.join(", ");
            const paramList = commonCols.map((c) => `@${c}`).join(", ");
            const externalGoals = externalDb
              .prepare(`SELECT ${colList} FROM financial_goals`)
              .all();

            for (const goal of externalGoals) {
              const existing = currentDb
                .prepare("SELECT id FROM financial_goals WHERE id = ?")
                .get(goal.id);
              if (!existing) {
                if (!("version" in goal)) goal.version = 1;
                currentDb
                  .prepare(
                    `INSERT INTO financial_goals (${colList}) VALUES (${paramList})`,
                  )
                  .run(goal);
                imported.goals++;
              }
            }
          }
        } catch (err) {
          errors.push(`Goals import error: ${err.message}`);
        }
      } else {
        skipped.push("financial_goals");
      }

      // 5. Импорт recurring payments
      if (tableExists(externalDb, "recurring_payments")) {
        try {
          const extCols = getTableColumns(externalDb, "recurring_payments");
          const commonCols = [
            "id",
            "name",
            "amount",
            "category",
            "frequency",
            "cron_expression",
            "next_date",
            "is_active",
            "description",
            "created_at",
            "updated_at",
            "version",
          ].filter((col) => extCols.includes(col));

          if (commonCols.length > 0) {
            const colList = commonCols.join(", ");
            const paramList = commonCols.map((c) => `@${c}`).join(", ");
            const externalPayments = externalDb
              .prepare(`SELECT ${colList} FROM recurring_payments`)
              .all();

            for (const payment of externalPayments) {
              const existing = currentDb
                .prepare("SELECT id FROM recurring_payments WHERE id = ?")
                .get(payment.id);
              if (!existing) {
                if (!("version" in payment)) payment.version = 1;
                currentDb
                  .prepare(
                    `INSERT INTO recurring_payments (${colList}) VALUES (${paramList})`,
                  )
                  .run(payment);
                imported.recurringPayments++;
              }
            }
          }
        } catch (err) {
          errors.push(`Recurring payments import error: ${err.message}`);
        }
      } else {
        skipped.push("recurring_payments");
      }

      // 6. Импорт app_state (только если таблица существует и в текущей БД нет данных)
      if (tableExists(externalDb, "app_state")) {
        try {
          const currentAppState = currentDb
            .prepare("SELECT id FROM app_state WHERE id = 1")
            .get();
          if (!currentAppState) {
            const extCols = getTableColumns(externalDb, "app_state");
            const commonCols = ["id", "payload", "updated_at"].filter((col) =>
              extCols.includes(col),
            );

            if (commonCols.length > 0) {
              const colList = commonCols.join(", ");
              const paramList = commonCols.map((c) => `@${c}`).join(", ");
              const externalAppState = externalDb
                .prepare(`SELECT ${colList} FROM app_state WHERE id = 1`)
                .get();

              if (externalAppState) {
                currentDb
                  .prepare(
                    `INSERT INTO app_state (${colList}) VALUES (${paramList})`,
                  )
                  .run(externalAppState);
                imported.appState = true;
              }
            }
          }
        } catch (err) {
          errors.push(`App state import error: ${err.message}`);
        }
      } else {
        skipped.push("app_state");
      }
    });

    importTransaction();

    // Закрываем внешнюю БД
    externalDb.close();

    // Для better-sqlite3 данные уже на диске, но делаем checkpoint
    flushDatabaseToDiskSync();

    return {
      success: true,
      imported,
      skipped: skipped.length > 0 ? skipped : undefined,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      imported,
      skipped: skipped.length > 0 ? skipped : undefined,
      errors: [
        ...errors,
        error instanceof Error ? error.message : String(error),
      ],
    };
  }
};

export {
  bootstrapDomainDataFromState,
  checkExternalDatabase,
  closeDatabaseConnection,
  closeDatabaseConnectionSync,
  createDomainEntity,
  deleteDomainEntity,
  ensureDatabaseReady,
  flushDatabaseToDiskSync,
  getStorageStatus,
  importFromExternalDatabase,
  listDomainData,
  loadPersistedAppState,
  savePersistedAppState,
  updateDomainEntity,
};

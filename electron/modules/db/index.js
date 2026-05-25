import { closeDatabaseConnection, getDatabaseStatus, openDatabaseConnection } from './driver.js';
import { runMigrations } from './migrate.js';
import { loadAppStateRecord, saveAppStateRecord } from './repositories/appStateRepository.js';
import {
  countBudgets,
  createBudget,
  deleteBudget,
  listBudgets,
  replaceBudgets,
  updateBudget,
} from './repositories/budgetsRepository.js';
import {
  countCategories,
  createCategory,
  deleteCategory,
  listCategories,
  replaceCategories,
  updateCategory,
} from './repositories/categoriesRepository.js';
import {
  countGoals,
  createGoal,
  deleteGoal,
  listGoals,
  replaceGoals,
  updateGoal,
} from './repositories/goalsRepository.js';
import {
  countRecurringPayments,
  createRecurringPayment,
  deleteRecurringPayment,
  listRecurringPayments,
  replaceRecurringPayments,
  updateRecurringPayment,
} from './repositories/recurringPaymentsRepository.js';
import {
  countTransactions,
  createTransaction,
  deleteTransaction,
  listTransactions,
  replaceTransactions,
  updateTransaction,
} from './repositories/transactionsRepository.js';

let hasPreparedDatabase = false;
let cachedMigrationInfo = null;

const ensureDatabaseReady = () => {
  const db = openDatabaseConnection();

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
    storage: driverStatus.available ? 'sqlite' : 'renderer-localStorage',
    migrations: cachedMigrationInfo,
  };
};

const getStorageStatus = () => {
  ensureDatabaseReady();
  return buildStatus();
};

const loadPersistedAppState = () => {
  try {
    const db = ensureDatabaseReady();
    if (!db) {
      return {
        success: false,
        state: null,
        status: buildStatus(),
        error: 'SQLite driver недоступен. Используется fallback на localStorage в renderer.',
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

const savePersistedAppState = (state) => {
  try {
    const db = ensureDatabaseReady();
    if (!db) {
      return {
        success: false,
        status: buildStatus(),
        error: 'SQLite driver недоступен. Данные будут сохранены только в localStorage renderer-процесса.',
      };
    }

    const result = saveAppStateRecord(db, state);

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

const bootstrapDomainDataFromState = (state) => {
  const db = ensureDatabaseReady();
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

  if (!hasCategories && Array.isArray(state.categories) && state.categories.length > 0) {
    replaceCategories(db, state.categories);
  }

  if (!hasGoals && Array.isArray(state.goals) && state.goals.length > 0) {
    replaceGoals(db, state.goals);
  }

  if (!hasRecurringPayments && Array.isArray(state.recurringPayments) && state.recurringPayments.length > 0) {
    replaceRecurringPayments(db, state.recurringPayments);
  }

  if (!hasTransactions && Array.isArray(state.transactions) && state.transactions.length > 0) {
    replaceTransactions(db, state.transactions);
  }

  return {
    budgets: listBudgets(db),
    categories: listCategories(db),
    goals: listGoals(db),
    recurringPayments: listRecurringPayments(db),
    transactions: listTransactions(db),
  };
};

const listDomainData = () => {
  const db = ensureDatabaseReady();
  if (!db) {
    return {
      success: false,
      budgets: [],
      categories: [],
      goals: [],
      recurringPayments: [],
      transactions: [],
      status: buildStatus(),
      error: 'SQLite driver недоступен.',
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

const createDomainEntity = (entityType, payload) => {
  try {
    const db = ensureDatabaseReady();
    if (!db) {
      return { success: false, status: buildStatus(), error: 'SQLite driver недоступен.' };
    }

    switch (entityType) {
      case 'budget':
        return { success: true, item: createBudget(db, payload), status: buildStatus() };
      case 'category':
        return { success: true, item: createCategory(db, payload), status: buildStatus() };
      case 'goal':
        return { success: true, item: createGoal(db, payload), status: buildStatus() };
      case 'recurringPayment':
        return { success: true, item: createRecurringPayment(db, payload), status: buildStatus() };
      case 'transaction':
        return { success: true, item: createTransaction(db, payload), status: buildStatus() };
      default:
        return { success: false, status: buildStatus(), error: `Неизвестный тип сущности: ${entityType}` };
    }
  } catch (error) {
    return { success: false, status: buildStatus(), error: error instanceof Error ? error.message : String(error) };
  }
};

const updateDomainEntity = (entityType, id, updates) => {
  try {
    const db = ensureDatabaseReady();
    if (!db) {
      return { success: false, status: buildStatus(), error: 'SQLite driver недоступен.' };
    }

    switch (entityType) {
      case 'budget':
        return { success: true, item: updateBudget(db, id, updates), status: buildStatus() };
      case 'category':
        return { success: true, item: updateCategory(db, id, updates), status: buildStatus() };
      case 'goal':
        return { success: true, item: updateGoal(db, id, updates), status: buildStatus() };
      case 'recurringPayment':
        return { success: true, item: updateRecurringPayment(db, id, updates), status: buildStatus() };
      case 'transaction':
        return { success: true, item: updateTransaction(db, id, updates), status: buildStatus() };
      default:
        return { success: false, status: buildStatus(), error: `Неизвестный тип сущности: ${entityType}` };
    }
  } catch (error) {
    return { success: false, status: buildStatus(), error: error instanceof Error ? error.message : String(error) };
  }
};

const deleteDomainEntity = (entityType, id) => {
  try {
    const db = ensureDatabaseReady();
    if (!db) {
      return { success: false, status: buildStatus(), error: 'SQLite driver недоступен.' };
    }

    switch (entityType) {
      case 'budget':
        return { success: deleteBudget(db, id), status: buildStatus() };
      case 'category':
        return { success: deleteCategory(db, id), status: buildStatus() };
      case 'goal':
        return { success: deleteGoal(db, id), status: buildStatus() };
      case 'recurringPayment':
        return { success: deleteRecurringPayment(db, id), status: buildStatus() };
      case 'transaction':
        return { success: deleteTransaction(db, id), status: buildStatus() };
      default:
        return { success: false, status: buildStatus(), error: `Неизвестный тип сущности: ${entityType}` };
    }
  } catch (error) {
    return { success: false, status: buildStatus(), error: error instanceof Error ? error.message : String(error) };
  }
};

export {
  bootstrapDomainDataFromState,
  closeDatabaseConnection,
  createDomainEntity,
  deleteDomainEntity,
  getStorageStatus,
  listDomainData,
  loadPersistedAppState,
  savePersistedAppState,
  updateDomainEntity,
};

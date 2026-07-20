/**
 * init-db.js — Скрипт инициализации базы данных
 *
 * Создаёт SQLite-файл БД и применяет все миграции.
 * Используется:
 *   1. При первом запуске приложения (через main.js с флагом --init-db)
 *   2. На этапе установки (через NSIS-установщик)
 *   3. Для диагностики — можно запустить вручную
 *
 * Запуск: npx electron . --init-db
 * Запуск из установленной версии: FinanceTracker.exe --init-db
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Инициализировать базу данных: создать файл БД и применить миграции
 * @param {object} app - Electron app объект
 * @returns {Promise<{success: boolean, path: string, error?: string}>}
 */
const initializeDatabase = async (app) => {
  const DB_DIRECTORY_NAME = "data";
  const DB_FILE_NAME = "finance-tracker.sqlite";

  const userDataPath = app.getPath("userData");
  const dbDirectory = path.join(userDataPath, DB_DIRECTORY_NAME);
  const dbPath = path.join(dbDirectory, DB_FILE_NAME);

  console.log(`[init-db] Initializing database at: ${dbPath}`);

  try {
    // 1. Создаём директорию для БД
    if (!fs.existsSync(dbDirectory)) {
      fs.mkdirSync(dbDirectory, { recursive: true });
      console.log(`[init-db] Created directory: ${dbDirectory}`);
    }

    // 2. Импортируем better-sqlite3
    const Database = (await import("better-sqlite3")).default;

    // 3. Создаём соединение с БД (файл создаётся автоматически)
    const db = new Database(dbPath, {
      // Оптимальные настройки для десктопного приложения
    });

    // 4. Устанавливаем прагмы
    db.pragma("journal_mode = WAL");
    db.pragma("synchronous = NORMAL");
    db.pragma("foreign_keys = ON");
    db.pragma("busy_timeout = 5000");
    db.pragma("cache_size = -64000"); // 64MB кэша

    console.log(`[init-db] Database connection opened successfully`);

    // 5. Применяем миграции
    const migrationsDir = path.join(
      __dirname,
      "..",
      "modules",
      "db",
      "migrations",
    );

    if (!fs.existsSync(migrationsDir)) {
      throw new Error(`Migrations directory not found: ${migrationsDir}`);
    }

    // Создаём таблицу миграций
    db.exec(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        applied_at TEXT NOT NULL
      );
    `);

    // Получаем список уже применённых миграций
    const appliedRows = db.prepare("SELECT name FROM schema_migrations").all();
    const appliedNames = new Set(appliedRows.map((row) => row.name));

    // Получаем файлы миграций
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((fileName) => fileName.endsWith(".sql"))
      .sort();

    console.log(
      `[init-db] Found ${migrationFiles.length} migration files: ${migrationFiles.join(", ")}`,
    );

    // Применяем миграции в транзакции
    const applyMigrations = db.transaction(() => {
      const registerMigration = db.prepare(
        "INSERT INTO schema_migrations (name, applied_at) VALUES (?, ?)",
      );

      for (const fileName of migrationFiles) {
        if (appliedNames.has(fileName)) {
          console.log(`[init-db] Migration already applied: ${fileName}`);
          continue;
        }

        const migrationSql = fs.readFileSync(
          path.join(migrationsDir, fileName),
          "utf8",
        );
        db.exec(migrationSql);
        registerMigration.run(fileName, new Date().toISOString());
        console.log(`[init-db] Applied migration: ${fileName}`);
      }
    });

    applyMigrations();

    // 6. Проверяем, что таблицы созданы
    const tables = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name",
      )
      .all();
    console.log(
      `[init-db] Database initialized. Tables: ${tables.map((t) => t.name).join(", ")}`,
    );

    // 7. Закрываем соединение
    db.pragma("wal_checkpoint(TRUNCATE)");
    db.close();

    console.log(`[init-db] Database initialized successfully at: ${dbPath}`);
    return { success: true, path: dbPath };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[init-db] Failed to initialize database: ${errorMsg}`);
    return { success: false, path: dbPath, error: errorMsg };
  }
};

export { initializeDatabase };
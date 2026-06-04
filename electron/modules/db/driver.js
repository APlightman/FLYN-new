/**
 * Database Driver — better-sqlite3 (Native SQLite)
 *
 * better-sqlite3 — это нативный модуль Node.js, который работает напрямую
 * с файлом БД. В отличие от sql.js (WebAssembly), better-sqlite3:
 * - Не требует явного сохранения на диск (каждая операция пишет сразу в файл)
 * - Работает в десятки раз быстрее
 * - Поддерживает WAL-режим для надёжности и производительности
 * - Надёжно сохраняет данные даже при аварийном завершении
 *
 * Все репозитории используют API better-sqlite3 напрямую,
 * поэтому адаптер (native-adapter.js) минимален.
 */

import fs from "fs";
import path from "path";
import { app } from "../electronRuntime.js";
import {
  createNativeConnection,
  closeNativeConnection,
  isConnectionOpen,
  getDatabaseFileSize,
} from "./native-adapter.js";

const DB_DIRECTORY_NAME = "data";
const DB_FILE_NAME = "finance-tracker.sqlite";

let dbConnection = null;
let dbInitialized = false;
let dbInitError = null;

const getDatabaseDirectory = () =>
  path.join(app.getPath("userData"), DB_DIRECTORY_NAME);

const getDatabasePath = () => path.join(getDatabaseDirectory(), DB_FILE_NAME);

/**
 * Открыть соединение с SQLite через better-sqlite3
 * better-sqlite3 — синхронный, поэтому функция синхронная.
 * Оставлена асинхронной для обратной совместимости с index.js.
 */
const openDatabaseConnection = async () => {
  if (dbConnection && isConnectionOpen(dbConnection)) {
    return dbConnection;
  }

  if (dbInitialized && !dbConnection) {
    // Уже пробовали инициализировать, но не получилось
    return null;
  }

  dbInitialized = true;

  try {
    fs.mkdirSync(getDatabaseDirectory(), { recursive: true });

    const dbPath = getDatabasePath();
    console.log(`[driver] Opening native SQLite database at: ${dbPath}`);

    dbConnection = createNativeConnection(dbPath);

    if (!dbConnection || !isConnectionOpen(dbConnection)) {
      dbInitError = "better-sqlite3: failed to create database connection";
      console.error("[driver]", dbInitError);
      return null;
    }

    const fileSize = getDatabaseFileSize(dbPath);
    console.log(
      `[driver] Native SQLite database opened successfully (file size: ${fileSize} bytes)`,
    );
    dbInitError = null;

    return dbConnection;
  } catch (error) {
    dbInitError = error instanceof Error ? error.message : String(error);
    console.error("[driver] Failed to open database:", dbInitError);
    return null;
  }
};

/**
 * Закрыть соединение с БД
 * better-sqlite3 автоматически сохраняет все данные при закрытии.
 */
const closeDatabaseConnection = async () => {
  if (dbConnection && isConnectionOpen(dbConnection)) {
    console.log("[driver] Closing database connection...");
    closeNativeConnection(dbConnection);
    console.log("[driver] Database connection closed");
  }
  dbConnection = null;
  dbInitialized = false;
};

/**
 * Синхронное закрытие соединения с БД (для before-quit)
 * better-sqlite3.close() — синхронный, поэтому гарантированно сохраняет данные.
 */
const closeDatabaseConnectionSync = () => {
  if (dbConnection && isConnectionOpen(dbConnection)) {
    console.log("[driver] Closing database connection (sync)...");
    closeNativeConnection(dbConnection);
    console.log("[driver] Database connection closed (sync)");
  }
  dbConnection = null;
  dbInitialized = false;
};

/**
 * Сохранить БД на диск.
 *
 * ВАЖНО: Для better-sqlite3 эта функция — no-op, так как better-sqlite3
 * пишет данные на диск синхронно при каждой операции.
 * Функция оставлена для обратной совместимости с index.js и ipcHandlers.js.
 *
 * better-sqlite3 использует WAL-режим, который гарантирует:
 * - Каждая транзакция сразу попадает в WAL-файл
 * - При аварийном завершении WAL автоматически восстанавливается
 * - Данные НИКОГДА не теряются
 */
const flushDatabaseToDiskSync = () => {
  if (dbConnection && isConnectionOpen(dbConnection)) {
    // better-sqlite3 уже сохранил все данные на диск.
    // Вызов checkpoint гарантирует, что WAL применён к основному файлу.
    try {
      dbConnection.pragma("wal_checkpoint(PASSIVE)");
    } catch (e) {
      // Не критично — данные уже в WAL
    }
    return true;
  }

  console.warn(
    "[driver] flushDatabaseToDiskSync skipped: dbConnection is " +
      (dbConnection ? "closed" : "null"),
  );
  return false;
};

/**
 * Пометить, что были несохранённые изменения.
 * Для better-sqlite3 это no-op, так как данные сохраняются сразу.
 * Оставлено для обратной совместимости.
 */
const markUnsavedChanges = () => {
  // better-sqlite3 не требует явного сохранения
};

/**
 * Получить статус БД
 */
const getDatabaseStatus = () => ({
  available: !!dbConnection && isConnectionOpen(dbConnection),
  usingSQLite: true,
  driver: "better-sqlite3 (native)",
  path: getDatabasePath(),
  initialized: !!dbConnection && isConnectionOpen(dbConnection),
  fallback: "renderer-localStorage",
  error: dbInitError,
  hasUnsavedChanges: false, // better-sqlite3 всегда сохраняет сразу
  autoSaveInterval: 0, // автосохранение не требуется
});

export {
  closeDatabaseConnection,
  closeDatabaseConnectionSync,
  flushDatabaseToDiskSync,
  getDatabasePath,
  getDatabaseStatus,
  markUnsavedChanges,
  openDatabaseConnection,
};

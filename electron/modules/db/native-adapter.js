/**
 * Native SQLite Adapter for better-sqlite3
 *
 * better-sqlite3 — это нативный модуль Node.js, который работает напрямую
 * с файлом БД. В отличие от sql.js (WebAssembly), better-sqlite3:
 * - Не требует явного сохранения на диск (каждая операция пишет сразу в файл)
 * - Работает в десятки раз быстрее
 * - Поддерживает WAL-режим для конкурентного доступа
 * - Надёжно сохраняет данные даже при аварийном завершении
 *
 * Все репозитории используют API better-sqlite3 напрямую,
 * поэтому адаптер минимален — только создание соединения и миграции.
 */

import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

/**
 * Создать соединение с БД через better-sqlite3
 * @param {string} dbPath - путь к файлу БД
 * @returns {object} соединение с БД (экземпляр Database)
 */
const createNativeConnection = (dbPath) => {
  // Создаём директорию, если не существует
  const dirPath = path.dirname(dbPath);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  console.log(`[native-adapter] Opening database at: ${dbPath}`);

  // Открываем БД с оптимальными настройками
  const db = new Database(dbPath, {
    // WAL-режим для производительности и надёжности
    // Каждая транзакция пишет в WAL, который автоматически
    // применяется к основному файлу
    nativeBinding: undefined, // использовать стандартный бинарник
  });

  // Оптимальные прагмы для десктопного приложения
  db.pragma("journal_mode = WAL");
  db.pragma("synchronous = NORMAL");
  db.pragma("foreign_keys = ON");
  db.pragma("busy_timeout = 5000");
  db.pragma("cache_size = -64000"); // 64MB кэша

  console.log(`[native-adapter] Database opened successfully (WAL mode)`);
  return db;
};

/**
 * Закрыть соединение с БД
 * @param {object} db - соединение с БД
 */
const closeNativeConnection = (db) => {
  if (db && !db.open) {
    console.log("[native-adapter] Database already closed");
    return;
  }

  try {
    if (db) {
      // Принудительно применяем WAL к основному файлу
      db.pragma("wal_checkpoint(TRUNCATE)");
      db.close();
      console.log("[native-adapter] Database connection closed");
    }
  } catch (error) {
    console.error("[native-adapter] Error closing database:", error.message);
  }
};

/**
 * Проверить, открыто ли соединение
 * @param {object} db - соединение с БД
 * @returns {boolean}
 */
const isConnectionOpen = (db) => {
  return db && db.open === true;
};

/**
 * Выполнить SQL напрямую (для миграций)
 * @param {object} db - соединение с БД
 * @param {string} sql - SQL-запрос
 */
const execSQL = (db, sql) => {
  db.exec(sql);
};

/**
 * Получить размер файла БД
 * @param {string} dbPath - путь к файлу БД
 * @returns {number} размер в байтах
 */
const getDatabaseFileSize = (dbPath) => {
  try {
    if (fs.existsSync(dbPath)) {
      const stats = fs.statSync(dbPath);
      return stats.size;
    }
  } catch (error) {
    console.error(`[native-adapter] Error getting file size: ${error.message}`);
  }
  return 0;
};

export {
  closeNativeConnection,
  createNativeConnection,
  execSQL,
  getDatabaseFileSize,
  isConnectionOpen,
};

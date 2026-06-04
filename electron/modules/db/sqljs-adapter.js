/**
 * sql.js Adapter for better-sqlite3 compatible API
 *
 * sql.js — это WebAssembly-версия SQLite, которая не требует нативных модулей.
 * Этот адаптер эмулирует API better-sqlite3, чтобы все существующие репозитории
 * могли работать без изменений.
 *
 * Эмулируемые методы:
 *   db.prepare(sql).all()     -> массив объектов
 *   db.prepare(sql).get()     -> один объект или undefined
 *   db.prepare(sql).run(params) -> { changes: number, lastInsertRowid: number }
 *   db.transaction(fn)        -> обёртка в транзакцию
 *   db.exec(sql)              -> выполнить SQL (без результата)
 *   db.pragma(key, value)     -> установить прагму
 *   db.close()                -> закрыть соединение
 */

import initSqlJs from "sql.js";
import fs from "fs";
import path from "path";

let SQL = null;

/**
 * Инициализировать sql.js (загружает WASM)
 */
const ensureSqlJsInitialized = async () => {
  if (!SQL) {
    SQL = await initSqlJs({
      locateFile: (file) =>
        new URL(`../../../node_modules/sql.js/dist/${file}`, import.meta.url)
          .href,
    });
  }
  return SQL;
};

/**
 * Эмуляция prepared statement для better-sqlite3
 */
class PreparedStatement {
  constructor(db, sql) {
    this._db = db;
    this._sql = sql;
    this._stmt = null;
  }

  _ensurePrepared() {
    if (!this._stmt) {
      this._stmt = this._db._getSqliteDb().prepare(this._sql);
    }
    return this._stmt;
  }

  all(params) {
    const stmt = this._ensurePrepared();
    if (params !== undefined && params !== null) {
      stmt.bind(this._normalizeParams(params));
    }
    const rows = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
    stmt.reset();
    return rows;
  }

  get(params) {
    const stmt = this._ensurePrepared();
    if (params !== undefined && params !== null) {
      stmt.bind(this._normalizeParams(params));
    }
    const hasRow = stmt.step();
    if (hasRow) {
      const row = stmt.getAsObject();
      stmt.reset();
      return row;
    }
    stmt.reset();
    return undefined;
  }

  run(params) {
    const stmt = this._ensurePrepared();
    if (params !== undefined && params !== null) {
      stmt.bind(this._normalizeParams(params));
    }
    stmt.step();
    stmt.reset();
    return {
      changes: this._db._getSqliteDb().getRowsModified(),
      lastInsertRowid:
        this._db._getSqliteDb().exec("SELECT last_insert_rowid() as id")[0]
          ?.values?.[0]?.[0] ?? 0,
    };
  }

  _normalizeParams(params) {
    if (params === null || params === undefined) {
      return [];
    }
    if (Array.isArray(params)) {
      return params;
    }
    if (typeof params === "object") {
      return params;
    }
    return [params];
  }
}

/**
 * Эмуляция better-sqlite3 соединения
 */
class SqlJsDatabase {
  constructor(sqliteDb) {
    this._sqliteDb = sqliteDb;
    this._isClosed = false;
  }

  _getSqliteDb() {
    return this._sqliteDb;
  }

  prepare(sql) {
    return new PreparedStatement(this, sql);
  }

  exec(sql) {
    this._sqliteDb.exec(sql);
  }

  pragma(key, value) {
    if (value !== undefined) {
      this.exec(`PRAGMA ${key} = ${value};`);
    } else {
      const result = this.prepare(`PRAGMA ${key};`).get();
      return result?.value ?? result?.[key];
    }
  }

  transaction(fn) {
    const self = this;
    return function (...args) {
      self.exec("BEGIN TRANSACTION;");
      try {
        const result = fn(...args);
        self.exec("COMMIT;");
        return result;
      } catch (error) {
        self.exec("ROLLBACK;");
        throw error;
      }
    };
  }

  close() {
    if (!this._isClosed) {
      this._sqliteDb.close();
      this._isClosed = true;
    }
  }

  get isClosed() {
    return this._isClosed;
  }
}

/**
 * Создать новое SQLite соединение через sql.js
 * @param {string} dbPath - путь к файлу БД
 * @returns {SqlJsDatabase|null}
 */
const createSqlJsConnection = async (dbPath) => {
  try {
    const SqlJs = await ensureSqlJsInitialized();

    let sqliteDb;
    try {
      const buffer = fs.readFileSync(dbPath);
      sqliteDb = new SqlJs.Database(buffer);
      console.log(
        `[sqljs-adapter] Loaded existing database from: ${dbPath} (${buffer.length} bytes)`,
      );
    } catch {
      sqliteDb = new SqlJs.Database();
      console.log(
        `[sqljs-adapter] Created new in-memory database (no existing file at: ${dbPath})`,
      );
    }

    const db = new SqlJsDatabase(sqliteDb);
    db.exec("PRAGMA foreign_keys = ON;");

    return db;
  } catch (error) {
    console.error(
      "[sqljs-adapter] Failed to create database connection:",
      error,
    );
    return null;
  }
};

/**
 * Сохранить БД на диск (sql.js хранит всё в памяти, нужно явно сохранять)
 * @param {SqlJsDatabase} db
 * @param {string} dbPath
 * @returns {Promise<boolean>}
 */
const saveDatabaseToDisk = async (db, dbPath) => {
  try {
    if (!db || !db._getSqliteDb) {
      console.error(
        "[sqljs-adapter] saveDatabaseToDisk: db is null or invalid",
      );
      return false;
    }

    const sqliteDb = db._getSqliteDb();
    if (!sqliteDb) {
      console.error(
        "[sqljs-adapter] saveDatabaseToDisk: internal sqlite db is null",
      );
      return false;
    }

    const data = sqliteDb.export();
    if (!data || data.length === 0) {
      console.error(
        "[sqljs-adapter] saveDatabaseToDisk: exported data is empty (length=0)",
      );
      return false;
    }

    const buffer = Buffer.from(data);
    const dirPath = path.dirname(dbPath);

    // Создаём директорию, если её нет
    fs.mkdirSync(dirPath, { recursive: true });

    // Проверяем, существует ли уже файл
    const fileExists = fs.existsSync(dbPath);
    const oldSize = fileExists ? fs.statSync(dbPath).size : 0;

    // Пишем во временный файл, затем переименовываем (атомарная запись)
    const tmpPath = dbPath + ".tmp";
    fs.writeFileSync(tmpPath, buffer);
    fs.renameSync(tmpPath, dbPath);

    const newSize = fs.statSync(dbPath).size;

    console.log(
      `[sqljs-adapter] Database saved to disk: ${dbPath} ` +
        `(${(buffer.length / 1024).toFixed(1)} KB, ` +
        `was ${fileExists ? (oldSize / 1024).toFixed(1) + " KB" : "new file"}, ` +
        `now ${(newSize / 1024).toFixed(1)} KB)`,
    );

    return true;
  } catch (error) {
    console.error("[sqljs-adapter] Failed to save database to disk:", error);
    if (error instanceof Error) {
      console.error("[sqljs-adapter] Stack:", error.stack);
    }
    return false;
  }
};

/**
 * Синхронная версия saveDatabaseToDisk для использования в before-quit
 * @param {SqlJsDatabase} db
 * @param {string} dbPath
 * @returns {boolean}
 */
const saveDatabaseToDiskSync = (db, dbPath) => {
  try {
    if (!db || !db._getSqliteDb) {
      console.error(
        "[sqljs-adapter] saveDatabaseToDiskSync: db is null or invalid",
      );
      return false;
    }

    const sqliteDb = db._getSqliteDb();
    if (!sqliteDb) {
      console.error(
        "[sqljs-adapter] saveDatabaseToDiskSync: internal sqlite db is null",
      );
      return false;
    }

    const data = sqliteDb.export();
    if (!data || data.length === 0) {
      console.error(
        "[sqljs-adapter] saveDatabaseToDiskSync: exported data is empty",
      );
      return false;
    }

    const buffer = Buffer.from(data);
    const dirPath = path.dirname(dbPath);

    fs.mkdirSync(dirPath, { recursive: true });

    const tmpPath = dbPath + ".tmp";
    fs.writeFileSync(tmpPath, buffer);
    fs.renameSync(tmpPath, dbPath);

    console.log(
      `[sqljs-adapter] Database saved to disk (sync): ${dbPath} ` +
        `(${(buffer.length / 1024).toFixed(1)} KB)`,
    );

    return true;
  } catch (error) {
    console.error(
      "[sqljs-adapter] Failed to save database to disk (sync):",
      error,
    );
    return false;
  }
};

export { createSqlJsConnection, saveDatabaseToDisk, saveDatabaseToDiskSync };

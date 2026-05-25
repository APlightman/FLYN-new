import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { app } from '../electronRuntime.js';

const require = createRequire(import.meta.url);

const DB_DIRECTORY_NAME = 'data';
const DB_FILE_NAME = 'finance-tracker.sqlite';

let BetterSqlite3;
let hasAttemptedDriverLoad = false;
let cachedConnection = null;
let cachedDriverError = null;

const getDatabaseDirectory = () => path.join(app.getPath('userData'), DB_DIRECTORY_NAME);

const getDatabasePath = () => path.join(getDatabaseDirectory(), DB_FILE_NAME);

const loadDriver = () => {
  if (hasAttemptedDriverLoad) {
    return BetterSqlite3 ?? null;
  }

  hasAttemptedDriverLoad = true;

  try {
    const requiredModule = require('better-sqlite3');
    BetterSqlite3 = requiredModule.default ?? requiredModule;
    cachedDriverError = null;
  } catch (error) {
    BetterSqlite3 = null;
    cachedDriverError = error instanceof Error ? error.message : String(error);
  }

  return BetterSqlite3;
};

const openDatabaseConnection = () => {
  if (cachedConnection) {
    return cachedConnection;
  }

  const SqliteDriver = loadDriver();
  if (!SqliteDriver) {
    return null;
  }

  fs.mkdirSync(getDatabaseDirectory(), { recursive: true });

  cachedConnection = new SqliteDriver(getDatabasePath());
  cachedConnection.pragma('journal_mode = WAL');
  cachedConnection.pragma('foreign_keys = ON');

  return cachedConnection;
};

const closeDatabaseConnection = () => {
  if (!cachedConnection) {
    return;
  }

  cachedConnection.close();
  cachedConnection = null;
};

const getDatabaseStatus = () => ({
  available: !!loadDriver(),
  usingSQLite: !!BetterSqlite3,
  driver: 'better-sqlite3',
  path: getDatabasePath(),
  initialized: !!cachedConnection,
  fallback: 'renderer-localStorage',
  error: cachedDriverError,
});

export { openDatabaseConnection, closeDatabaseConnection, getDatabasePath, getDatabaseStatus };

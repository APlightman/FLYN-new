import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDirectory = path.join(__dirname, 'migrations');

const ensureMigrationTable = (db) => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at TEXT NOT NULL
    );
  `);
};

const getMigrationFiles = () => {
  if (!fs.existsSync(migrationsDirectory)) {
    return [];
  }

  return fs.readdirSync(migrationsDirectory)
    .filter(fileName => fileName.endsWith('.sql'))
    .sort();
};

const runMigrations = (db) => {
  ensureMigrationTable(db);

  const appliedRows = db.prepare('SELECT name FROM schema_migrations').all();
  const appliedNames = new Set(appliedRows.map(row => row.name));
  const registerMigration = db.prepare(
    'INSERT INTO schema_migrations (name, applied_at) VALUES (?, ?)'
  );

  const appliedNow = [];
  const migrationFiles = getMigrationFiles();

  const applyMigrations = db.transaction((files) => {
    files.forEach((fileName) => {
      if (appliedNames.has(fileName)) {
        return;
      }

      const migrationSql = fs.readFileSync(path.join(migrationsDirectory, fileName), 'utf8');
      db.exec(migrationSql);
      registerMigration.run(fileName, new Date().toISOString());
      appliedNow.push(fileName);
    });
  });

  applyMigrations(migrationFiles);

  return {
    applied: appliedNow,
    totalKnown: migrationFiles.length,
  };
};

export { runMigrations };

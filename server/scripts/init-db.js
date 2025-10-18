const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

// Создаем пул подключений к базе данных
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Функция для выполнения SQL файла
async function executeSqlFile(filePath) {
  try {
    // Читаем содержимое SQL файла
    const sql = fs.readFileSync(filePath, 'utf8');
    
    // Выполняем SQL запросы
    const client = await pool.connect();
    try {
      await client.query(sql);
      console.log(`Successfully executed ${path.basename(filePath)}`);
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(`Error executing ${path.basename(filePath)}:`, err);
    throw err;
  }
}

// Основная функция инициализации базы данных
async function initDatabase() {
  console.log('Initializing database...');
  
  try {
    // Путь к файлу миграции
    const migrationPath = path.join(__dirname, '..', 'migrations', 'init.sql');
    
    // Проверяем, существует ли файл миграции
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found: ${migrationPath}`);
    }
    
    // Выполняем миграцию
    await executeSqlFile(migrationPath);
    
    console.log('Database initialization completed successfully!');
  } catch (err) {
    console.error('Database initialization failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Выполняем инициализацию, если скрипт запущен напрямую
if (require.main === module) {
  initDatabase();
}

module.exports = { initDatabase };
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.NETLIFY_DATABASE_URL);

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

export const handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    console.log('Starting database health check...');
    
    // Проверяем подключение к БД
    const startTime = Date.now();
    
    // Простой запрос для проверки подключения
    const connectionTest = await sql`SELECT 1 as test`;
    const connectionTime = Date.now() - startTime;
    
    // Проверяем существование основных таблиц
    const tablesCheck = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('profiles', 'transactions', 'categories', 'budgets', 'goals', 'recurring_payments')
      ORDER BY table_name
    `;
    
    const expectedTables = ['budgets', 'categories', 'goals', 'profiles', 'recurring_payments', 'transactions'];
    const existingTables = tablesCheck.map(t => t.table_name);
    const missingTables = expectedTables.filter(table => !existingTables.includes(table));
    
    // Проверяем количество записей в каждой таблице
    const tableStats = {};
    for (const table of existingTables) {
      try {
        const count = await sql`SELECT COUNT(*) as count FROM ${sql(table)}`;
        tableStats[table] = parseInt(count[0].count);
      } catch (error) {
        tableStats[table] = `Error: ${error.message}`;
      }
    }
    
    // Проверяем версию PostgreSQL
    const versionCheck = await sql`SELECT version()`;
    const dbVersion = versionCheck[0].version;
    
    // Проверяем размер БД
    const sizeCheck = await sql`
      SELECT pg_size_pretty(pg_database_size(current_database())) as size
    `;
    const dbSize = sizeCheck[0].size;
    
    // Проверяем активные подключения
    const connectionsCheck = await sql`
      SELECT count(*) as active_connections 
      FROM pg_stat_activity 
      WHERE state = 'active'
    `;
    const activeConnections = parseInt(connectionsCheck[0].active_connections);
    
    const healthStatus = {
      status: missingTables.length === 0 ? 'healthy' : 'warning',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        connectionTime: `${connectionTime}ms`,
        version: dbVersion,
        size: dbSize,
        activeConnections
      },
      schema: {
        expectedTables: expectedTables.length,
        existingTables: existingTables.length,
        missingTables,
        tableStats
      },
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        netlifyRegion: process.env.AWS_REGION || 'unknown'
      }
    };
    
    console.log('Database health check completed successfully');
    
    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(healthStatus, null, 2)
    };

  } catch (error) {
    console.error('Database health check failed:', error);
    
    const errorResponse = {
      status: 'error',
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        code: error.code || 'UNKNOWN',
        details: error.detail || null
      },
      database: {
        connected: false,
        connectionTime: null
      },
      troubleshooting: {
        commonCauses: [
          'Database URL not configured in environment variables',
          'Database is sleeping (Neon free tier)',
          'Network connectivity issues',
          'Database credentials expired'
        ],
        nextSteps: [
          'Check NETLIFY_DATABASE_URL environment variable',
          'Verify database is not paused in Neon dashboard',
          'Try running init-database function first'
        ]
      }
    };
    
    return {
      statusCode: 503,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(errorResponse, null, 2)
    };
  }
};

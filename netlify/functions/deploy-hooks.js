// Webhook для автоматических действий после деплоя
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.NETLIFY_DATABASE_URL);

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Netlify-Event-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export const handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Only POST method allowed' })
    };
  }

  try {
    const eventType = event.headers['x-netlify-event-type'];
    const deployContext = process.env.CONTEXT;
    
    console.log('Deploy hook triggered:', {
      eventType,
      deployContext,
      deployId: process.env.DEPLOY_ID,
      site: process.env.SITE_NAME
    });

    // Выполняем действия только для production деплоев
    if (deployContext !== 'production') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          skipped: true,
          reason: `Skipping auto-init for ${deployContext} context`,
          deployContext
        })
      };
    }

    if (!process.env.NETLIFY_DATABASE_URL) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          skipped: true,
          reason: 'Neon database not configured',
          instructions: [
            'Install Neon extension in Netlify dashboard',
            'Redeploy to trigger auto-initialization'
          ]
        })
      };
    }

    // Проверяем, нужна ли инициализация
    const tablesCheck = await sql`
      SELECT COUNT(*) as count
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('profiles', 'transactions', 'categories', 'budgets', 'goals', 'recurring_payments')
    `;

    const existingTablesCount = parseInt(tablesCheck[0].count);
    const needsInit = existingTablesCount < 6;

    if (!needsInit) {
      console.log('Database already initialized, skipping');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          skipped: true,
          reason: 'Database already initialized',
          tablesFound: existingTablesCount
        })
      };
    }

    console.log('Database needs initialization, starting process...');

    // Выполняем инициализацию
    const siteUrl = process.env.URL || process.env.DEPLOY_URL;
    
    // Инициализация схемы
    console.log('Calling init-database...');
    const initResponse = await fetch(`${siteUrl}/.netlify/functions/init-database`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const initResult = await initResponse.json();

    if (!initResult.success) {
      throw new Error(`Schema initialization failed: ${initResult.error}`);
    }

    // Добавление seed данных
    console.log('Calling seed-data...');
    const seedResponse = await fetch(`${siteUrl}/.netlify/functions/seed-data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const seedResult = await seedResponse.json();

    console.log('Auto-initialization completed successfully');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        actions: {
          schemaInit: initResult,
          dataSeeding: seedResult
        },
        environment: {
          deployContext,
          deployId: process.env.DEPLOY_ID,
          site: process.env.SITE_NAME,
          region: process.env.AWS_REGION
        },
        message: 'Database automatically initialized and seeded for production deploy'
      })
    };

  } catch (error) {
    console.error('Deploy hook failed:', error);
    
    // Не блокируем деплой при ошибке БД
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        note: 'Deploy completed despite database error - manual initialization may be required'
      })
    };
  }
};

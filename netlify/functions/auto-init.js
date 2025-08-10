import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.NETLIFY_DATABASE_URL);

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

export const handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  console.log('Auto-initialization triggered');
  console.log('Environment check:', {
    hasNeonUrl: !!process.env.NETLIFY_DATABASE_URL,
    deployContext: process.env.CONTEXT,
    deployId: process.env.DEPLOY_ID
  });

  try {
    // Проверяем, настроена ли база данных
    if (!process.env.NETLIFY_DATABASE_URL) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          skipped: true,
          reason: 'NETLIFY_DATABASE_URL not configured',
          message: 'Database initialization skipped - Neon integration not detected',
          instructions: [
            'Go to Netlify dashboard → Project → Extensions',
            'Install Neon database extension',
            'Redeploy the site to trigger auto-initialization'
          ]
        })
      };
    }

    // Шаг 1: Проверяем подключение
    console.log('Testing database connection...');
    const connectionTest = await sql`SELECT 1 as test`;
    console.log('Database connection successful');

    // Шаг 2: Проверяем существование схемы
    console.log('Checking existing schema...');
    const tablesCheck = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('profiles', 'transactions', 'categories', 'budgets', 'goals', 'recurring_payments')
    `;
    
    const existingTables = tablesCheck.map(t => t.table_name);
    const needsInit = existingTables.length === 0;

    let initResult = { success: true, message: 'Schema already exists' };
    let seedResult = { success: true, message: 'Data already seeded' };

    // Шаг 3: Инициализация схемы если нужно
    if (needsInit) {
      console.log('Initializing database schema...');
      
      const initResponse = await fetch(`${context.awsRequestId ? 'https://' + event.headers.host : 'http://localhost:8888'}/.netlify/functions/init-database`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      initResult = await initResponse.json();
      
      if (initResult.success) {
        console.log('Database schema initialized successfully');
        
        // Шаг 4: Добавление seed данных
        console.log('Adding default data...');
        const seedResponse = await fetch(`${context.awsRequestId ? 'https://' + event.headers.host : 'http://localhost:8888'}/.netlify/functions/seed-data`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        
        seedResult = await seedResponse.json();
        console.log('Default data seeded successfully');
      }
    }

    // Финальная проверка здоровья БД
    const finalCheck = await sql`
      SELECT 
        COUNT(*) FILTER (WHERE table_name = 'profiles') as profiles,
        COUNT(*) FILTER (WHERE table_name = 'categories') as categories,
        COUNT(*) FILTER (WHERE table_name = 'transactions') as transactions,
        COUNT(*) FILTER (WHERE table_name = 'budgets') as budgets,
        COUNT(*) FILTER (WHERE table_name = 'goals') as goals,
        COUNT(*) FILTER (WHERE table_name = 'recurring_payments') as recurring_payments
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;

    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      actions: {
        schemaInit: initResult,
        dataSeeding: seedResult
      },
      finalStatus: {
        tablesCreated: Object.values(finalCheck[0]).filter(count => count > 0).length,
        totalExpected: 6,
        databaseReady: Object.values(finalCheck[0]).every(count => count > 0)
      },
      environment: {
        deployContext: process.env.CONTEXT || 'unknown',
        deployId: process.env.DEPLOY_ID || 'unknown',
        netlifyRegion: process.env.AWS_REGION || 'unknown'
      },
      nextSteps: [
        'Database is ready for use',
        'Visit /admin/health for detailed monitoring',
        'Access the admin panel in Settings → Database'
      ]
    };

    console.log('Auto-initialization completed:', response);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response, null, 2)
    };

  } catch (error) {
    console.error('Auto-initialization failed:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        troubleshooting: {
          possibleCauses: [
            'Neon database is sleeping (free tier)',
            'NETLIFY_DATABASE_URL is incorrect',
            'Network connectivity issues',
            'Database credentials expired'
          ],
          solutions: [
            'Check Netlify dashboard → Project → Environment Variables',
            'Verify Neon database is not paused',
            'Try manual initialization via /admin/init-db',
            'Contact support if issue persists'
          ]
        }
      }, null, 2)
    };
  }
};

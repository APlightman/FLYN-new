import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.NETLIFY_DATABASE_URL);

// Default categories for new users
const DEFAULT_CATEGORIES = [
  { name: 'Продукты', type: 'expense', color: '#ef4444' },
  { name: 'Транспорт', type: 'expense', color: '#f97316' },
  { name: 'Развлечения', type: 'expense', color: '#eab308' },
  { name: 'Коммунальные услуги', type: 'expense', color: '#06b6d4' },
  { name: 'Здоровье', type: 'expense', color: '#8b5cf6' },
  { name: 'Одежда', type: 'expense', color: '#ec4899' },
  { name: 'Образование', type: 'expense', color: '#10b981' },
  { name: 'Зарплата', type: 'income', color: '#22c55e' },
  { name: 'Подработка', type: 'income', color: '#10b981' },
  { name: 'Инвестиции', type: 'income', color: '#3b82f6' },
];

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  try {
    console.log('Seeding default data...');

    // Check if categories already exist
    const existingCategories = await sql`
      SELECT COUNT(*) as count FROM categories WHERE user_id IS NULL
    `;

    if (existingCategories[0].count > 0) {
      console.log('Default categories already exist, skipping seed');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Default data already exists',
          timestamp: new Date().toISOString()
        })
      };
    }

    // Insert default categories (global, no user_id)
    for (const category of DEFAULT_CATEGORIES) {
      await sql`
        INSERT INTO categories (name, type, color, user_id)
        VALUES (${category.name}, ${category.type}::transaction_type, ${category.color}, NULL)
        ON CONFLICT (name) WHERE user_id IS NULL DO NOTHING
      `;
    }

    console.log(`Seeded ${DEFAULT_CATEGORIES.length} default categories`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: `Seeded ${DEFAULT_CATEGORIES.length} default categories`,
        categories: DEFAULT_CATEGORIES.length,
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('Data seeding error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};
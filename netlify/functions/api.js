import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.NETLIFY_DATABASE_URL);

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

export const handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  const path = event.path.replace('/.netlify/functions/api', '');
  const method = event.httpMethod;
  const body = event.body ? JSON.parse(event.body) : null;
  
  // Simple user identification (in production, use proper auth)
  const userId = event.headers['x-user-id'] || 'anonymous';

  try {
    switch (path) {
      case '/transactions':
        return await handleTransactions(method, body, userId);
      case '/categories':
        return await handleCategories(method, body, userId);
      case '/budgets':
        return await handleBudgets(method, body, userId);
      case '/goals':
        return await handleGoals(method, body, userId);
      case '/recurring-payments':
        return await handleRecurringPayments(method, body, userId);
      default:
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Endpoint not found' })
        };
    }
  } catch (error) {
    console.error('API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};

async function handleTransactions(method, body, userId) {
  switch (method) {
    case 'GET':
      const transactions = await sql`
        SELECT * FROM transactions 
        WHERE user_id = ${userId} 
        ORDER BY date DESC, created_at DESC
      `;
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(transactions)
      };

    case 'POST':
      const { type, amount, category, description, date, tags } = body;
      const newTransaction = await sql`
        INSERT INTO transactions (user_id, type, amount, category, description, date, tags)
        VALUES (${userId}, ${type}::transaction_type, ${amount}, ${category}, ${description}, ${date}, ${tags || null})
        RETURNING *
      `;
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(newTransaction[0])
      };

    case 'PUT':
      const { id, ...updates } = body;
      const updatedTransaction = await sql`
        UPDATE transactions 
        SET ${sql(updates, 'type', 'amount', 'category', 'description', 'date', 'tags')}, updated_at = now()
        WHERE id = ${id} AND user_id = ${userId}
        RETURNING *
      `;
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(updatedTransaction[0])
      };

    case 'DELETE':
      const { id: deleteId } = body;
      await sql`
        DELETE FROM transactions 
        WHERE id = ${deleteId} AND user_id = ${userId}
      `;
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true })
      };
  }
}

async function handleCategories(method, body, userId) {
  switch (method) {
    case 'GET':
      // Get both user categories and default categories
      const categories = await sql`
        SELECT * FROM categories 
        WHERE user_id = ${userId} OR user_id IS NULL
        ORDER BY created_at ASC
      `;
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(categories)
      };

    case 'POST':
      const { name, type, color, parent, budget } = body;
      const newCategory = await sql`
        INSERT INTO categories (user_id, name, type, color, parent, budget)
        VALUES (${userId}, ${name}, ${type}::transaction_type, ${color}, ${parent || null}, ${budget || null})
        RETURNING *
      `;
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(newCategory[0])
      };
  }
}

async function handleBudgets(method, body, userId) {
  switch (method) {
    case 'GET':
      const budgets = await sql`
        SELECT * FROM budgets 
        WHERE user_id = ${userId} 
        ORDER BY created_at DESC
      `;
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(budgets)
      };

    case 'POST':
      const { category_id, amount, period } = body;
      const newBudget = await sql`
        INSERT INTO budgets (user_id, category_id, amount, period)
        VALUES (${userId}, ${category_id}, ${amount}, ${period}::budget_period)
        RETURNING *
      `;
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(newBudget[0])
      };
  }
}

async function handleGoals(method, body, userId) {
  switch (method) {
    case 'GET':
      const goals = await sql`
        SELECT * FROM goals 
        WHERE user_id = ${userId} 
        ORDER BY deadline ASC
      `;
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(goals)
      };

    case 'POST':
      const { name, target_amount, current_amount, deadline, monthly_contribution, priority, description } = body;
      const newGoal = await sql`
        INSERT INTO goals (user_id, name, target_amount, current_amount, deadline, monthly_contribution, priority, description)
        VALUES (${userId}, ${name}, ${target_amount}, ${current_amount || 0}, ${deadline}, ${monthly_contribution}, ${priority}::goal_priority, ${description || null})
        RETURNING *
      `;
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(newGoal[0])
      };
  }
}

async function handleRecurringPayments(method, body, userId) {
  switch (method) {
    case 'GET':
      const payments = await sql`
        SELECT * FROM recurring_payments 
        WHERE user_id = ${userId} 
        ORDER BY next_date ASC
      `;
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(payments)
      };

    case 'POST':
      const { name, amount, category, frequency, cron_expression, next_date, is_active, description } = body;
      const newPayment = await sql`
        INSERT INTO recurring_payments (user_id, name, amount, category, frequency, cron_expression, next_date, is_active, description)
        VALUES (${userId}, ${name}, ${amount}, ${category}, ${frequency}::payment_frequency, ${cron_expression || null}, ${next_date}, ${is_active || true}, ${description || null})
        RETURNING *
      `;
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(newPayment[0])
      };
  }
}
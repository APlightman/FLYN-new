import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.NETLIFY_DATABASE_URL);

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
    console.log('Initializing FinanceTracker database schema...');

    // Create custom types
    await sql`
      DO $$ BEGIN
        CREATE TYPE transaction_type AS ENUM ('income', 'expense');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    await sql`
      DO $$ BEGIN
        CREATE TYPE budget_period AS ENUM ('monthly', 'yearly');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    await sql`
      DO $$ BEGIN
        CREATE TYPE goal_priority AS ENUM ('low', 'medium', 'high');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    await sql`
      DO $$ BEGIN
        CREATE TYPE payment_frequency AS ENUM ('daily', 'weekly', 'monthly', 'yearly', 'custom');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    // Create profiles table
    await sql`
      CREATE TABLE IF NOT EXISTS profiles (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        email text UNIQUE NOT NULL,
        full_name text,
        avatar_url text,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      )
    `;

    // Create categories table
    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
        name text NOT NULL,
        type transaction_type NOT NULL,
        color text NOT NULL DEFAULT '#6b7280',
        parent uuid REFERENCES categories(id) ON DELETE SET NULL,
        budget numeric,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      )
    `;

    // Create transactions table
    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
        type transaction_type NOT NULL,
        amount numeric NOT NULL CHECK (amount > 0),
        category text NOT NULL,
        description text NOT NULL,
        date date NOT NULL,
        tags text[],
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      )
    `;

    // Create budgets table
    await sql`
      CREATE TABLE IF NOT EXISTS budgets (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
        category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
        amount numeric NOT NULL CHECK (amount > 0),
        period budget_period NOT NULL DEFAULT 'monthly',
        spent numeric DEFAULT 0 CHECK (spent >= 0),
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      )
    `;

    // Create goals table
    await sql`
      CREATE TABLE IF NOT EXISTS goals (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
        name text NOT NULL,
        target_amount numeric NOT NULL CHECK (target_amount > 0),
        current_amount numeric DEFAULT 0 CHECK (current_amount >= 0),
        deadline date NOT NULL,
        monthly_contribution numeric NOT NULL CHECK (monthly_contribution >= 0),
        priority goal_priority NOT NULL DEFAULT 'medium',
        description text,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      )
    `;

    // Create recurring_payments table
    await sql`
      CREATE TABLE IF NOT EXISTS recurring_payments (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
        name text NOT NULL,
        amount numeric NOT NULL CHECK (amount > 0),
        category text NOT NULL,
        frequency payment_frequency NOT NULL DEFAULT 'monthly',
        cron_expression text,
        next_date date NOT NULL,
        is_active boolean DEFAULT true,
        description text,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      )
    `;

    // Create indexes for performance
    await sql`CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_recurring_payments_user_id ON recurring_payments(user_id)`;

    console.log('Database schema initialized successfully');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Database schema initialized successfully',
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('Database initialization error:', error);
    
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
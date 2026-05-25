CREATE TABLE IF NOT EXISTS budgets (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  amount REAL NOT NULL,
  period TEXT NOT NULL CHECK(period IN ('monthly', 'yearly')),
  spent REAL DEFAULT 0,
  remaining REAL DEFAULT 0,
  budget_group TEXT,
  percentage REAL,
  created_at INTEGER,
  updated_at INTEGER,
  version INTEGER
);

CREATE INDEX IF NOT EXISTS idx_budgets_category_id ON budgets(category_id);

CREATE TABLE IF NOT EXISTS financial_goals (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  target_amount REAL NOT NULL,
  current_amount REAL NOT NULL,
  deadline TEXT NOT NULL,
  monthly_contribution REAL NOT NULL,
  priority TEXT NOT NULL CHECK(priority IN ('low', 'medium', 'high')),
  description TEXT,
  inflation_rate REAL,
  adjust_for_inflation INTEGER DEFAULT 0,
  expected_return REAL,
  inflation_adjusted_target REAL,
  created_at INTEGER,
  updated_at INTEGER,
  version INTEGER
);

CREATE INDEX IF NOT EXISTS idx_financial_goals_deadline ON financial_goals(deadline);

CREATE TABLE IF NOT EXISTS recurring_payments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  amount REAL NOT NULL,
  category TEXT NOT NULL,
  frequency TEXT NOT NULL CHECK(frequency IN ('daily', 'weekly', 'monthly', 'yearly', 'custom')),
  cron_expression TEXT,
  next_date TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  description TEXT,
  created_at INTEGER,
  updated_at INTEGER,
  version INTEGER
);

CREATE INDEX IF NOT EXISTS idx_recurring_payments_next_date ON recurring_payments(next_date);

CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

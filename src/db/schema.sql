-- =====================================================================
-- PaisaTrack: Unified Database Schema & Migrations
-- Compatible with SQLite (Local React Native / Expo) & Supabase PostgreSQL
-- =====================================================================

-- 1. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('expense', 'income', 'both')),
  icon TEXT NOT NULL DEFAULT 'Tag',
  color TEXT NOT NULL DEFAULT '#10B981',
  is_default INTEGER DEFAULT 0,
  user_id TEXT, -- Supabase auth.users ID when synced
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_categories_user ON categories(user_id);

-- 2. TRANSACTIONS TABLE
-- Note: 'amount' is stored in integer MINOR UNITS (paise for INR, cents for USD)
-- to guarantee zero floating point rounding errors.
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK(type IN ('expense', 'income')),
  amount INTEGER NOT NULL CHECK(amount > 0),
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  date TEXT NOT NULL, -- Format: YYYY-MM-DD
  note TEXT DEFAULT '',
  payment_method TEXT NOT NULL CHECK(payment_method IN ('upi', 'cash', 'credit_card', 'debit_card', 'net_banking', 'other')),
  user_id TEXT, -- Supabase auth.users ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  synced INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, date);

-- 3. BUDGETS TABLE
CREATE TABLE IF NOT EXISTS budgets (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL, -- 'overall' or category id
  amount INTEGER NOT NULL CHECK(amount > 0), -- Minor units
  month TEXT NOT NULL, -- Format: YYYY-MM
  alert_threshold INTEGER DEFAULT 80, -- percentage (e.g. 80%)
  user_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_budgets_cat_month ON budgets(category_id, month, user_id);

-- 4. SAVINGS GOALS TABLE
CREATE TABLE IF NOT EXISTS savings_goals (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  target_amount INTEGER NOT NULL CHECK(target_amount > 0),
  current_amount INTEGER NOT NULL DEFAULT 0,
  target_date TEXT, -- Format: YYYY-MM-DD
  color TEXT NOT NULL DEFAULT '#10B981',
  icon TEXT NOT NULL DEFAULT 'ShieldCheck',
  notes TEXT,
  user_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. SAVINGS CONTRIBUTIONS TABLE
CREATE TABLE IF NOT EXISTS savings_contributions (
  id TEXT PRIMARY KEY,
  goal_id TEXT NOT NULL REFERENCES savings_goals(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL CHECK(amount > 0),
  type TEXT NOT NULL CHECK(type IN ('contribution', 'withdrawal')),
  date TEXT NOT NULL,
  note TEXT,
  user_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contributions_goal ON savings_contributions(goal_id);

-- =====================================================================
-- SUPABASE POSTGRESQL ROW LEVEL SECURITY (RLS) POLICIES
-- Run the below in Supabase SQL Editor if enabling cloud sync
-- =====================================================================
-- ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE savings_contributions ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Users manage their own categories" ON categories
--   FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- CREATE POLICY "Users manage their own transactions" ON transactions
--   FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- CREATE POLICY "Users manage their own budgets" ON budgets
--   FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- CREATE POLICY "Users manage their own savings goals" ON savings_goals
--   FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- CREATE POLICY "Users manage their own contributions" ON savings_contributions
--   FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================
-- Training Tracker Database Schema
-- For Neon Postgres
-- ============================================
-- This script creates all necessary tables for the Training Tracker application
-- Run this in your Neon Postgres SQL Editor
-- ============================================

-- ============================================
-- NextAuth Tables
-- ============================================

-- Users table (for NextAuth)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  email_verified TIMESTAMP,
  image TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Accounts table (for NextAuth OAuth providers)
CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  UNIQUE(provider, provider_account_id)
);

-- Sessions table (for NextAuth)
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  session_token TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires TIMESTAMP NOT NULL
);

-- Verification tokens table (for NextAuth)
CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier TEXT NOT NULL,
  token TEXT NOT NULL,
  expires TIMESTAMP NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- ============================================
-- Application Tables
-- ============================================

-- Weight and body fat tracking table
CREATE TABLE IF NOT EXISTS body_metrics (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  weight_kg DECIMAL(5, 2),
  body_fat_percentage DECIMAL(4, 2),
  recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Nutrition/food tracking table
CREATE TABLE IF NOT EXISTS food_entries (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  food_name TEXT NOT NULL,
  calories DECIMAL(8, 2) NOT NULL,
  protein_g DECIMAL(8, 2) DEFAULT 0,
  carbs_g DECIMAL(8, 2) DEFAULT 0,
  fat_g DECIMAL(8, 2) DEFAULT 0,
  quantity DECIMAL(8, 2) DEFAULT 1,
  unit TEXT DEFAULT 'serving',
  consumed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Daily nutrition goals table
CREATE TABLE IF NOT EXISTS nutrition_goals (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  calories DECIMAL(8, 2) DEFAULT 2000,
  protein_g DECIMAL(8, 2) DEFAULT 150,
  carbs_g DECIMAL(8, 2) DEFAULT 200,
  fat_g DECIMAL(8, 2) DEFAULT 65,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- ============================================
-- Indexes for Performance
-- ============================================

-- Indexes for body_metrics table
CREATE INDEX IF NOT EXISTS idx_body_metrics_user_id ON body_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_body_metrics_recorded_at ON body_metrics(recorded_at);
CREATE INDEX IF NOT EXISTS idx_body_metrics_user_recorded ON body_metrics(user_id, recorded_at DESC);

-- Indexes for food_entries table
CREATE INDEX IF NOT EXISTS idx_food_entries_user_id ON food_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_food_entries_consumed_at ON food_entries(consumed_at);
CREATE INDEX IF NOT EXISTS idx_food_entries_user_consumed ON food_entries(user_id, consumed_at DESC);

-- Indexes for nutrition_goals table
CREATE INDEX IF NOT EXISTS idx_nutrition_goals_user_id ON nutrition_goals(user_id);

-- Indexes for NextAuth tables
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires);

-- ============================================
-- Verification
-- ============================================

-- Verify tables were created
DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN ('users', 'accounts', 'sessions', 'verification_tokens', 'body_metrics', 'food_entries', 'nutrition_goals');
  
  IF table_count = 7 THEN
    RAISE NOTICE '✅ All tables created successfully!';
  ELSE
    RAISE WARNING '⚠️  Expected 7 tables, found %', table_count;
  END IF;
END $$;

-- ============================================
-- Setup Complete
-- ============================================
-- Your database is now ready to use!
-- You can verify by running: SELECT * FROM information_schema.tables WHERE table_schema = 'public';


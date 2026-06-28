-- YouthPay Supabase schema
-- Run this in the Supabase SQL editor when ready to integrate.
-- Supabase is used as Postgres only (no Supabase Auth).

CREATE TYPE user_role AS ENUM ('teen', 'parent');

CREATE TABLE IF NOT EXISTS users (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email              text UNIQUE NOT NULL,
  password_hash      text NOT NULL,
  full_name          text NOT NULL,
  role               user_role NOT NULL DEFAULT 'teen',
  age                int,
  school_name        text,
  avatar_seed        text,
  monthly_allowance  numeric(12,2) DEFAULT 0,
  parent_id          uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at         timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text UNIQUE NOT NULL,
  color_hex   varchar(7) NOT NULL,
  icon        text NOT NULL,
  sort_order  int NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS transactions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid REFERENCES users(id) ON DELETE CASCADE,
  merchant_name  text,
  amount_pkr     numeric(12,2),
  direction      text CHECK (direction IN ('debit','credit')),
  payment_method text,
  txn_date       timestamptz,
  category       text,
  category_id    uuid REFERENCES categories(id),
  is_roman_urdu  boolean DEFAULT false,
  confidence     numeric(4,3),
  parsed_by      text CHECK (parsed_by IN ('regex','gemini')),
  is_duplicate   boolean DEFAULT false,
  raw_text       text,
  created_at     timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS insights_cache (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES users(id) ON DELETE CASCADE,
  month        text NOT NULL,
  insights     jsonb NOT NULL,
  generated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, month)
);

-- Demo users (password: testpass123)
-- bcrypt hash generated with cost factor 10
INSERT INTO users (
  id, email, password_hash, full_name, role, age, school_name,
  avatar_seed, monthly_allowance, parent_id
) VALUES
  (
    '00000000-0000-0000-0000-000000000002',
    'parent@youthpay.test',
    '$2b$10$49GDRLZZUh1S7QvGiwDJvugMkE.bgs7DiwC0vJyZUvid/7f83TpFq',
    'Parent User',
    'parent',
    NULL,
    NULL,
    'P',
    0,
    NULL
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'sudais@youthpay.test',
    '$2b$10$49GDRLZZUh1S7QvGiwDJvugMkE.bgs7DiwC0vJyZUvid/7f83TpFq',
    'Sudais',
    'teen',
    17,
    'Karachi Grammar School',
    'S',
    10000,
    '00000000-0000-0000-0000-000000000002'
  )
ON CONFLICT (email) DO NOTHING;

-- Seed categories (colors match YouthPay theme)
INSERT INTO categories (name, color_hex, icon, sort_order) VALUES
  ('Food',          '#FF4C4C', 'food',          1),
  ('Transport',     '#FFAB00', 'transport',     2),
  ('Lifestyle',     '#A8E63D', 'lifestyle',     3),
  ('Utilities',     '#2DD4BF', 'utilities',     4),
  ('Beauty',        '#8B5CF6', 'beauty',        5),
  ('Education',     '#5B4CF5', 'education',     6),
  ('Entertainment', '#7B6CF7', 'entertainment', 7),
  ('Coffee',        '#F59E0B', 'coffee',        8),
  ('Allowance',     '#34D399', 'allowance',     9),
  ('Other',         '#888780', 'other',         10)
ON CONFLICT (name) DO UPDATE SET
  color_hex  = EXCLUDED.color_hex,
  icon       = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order;

-- Duplicate detection trigger
CREATE OR REPLACE FUNCTION flag_duplicate_transactions()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM transactions
    WHERE user_id = NEW.user_id
      AND LOWER(merchant_name) = LOWER(NEW.merchant_name)
      AND amount_pkr = NEW.amount_pkr
      AND txn_date IS NOT NULL
      AND NEW.txn_date IS NOT NULL
      AND ABS(EXTRACT(EPOCH FROM (txn_date - NEW.txn_date))) <= 300
  ) THEN
    NEW.is_duplicate := true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS flag_duplicate_transactions ON transactions;
CREATE TRIGGER flag_duplicate_transactions
  BEFORE INSERT ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION flag_duplicate_transactions();

-- Index for parent → teen lookup
CREATE INDEX IF NOT EXISTS idx_users_parent_id ON users(parent_id);

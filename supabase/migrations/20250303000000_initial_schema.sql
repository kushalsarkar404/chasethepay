-- ChaseThePay initial schema
-- Run: supabase db push (or apply via Supabase dashboard)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Accounts (Stripe Connect)
CREATE TABLE IF NOT EXISTS accounts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_account_id text NOT NULL UNIQUE,
  integration_type text NOT NULL DEFAULT 'stripe',
  connected_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);

-- Invoices
CREATE TYPE invoice_status AS ENUM ('open', 'paid', 'void');
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  stripe_invoice_id text NOT NULL UNIQUE,
  status invoice_status NOT NULL,
  due_date timestamptz NOT NULL,
  amount_due integer NOT NULL,
  amount_remaining integer NOT NULL,
  customer_name text,
  customer_email text,
  chase_count integer NOT NULL DEFAULT 0,
  last_chased_at timestamptz,
  recovered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invoices_account_id ON invoices(account_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE UNIQUE INDEX IF NOT EXISTS idx_invoices_stripe_id ON invoices(stripe_invoice_id);

-- Chases (email log)
CREATE TYPE chase_type AS ENUM ('email');
CREATE TYPE chase_status AS ENUM ('sent', 'delivered', 'failed', 'bounced');
CREATE TABLE IF NOT EXISTS chases (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  type chase_type NOT NULL DEFAULT 'email',
  message text NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now(),
  status chase_status NOT NULL DEFAULT 'sent',
  provider_message_id text,
  reply text
);

CREATE INDEX IF NOT EXISTS idx_chases_invoice_id ON chases(invoice_id);

-- Settings (per user)
CREATE TYPE ai_tone AS ENUM ('friendly', 'professional', 'firm');
CREATE TYPE chase_frequency AS ENUM ('3days', 'weekly');
CREATE TYPE plan_type AS ENUM ('free', 'pro');
CREATE TABLE IF NOT EXISTS settings (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  ai_tone ai_tone NOT NULL DEFAULT 'friendly',
  chase_frequency chase_frequency NOT NULL DEFAULT '3days',
  max_chases integer NOT NULL DEFAULT 5,
  from_email text,
  plan plan_type NOT NULL DEFAULT 'free',
  stripe_customer_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS policies
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE chases ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- accounts: users see only their own
CREATE POLICY "accounts_select_own" ON accounts
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "accounts_insert_own" ON accounts
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "accounts_update_own" ON accounts
  FOR UPDATE USING (user_id = auth.uid());

-- invoices: via account ownership
CREATE POLICY "invoices_select_own" ON invoices
  FOR SELECT USING (
    account_id IN (SELECT id FROM accounts WHERE user_id = auth.uid())
  );
CREATE POLICY "invoices_insert_own" ON invoices
  FOR INSERT WITH CHECK (
    account_id IN (SELECT id FROM accounts WHERE user_id = auth.uid())
  );
CREATE POLICY "invoices_update_own" ON invoices
  FOR UPDATE USING (
    account_id IN (SELECT id FROM accounts WHERE user_id = auth.uid())
  );

-- chases: via invoice -> account ownership
CREATE POLICY "chases_select_own" ON chases
  FOR SELECT USING (
    invoice_id IN (
      SELECT i.id FROM invoices i
      JOIN accounts a ON i.account_id = a.id
      WHERE a.user_id = auth.uid()
    )
  );
CREATE POLICY "chases_insert_own" ON chases
  FOR INSERT WITH CHECK (
    invoice_id IN (
      SELECT i.id FROM invoices i
      JOIN accounts a ON i.account_id = a.id
      WHERE a.user_id = auth.uid()
    )
  );

-- settings: users see/update only their own
CREATE POLICY "settings_select_own" ON settings
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "settings_insert_own" ON settings
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "settings_update_own" ON settings
  FOR UPDATE USING (user_id = auth.uid());

-- Updated at trigger for settings
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS settings_updated_at ON settings;
CREATE TRIGGER settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

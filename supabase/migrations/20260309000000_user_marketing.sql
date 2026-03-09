-- User marketing / analytics table for growth and engagement tracking
CREATE TABLE IF NOT EXISTS user_marketing (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_signed_in_at timestamptz,
  last_signed_in_at timestamptz,
  is_paid boolean NOT NULL DEFAULT false,
  viewed_billing_at timestamptz,
  chases_used_count integer NOT NULL DEFAULT 0,
  stripe_connected boolean NOT NULL DEFAULT false,
  survey_sent_at timestamptz,
  total_recovered_cents bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_marketing_is_paid ON user_marketing(is_paid);
CREATE INDEX IF NOT EXISTS idx_user_marketing_stripe_connected ON user_marketing(stripe_connected);
CREATE INDEX IF NOT EXISTS idx_user_marketing_survey_sent_at ON user_marketing(survey_sent_at);

-- RLS: internal marketing use; service role reads. Users can read their own row (e.g. for billing page).
ALTER TABLE user_marketing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_marketing_select_own" ON user_marketing
  FOR SELECT USING (user_id = auth.uid());

-- Authenticated users can upsert their own row (API updates on sign-in, view billing, etc.)
CREATE POLICY "user_marketing_upsert_own" ON user_marketing
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Trigger to keep updated_at in sync
DROP TRIGGER IF EXISTS user_marketing_updated_at ON user_marketing;
CREATE TRIGGER user_marketing_updated_at
  BEFORE UPDATE ON user_marketing
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to sync user_marketing from existing data (run via cron or admin API with service role)
-- Note: first_signed_in_at/last_signed_in_at must be set by app (auth.users not always accessible)
CREATE OR REPLACE FUNCTION sync_user_marketing(p_user_id uuid)
RETURNS void AS $$
DECLARE
  v_plan text;
  v_stripe_connected boolean;
  v_chases_count integer;
  v_recovered bigint;
BEGIN
  -- Plan and stripe from settings
  SELECT s.plan,
         EXISTS (SELECT 1 FROM accounts a WHERE a.user_id = p_user_id)
  INTO v_plan, v_stripe_connected
  FROM settings s
  WHERE s.user_id = p_user_id;

  -- Chases count (all-time)
  SELECT COALESCE(count(*), 0)::integer INTO v_chases_count
  FROM chases c
  JOIN invoices i ON c.invoice_id = i.id
  JOIN accounts a ON i.account_id = a.id
  WHERE a.user_id = p_user_id;

  -- Total recovered (invoices with recovered_at, sum amount_remaining at recovery)
  SELECT COALESCE(SUM(amount_remaining), 0)::bigint INTO v_recovered
  FROM invoices i
  JOIN accounts a ON i.account_id = a.id
  WHERE a.user_id = p_user_id AND i.recovered_at IS NOT NULL;

  INSERT INTO user_marketing (
    user_id, is_paid, chases_used_count, stripe_connected, total_recovered_cents, updated_at
  ) VALUES (
    p_user_id,
    COALESCE(v_plan IN ('pro', 'test'), false),
    v_chases_count,
    COALESCE(v_stripe_connected, false),
    COALESCE(v_recovered, 0),
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    is_paid = EXCLUDED.is_paid,
    chases_used_count = EXCLUDED.chases_used_count,
    stripe_connected = EXCLUDED.stripe_connected,
    total_recovered_cents = EXCLUDED.total_recovered_cents,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE user_marketing IS 'Denormalized user metrics for marketing, growth, and engagement analytics';

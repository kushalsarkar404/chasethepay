-- Only 'pro' counts as is_paid (remove 'test' plan benefit)
CREATE OR REPLACE FUNCTION sync_user_marketing(p_user_id uuid)
RETURNS void AS $$
DECLARE
  v_plan text;
  v_stripe_connected boolean;
  v_chases_count integer;
  v_recovered bigint;
BEGIN
  SELECT s.plan,
         EXISTS (SELECT 1 FROM accounts a WHERE a.user_id = p_user_id)
  INTO v_plan, v_stripe_connected
  FROM settings s
  WHERE s.user_id = p_user_id;

  SELECT COALESCE(count(*), 0)::integer INTO v_chases_count
  FROM chases c
  JOIN invoices i ON c.invoice_id = i.id
  JOIN accounts a ON i.account_id = a.id
  WHERE a.user_id = p_user_id;

  SELECT COALESCE(SUM(amount_remaining), 0)::bigint INTO v_recovered
  FROM invoices i
  JOIN accounts a ON i.account_id = a.id
  WHERE a.user_id = p_user_id AND i.recovered_at IS NOT NULL;

  INSERT INTO user_marketing (
    user_id, is_paid, chases_used_count, stripe_connected, total_recovered_cents, updated_at
  ) VALUES (
    p_user_id,
    (v_plan = 'pro'),
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

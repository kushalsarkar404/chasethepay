-- Protect plan and stripe_customer_id from client-side manipulation.
-- Only service_role (webhooks) and postgres (migrations) can change these columns.
-- Client updates via anon/authenticated key will have these columns reverted.

CREATE OR REPLACE FUNCTION settings_protect_billing_columns()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow service_role (Stripe webhooks), postgres (migrations), dashboard_user (Supabase SQL editor)
  -- PostgREST uses SET ROLE from JWT, so current_user reflects the request role
  IF current_user IN ('service_role', 'postgres', 'dashboard_user') THEN
    RETURN NEW;
  END IF;

  -- Revert plan and stripe_customer_id to existing values
  NEW.plan := OLD.plan;
  NEW.stripe_customer_id := OLD.stripe_customer_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS settings_protect_billing_columns ON settings;
CREATE TRIGGER settings_protect_billing_columns
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION settings_protect_billing_columns();

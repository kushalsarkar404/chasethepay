-- Track email opens and pay-button clicks for behavior-aware chase customization
ALTER TABLE chases
  ADD COLUMN IF NOT EXISTS opened_at timestamptz,
  ADD COLUMN IF NOT EXISTS clicked_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_chases_invoice_sent ON chases(invoice_id, sent_at DESC);

COMMENT ON COLUMN chases.opened_at IS 'When recipient opened the chase email (from Resend webhook)';
COMMENT ON COLUMN chases.clicked_at IS 'When recipient clicked a link in the chase email (from Resend webhook)';

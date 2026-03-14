-- Track when cron jobs last ran (for dashboard display)
CREATE TABLE IF NOT EXISTS cron_status (
  key text PRIMARY KEY,
  ran_at timestamptz NOT NULL,
  scanned integer DEFAULT 0,
  synced integer DEFAULT 0,
  sent integer DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE cron_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cron_status_select_authenticated" ON cron_status
  FOR SELECT TO authenticated USING (true);

-- Service role (cron) can upsert
CREATE POLICY "cron_status_all_service" ON cron_status
  FOR ALL TO service_role USING (true) WITH CHECK (true);

COMMENT ON TABLE cron_status IS 'Last run timestamps for scan and auto-chase crons';

-- Waitlist for invite-only (50 users)
CREATE TABLE IF NOT EXISTS waitlist (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text NOT NULL,
  name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist(created_at);

-- Allow anyone to insert (join waitlist), no public read
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "waitlist_insert_anon" ON waitlist
  FOR INSERT WITH CHECK (true);

CREATE POLICY "waitlist_select_service" ON waitlist
  FOR SELECT USING (auth.jwt() ->> 'role' = 'service_role');

-- Add mandatory sender_name to settings (used in chase emails)
ALTER TABLE settings
  ADD COLUMN IF NOT EXISTS sender_name text NOT NULL DEFAULT 'Your business';

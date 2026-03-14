-- Reply-to email for chase reminders (where customers' replies go). Receiving only, not sending.
ALTER TABLE settings
  ADD COLUMN IF NOT EXISTS reply_to_email text;

COMMENT ON COLUMN settings.reply_to_email IS 'Email address to receive customer replies to chase reminders. Used as Reply-To header.';

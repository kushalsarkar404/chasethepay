-- Store Stripe hosted invoice URL so chase emails can include Pay Now button
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_url text;

-- Enable Realtime for invoices table so dashboard updates when status changes (e.g. paid via Stripe webhook)
ALTER PUBLICATION supabase_realtime ADD TABLE invoices;

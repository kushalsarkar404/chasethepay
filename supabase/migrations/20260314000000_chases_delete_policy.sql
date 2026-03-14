-- Allow users to delete their own chases
CREATE POLICY "chases_delete_own" ON chases
  FOR DELETE USING (
    invoice_id IN (
      SELECT i.id FROM invoices i
      JOIN accounts a ON i.account_id = a.id
      WHERE a.user_id = auth.uid()
    )
  );

-- Decrement invoice chase_count when a chase is deleted
CREATE OR REPLACE FUNCTION decrement_chase_count_on_delete()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE invoices
  SET chase_count = GREATEST(0, chase_count - 1)
  WHERE id = OLD.invoice_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS chases_after_delete ON chases;
CREATE TRIGGER chases_after_delete
  AFTER DELETE ON chases
  FOR EACH ROW EXECUTE FUNCTION decrement_chase_count_on_delete();

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: accounts } = await supabase
    .from("accounts")
    .select("id")
    .eq("user_id", user.id);

  const accountIds = accounts?.map((a) => a.id) ?? [];
  if (accountIds.length === 0) {
    return NextResponse.json({ invoices: [] });
  }

  const { data: invoices, error } = await supabase
    .from("invoices")
    .select("*")
    .in("account_id", accountIds)
    .eq("status", "open")
    .gt("amount_remaining", 0)
    .order("due_date", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const invoiceList = invoices ?? [];
  if (invoiceList.length === 0) {
    return NextResponse.json({ invoices: [] });
  }

  const invoiceIds = invoiceList.map((inv) => inv.id);
  const { data: chases } = await supabase
    .from("chases")
    .select("invoice_id, sent_at, opened_at, clicked_at")
    .in("invoice_id", invoiceIds)
    .order("sent_at", { ascending: false });

  // Build best engagement per invoice: clicked if any chase was clicked, else sent
  const latestByInvoice = new Map<string, "clicked" | "sent">();
  for (const c of chases ?? []) {
    const current = latestByInvoice.get(c.invoice_id);
    if (c.clicked_at) latestByInvoice.set(c.invoice_id, "clicked");
    else if (!current) latestByInvoice.set(c.invoice_id, "sent");
  }

  const invoicesWithStatus = invoiceList.map((inv) => ({
    ...inv,
    latest_chase_status: latestByInvoice.get(inv.id) ?? null,
  }));

  return NextResponse.json({ invoices: invoicesWithStatus });
}

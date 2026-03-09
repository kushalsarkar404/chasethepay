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
    .select("id, connected_at")
    .eq("user_id", user.id);

  const accountIds = accounts?.map((a) => a.id) ?? [];
  if (accountIds.length === 0) {
    return NextResponse.json({
      totalRecovered: 0,
      recoveryHistory: [],
    });
  }

  const connectedDates = (accounts ?? [])
    .map((a) => (a as { connected_at?: string }).connected_at)
    .filter((d): d is string => !!d);
  const connectedAt = connectedDates.length ? connectedDates.sort()[0] : null;

  const { data: recovered } = await supabase
    .from("invoices")
    .select("id, stripe_invoice_id, customer_name, amount_remaining, recovered_at")
    .in("account_id", accountIds)
    .not("recovered_at", "is", null)
    .gt("chase_count", 0)
    .order("recovered_at", { ascending: false });

  const recoveredFiltered = connectedAt
    ? recovered?.filter((inv) => inv.recovered_at && inv.recovered_at >= connectedAt) ?? []
    : recovered ?? [];

  const totalRecovered =
    recoveredFiltered.reduce((s, i) => s + (i.amount_remaining ?? 0), 0);

  const recoveryHistory = recoveredFiltered.map((inv) => ({
      id: inv.id,
      stripeInvoiceId: inv.stripe_invoice_id,
      customerName: inv.customer_name,
      amount: inv.amount_remaining ?? 0,
      recoveredAt: inv.recovered_at,
  }));

  return NextResponse.json({
    totalRecovered,
    recoveryHistory,
  });
}

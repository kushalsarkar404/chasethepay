import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardContent } from "./dashboard-content";

export const metadata = {
  title: "Dashboard",
  description: "View overdue invoices and recovery analytics",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: accounts } = await supabase
    .from("accounts")
    .select("id")
    .eq("user_id", user.id);

  const accountIds = accounts?.map((a) => a.id) ?? [];

  let invoices: Awaited<ReturnType<typeof fetchInvoices>> = [];
  let analytics: Awaited<ReturnType<typeof fetchAnalytics>> | null = null;

  if (accountIds.length > 0) {
    [invoices, analytics] = await Promise.all([
      fetchInvoices(supabase, accountIds),
      fetchAnalytics(supabase, accountIds),
    ]);
  }

  return (
    <DashboardContent
      invoices={invoices}
      analytics={analytics}
      hasStripeConnected={accountIds.length > 0}
    />
  );
}

async function fetchInvoices(
  supabase: Awaited<ReturnType<typeof createClient>>,
  accountIds: string[]
) {
  const { data } = await supabase
    .from("invoices")
    .select("*")
    .in("account_id", accountIds)
    .eq("status", "open")
    .gt("amount_remaining", 0)
    .order("due_date", { ascending: true });

  return data ?? [];
}

async function fetchAnalytics(
  supabase: Awaited<ReturnType<typeof createClient>>,
  accountIds: string[]
) {
  const { data: accounts } = await supabase
    .from("accounts")
    .select("connected_at")
    .in("id", accountIds);

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
    ? (recovered ?? []).filter((inv) => inv.recovered_at && inv.recovered_at >= connectedAt)
    : recovered ?? [];

  const totalRecovered = recoveredFiltered.reduce(
    (s, i) => s + (i.amount_remaining ?? 0),
    0
  );

  const recoveryHistory = recoveredFiltered.map((inv) => ({
    id: inv.id,
    stripeInvoiceId: inv.stripe_invoice_id,
    customerName: inv.customer_name,
    amount: inv.amount_remaining ?? 0,
    recoveredAt: inv.recovered_at,
  }));

  return {
    totalRecovered,
    recoveryHistory,
  };
}

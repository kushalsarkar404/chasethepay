import { createAdminClient } from "@/lib/supabase/admin";
import { executeChase } from "@/lib/chase";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { subDays, subMinutes } from "date-fns";

const FREE_CHASES_PER_MONTH = 10;

export const maxDuration = 300;

export async function GET() {
  const headersList = await headers();
  const authHeader = headersList.get("authorization");
  const cronSecret = headersList.get("x-cron-secret");
  const envSecret = process.env.CRON_SECRET;
  const valid =
    envSecret &&
    (authHeader === `Bearer ${envSecret}` || cronSecret === envSecret);

  if (!valid) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = createAdminClient();

  const { data: accounts } = await admin
    .from("accounts")
    .select("id, user_id, stripe_account_id");

  if (!accounts?.length) {
    return NextResponse.json({ ok: true, sent: 0 });
  }

  const { data: allSettings } = await admin
    .from("settings")
    .select("user_id, max_chases, chase_frequency, plan");

  const settingsByUser = new Map(
    (allSettings ?? []).map((s) => [s.user_id, s])
  );

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  let sent = 0;

  for (const account of accounts) {
    const settings = settingsByUser.get(account.user_id);
    const maxChases = settings?.max_chases ?? 5;
    const frequency = settings?.chase_frequency ?? "3days";
    const cutoff =
      frequency === "1min"
        ? subMinutes(now, 1)
        : subDays(now, frequency === "1day" ? 1 : frequency === "3days" ? 3 : 7);

    const { data: invoices } = await admin
      .from("invoices")
      .select("id, chase_count, last_chased_at")
      .eq("account_id", account.id)
      .eq("status", "open")
      .not("customer_email", "is", null);

    if (!invoices?.length) continue;

    for (const inv of invoices) {
      if (inv.chase_count >= maxChases) continue;

      const lastChased = inv.last_chased_at ? new Date(inv.last_chased_at) : null;
      if (lastChased && cutoff < lastChased) continue;

      if (settings?.plan === "free") {
        const { data: userAccounts } = await admin
          .from("accounts")
          .select("id")
          .eq("user_id", account.user_id);
        const accIds = userAccounts?.map((a) => a.id) ?? [];
        const { data: userInvoices } = await admin
          .from("invoices")
          .select("id")
          .in("account_id", accIds);
        const invIds = userInvoices?.map((i) => i.id) ?? [];

        const { count } = await admin
          .from("chases")
          .select("*", { count: "exact", head: true })
          .gte("sent_at", startOfMonth.toISOString())
          .in("invoice_id", invIds);

        if ((count ?? 0) >= FREE_CHASES_PER_MONTH) continue;
      }

      const result = await executeChase(admin, inv.id, account.user_id);
      if (result.ok) sent++;
    }
  }

  return NextResponse.json({ ok: true, sent });
}

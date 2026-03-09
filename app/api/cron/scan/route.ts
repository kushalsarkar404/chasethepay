import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export const maxDuration = 60;

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
    .select("id, stripe_account_id");

  if (!accounts?.length) {
    return NextResponse.json({ ok: true, scanned: 0 });
  }

  const stripe = getStripe();
  const now = new Date();
  let totalScanned = 0;
  let totalSynced = 0;

  for (const acc of accounts) {
    try {
      const invoices = await stripe.invoices.list(
        { status: "open", limit: 100 },
        { stripeAccount: acc.stripe_account_id }
      );

      for (const inv of invoices.data) {
        if (inv.amount_remaining <= 0) continue;
        const dueDate = inv.due_date ? new Date(inv.due_date * 1000) : null;
        if (!dueDate || dueDate >= now) continue;

        const cust = inv.customer && typeof inv.customer === "object" ? inv.customer : null;
        const customerEmail =
          typeof inv.customer_email === "string"
            ? inv.customer_email
            : (cust && "email" in cust ? cust.email : null) ?? null;
        const customerName =
          typeof inv.customer_name === "string"
            ? inv.customer_name
            : (cust && "name" in cust ? cust.name : null) ?? null;

        await admin.from("invoices").upsert(
          {
            account_id: acc.id,
            stripe_invoice_id: inv.id,
            status: "open",
            due_date: dueDate.toISOString(),
            amount_due: inv.amount_due,
            amount_remaining: inv.amount_remaining,
            customer_name: customerName,
            customer_email: customerEmail,
          },
          { onConflict: "stripe_invoice_id", ignoreDuplicates: false }
        );
        totalScanned++;
      }

      const { data: openInvoices } = await admin
        .from("invoices")
        .select("id, stripe_invoice_id")
        .eq("account_id", acc.id)
        .eq("status", "open");

      for (const inv of openInvoices ?? []) {
        try {
          const stripeInv = await stripe.invoices.retrieve(
            inv.stripe_invoice_id,
            { stripeAccount: acc.stripe_account_id }
          );
          if (stripeInv.status === "paid") {
            const recoveredAt = stripeInv.status_transitions?.paid_at
              ? new Date(stripeInv.status_transitions.paid_at * 1000).toISOString()
              : new Date().toISOString();
            await admin
              .from("invoices")
              .update({ status: "paid", recovered_at: recoveredAt })
              .eq("id", inv.id);
            totalSynced++;
          }
        } catch {
          /* skip */
        }
      }
    } catch {
      // Continue with other accounts
    }
  }

  return NextResponse.json({ ok: true, scanned: totalScanned, synced: totalSynced });
}

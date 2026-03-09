import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { syncUserMarketing } from "@/lib/marketing";
import { NextResponse } from "next/server";

/**
 * Sync invoice status from Stripe.
 * Updates our DB when Stripe shows an invoice as paid (e.g. when webhooks didn't fire).
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: accounts } = await supabase
    .from("accounts")
    .select("id, stripe_account_id")
    .eq("user_id", user.id);

  if (!accounts?.length) {
    return NextResponse.json({ error: "No Stripe account connected" }, { status: 400 });
  }

  const { data: openInvoices } = await supabase
    .from("invoices")
    .select("id, stripe_invoice_id, account_id")
    .in("account_id", accounts.map((a) => a.id))
    .eq("status", "open");

  if (!openInvoices?.length) {
    return NextResponse.json({ ok: true, updated: 0 });
  }

  const stripe = getStripe();
  const accountMap = new Map(accounts.map((a) => [a.id, a.stripe_account_id]));
  let updated = 0;

  for (const inv of openInvoices) {
    const stripeAccountId = accountMap.get(inv.account_id);
    if (!stripeAccountId) continue;

    try {
      const stripeInv = await stripe.invoices.retrieve(
        inv.stripe_invoice_id,
        { stripeAccount: stripeAccountId }
      );

      if (stripeInv.status === "paid") {
        const recoveredAt =
          stripeInv.status_transitions?.paid_at
            ? new Date(stripeInv.status_transitions.paid_at * 1000).toISOString()
            : new Date().toISOString();

        await supabase
          .from("invoices")
          .update({
            status: "paid",
            recovered_at: recoveredAt,
          })
          .eq("id", inv.id);

        updated++;
      }
    } catch {
      // Skip if Stripe fetch fails (e.g. invoice deleted)
    }
  }

  if (updated > 0) {
    syncUserMarketing(user.id).catch((e) =>
      console.error("[invoices/sync] marketing sync:", e)
    );
  }

  return NextResponse.json({ ok: true, updated });
}

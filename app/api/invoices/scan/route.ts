import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

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

  const stripe = getStripe();
  let totalFound = 0;
  const errors: string[] = [];

  const includeFutureDue =
    process.env.NODE_ENV === "development" &&
    process.env.DEV_INCLUDE_FUTURE_DUE === "true";
  const now = new Date();

  for (const acc of accounts) {
    try {
      const invoices = await stripe.invoices.list(
        { status: "open", limit: 100 },
        { stripeAccount: acc.stripe_account_id }
      );

      for (const inv of invoices.data) {
        if (inv.amount_remaining <= 0) continue;
        const dueDate = inv.due_date ? new Date(inv.due_date * 1000) : null;
        if (!dueDate) continue;
        if (!includeFutureDue && dueDate >= now) continue;

        const cust = inv.customer && typeof inv.customer === "object" ? inv.customer : null;
        const customerEmail =
          typeof inv.customer_email === "string"
            ? inv.customer_email
            : (cust && "email" in cust ? (cust as { email?: string }).email : null) ?? null;
        const customerName =
          typeof inv.customer_name === "string"
            ? inv.customer_name
            : (cust && "name" in cust ? (cust as { name?: string }).name : null) ?? null;

        const paymentUrl =
          typeof (inv as { hosted_invoice_url?: string | null }).hosted_invoice_url === "string"
            ? (inv as { hosted_invoice_url: string }).hosted_invoice_url
            : null;
        await supabase.from("invoices").upsert(
          {
            account_id: acc.id,
            stripe_invoice_id: inv.id,
            status: "open",
            due_date: dueDate.toISOString(),
            amount_due: inv.amount_due,
            amount_remaining: inv.amount_remaining,
            customer_name: customerName,
            customer_email: customerEmail,
            payment_url: paymentUrl,
          },
          {
            onConflict: "stripe_invoice_id",
            ignoreDuplicates: false,
          }
        );
        totalFound++;
      }
    } catch (err) {
      errors.push(
        err instanceof Error ? err.message : "Unknown error"
      );
    }
  }

  return NextResponse.json({
    ok: true,
    scanned: totalFound,
    errors: errors.length ? errors : undefined,
  });
}

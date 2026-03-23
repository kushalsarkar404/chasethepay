import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

/**
 * Debug endpoint: GET /api/debug/payment-url?invoiceId=xxx
 * Returns the payment URL for an invoice (dev only). Helps diagnose missing Pay Now button.
 */
export async function GET(req: Request) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available in production" }, { status: 404 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const invoiceId = searchParams.get("invoiceId");
  if (!invoiceId) return NextResponse.json({ error: "invoiceId required" }, { status: 400 });

  const admin = createAdminClient();
  const { data: invoice } = await admin
    .from("invoices")
    .select("id, account_id, stripe_invoice_id, payment_url")
    .eq("id", invoiceId)
    .single();

  if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

  const { data: account } = await admin
    .from("accounts")
    .select("user_id, stripe_account_id")
    .eq("id", invoice.account_id)
    .single();

  if (!account || account.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const stripe = getStripe();
  let stripeData: Record<string, unknown> = {};
  let fetchError: string | null = null;

  try {
    const stripeInv = await stripe.invoices.retrieve(invoice.stripe_invoice_id, {
      stripeAccount: account.stripe_account_id,
    });
    stripeData = {
      status: stripeInv.status,
      hosted_invoice_url: stripeInv.hosted_invoice_url,
      invoice_pdf: stripeInv.invoice_pdf,
    };
  } catch (err) {
    fetchError = err instanceof Error ? err.message : String(err);
    try {
      const stripeInv = await stripe.invoices.retrieve(invoice.stripe_invoice_id);
      stripeData = {
        status: stripeInv.status,
        hosted_invoice_url: stripeInv.hosted_invoice_url,
        invoice_pdf: stripeInv.invoice_pdf,
      };
      fetchError = null;
    } catch (err2) {
      fetchError = fetchError + " | Fallback: " + (err2 instanceof Error ? err2.message : String(err2));
    }
  }

  return NextResponse.json({
    invoiceId,
    stripe_invoice_id: invoice.stripe_invoice_id,
    payment_url_in_db: invoice.payment_url,
    stripe_account_id: account.stripe_account_id,
    stripe: stripeData,
    fetchError,
    fix: !stripeData.hosted_invoice_url
      ? "Enable 'Include a link to a payment page' in Stripe Dashboard → Settings → Invoices (for the connected account)"
      : null,
  });
}

import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";
import { syncUserMarketingAdmin } from "@/lib/marketing";
import { trackServer, trackServerRevenue } from "@/lib/analytics-server";
import { AnalyticsEvents } from "@/lib/analytics-events";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const sig = headersList.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret || !sig) {
    return NextResponse.json(
      { error: "Missing webhook secret or signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Webhook signature invalid: ${msg}` }, { status: 400 });
  }

  const admin = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id ?? (session.metadata?.user_id as string | undefined);
      const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
      if (userId && customerId) {
        await admin.from("settings").update({ stripe_customer_id: customerId }).eq("user_id", userId);
        trackServer(userId, AnalyticsEvents.Billing_CheckoutCompleted, { stripe_customer_id: customerId }).catch(() => {});
      }
      break;
    }
    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      const stripeInvoiceId = invoice.id;
      const amountCents = invoice.amount_paid ?? 0;
      const { data: inv } = await admin
        .from("invoices")
        .update({ recovered_at: new Date().toISOString(), status: "paid" })
        .eq("stripe_invoice_id", stripeInvoiceId)
        .select("account_id")
        .single();
      if (inv?.account_id) {
        const { data: acc } = await admin
          .from("accounts")
          .select("user_id")
          .eq("id", inv.account_id)
          .single();
        if (acc?.user_id) {
          syncUserMarketingAdmin(acc.user_id).catch((e) =>
            console.error("[webhooks/stripe] marketing sync:", e)
          );
          if (amountCents > 0) {
            trackServerRevenue(acc.user_id, amountCents, { invoice_id: stripeInvoiceId }).catch(() => {});
          }
        }
      }
      break;
    }
    case "customer.subscription.deleted":
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
      if (customerId) {
        const plan = sub.status === "active" ? "pro" : "free";
        const { data: settings } = await admin
          .from("settings")
          .update({ plan })
          .eq("stripe_customer_id", customerId)
          .select("user_id")
          .single();
        if (settings?.user_id) {
          syncUserMarketingAdmin(settings.user_id).catch((e) =>
            console.error("[webhooks/stripe] marketing sync:", e)
          );
          const evt = event.type === "customer.subscription.deleted"
            ? AnalyticsEvents.Billing_SubscriptionDeleted
            : AnalyticsEvents.Billing_SubscriptionUpdated;
          trackServer(settings.user_id, evt, { plan, status: sub.status }).catch(() => {});
        }
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}

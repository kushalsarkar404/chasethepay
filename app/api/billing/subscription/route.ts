import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: settings } = await supabase
    .from("settings")
    .select("plan, stripe_customer_id")
    .eq("user_id", user.id)
    .single();

  if (!settings || settings.plan !== "pro" || !settings.stripe_customer_id) {
    return NextResponse.json({
      plan: settings?.plan ?? "free",
      cancelAtPeriodEnd: false,
      currentPeriodEnd: null,
    });
  }

  const stripe = getStripe();
  const subs = await stripe.subscriptions.list({
    customer: settings.stripe_customer_id,
    status: "active",
    limit: 1,
  });

  const sub = subs.data[0];
  if (!sub) {
    return NextResponse.json({
      plan: "free",
      cancelAtPeriodEnd: false,
      currentPeriodEnd: null,
    });
  }

  const periodEnd = "current_period_end" in sub ? (sub as { current_period_end?: number }).current_period_end : null;
  return NextResponse.json({
    plan: "pro",
    cancelAtPeriodEnd: sub.cancel_at_period_end,
    currentPeriodEnd: periodEnd,
  });
}

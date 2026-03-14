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

  const { data: settings } = await supabase
    .from("settings")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .single();

  if (!settings?.stripe_customer_id) {
    return NextResponse.json(
      { error: "No active subscription" },
      { status: 400 }
    );
  }

  const stripe = getStripe();
  const subs = await stripe.subscriptions.list({
    customer: settings.stripe_customer_id,
    status: "active",
    limit: 1,
  });

  const sub = subs.data[0];
  if (!sub) {
    return NextResponse.json(
      { error: "No active subscription" },
      { status: 400 }
    );
  }

  await stripe.subscriptions.update(sub.id, {
    cancel_at_period_end: true,
  });

  const periodEnd = "current_period_end" in sub ? (sub as { current_period_end?: number }).current_period_end : undefined;
  return NextResponse.json({
    ok: true,
    current_period_end: periodEnd,
  });
}

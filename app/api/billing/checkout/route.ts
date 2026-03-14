import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

const PRO_PRICE_CENTS = 999; // $9.99/mo

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

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: "ChaseThePay Pro" },
          unit_amount: PRO_PRICE_CENTS,
          recurring: { interval: "month" },
        },
        quantity: 1,
      },
    ],
    success_url: `${appUrl}/settings?checkout=success`,
    cancel_url: `${appUrl}/settings`,
    client_reference_id: user.id,
    ...(settings?.stripe_customer_id
      ? { customer: settings.stripe_customer_id }
      : { customer_email: user.email ?? undefined }),
  });

  return NextResponse.json({ url: session.url });
}

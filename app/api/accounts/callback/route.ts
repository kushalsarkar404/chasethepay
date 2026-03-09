import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";
import { syncUserMarketingAdmin } from "@/lib/marketing";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // user_id
  const errorParam = searchParams.get("error");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (errorParam) {
    return NextResponse.redirect(`${appUrl}/settings?stripe=error`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${appUrl}/settings?stripe=error`);
  }

  const stripe = getStripe();
  let accountId: string;
  try {
    const response = await stripe.oauth.token({
      grant_type: "authorization_code",
      code,
    });
    const id = response.stripe_user_id;
    if (!id) throw new Error("No account id");
    accountId = id;
  } catch (err) {
    console.error("[Stripe callback] OAuth token exchange failed:", err);
    return NextResponse.redirect(`${appUrl}/settings?stripe=error`);
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (err) {
    console.error("[Stripe callback] Missing SUPABASE_SERVICE_KEY:", err);
    return NextResponse.redirect(`${appUrl}/settings?stripe=error`);
  }

  const { error } = await admin
    .from("accounts")
    .upsert(
      {
        user_id: state,
        stripe_account_id: accountId,
        integration_type: "stripe",
        connected_at: new Date().toISOString(),
      },
      {
        onConflict: "stripe_account_id",
        ignoreDuplicates: false,
      }
    );

  if (error) {
    console.error("[Stripe callback] DB upsert failed:", error.message, error.code);
    return NextResponse.redirect(`${appUrl}/settings?stripe=error`);
  }

  syncUserMarketingAdmin(state).catch((e) =>
    console.error("[accounts/callback] marketing sync:", e)
  );

  return NextResponse.redirect(`${appUrl}/settings?stripe=success`);
}

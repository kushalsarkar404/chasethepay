import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

/**
 * DEV ONLY: Fetches open invoices from Stripe.
 * By default: connected account. Add ?source=platform to check platform account.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const usePlatform = searchParams.get("source") === "platform";
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Not available in production" },
      { status: 403 }
    );
  }

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

  const account = accounts?.[0];
  if (!account) {
    return NextResponse.json(
      { error: "Connect Stripe first" },
      { status: 400 }
    );
  }

  const stripe = getStripe();
  const stripeAccount = account.stripe_account_id;

  let invoiceList: { id: string; amount_remaining?: number; status?: string }[] = [];
  try {
    const list = usePlatform
      ? await stripe.invoices.list({ status: "open", limit: 50 })
      : await stripe.invoices.list(
          { status: "open", limit: 50 },
          { stripeAccount }
        );
    invoiceList = Array.isArray(list?.data) ? list.data : [];
  } catch (err) {
    return NextResponse.json({
      error: err instanceof Error ? err.message : "Stripe API error",
      source: usePlatform ? "platform" : "connected",
    });
  }
  const base = "https://dashboard.stripe.com/test";
  const invoiceLinks = invoiceList.map((inv) => ({
    id: inv.id,
    amount: inv.amount_remaining,
    status: inv.status,
    link: `${base}/invoices/${inv.id}`,
  }));

  return NextResponse.json({
    source: usePlatform ? "platform" : "connected",
    stripeAccountId: usePlatform ? null : stripeAccount,
    count: invoiceList.length,
    invoices: invoiceLinks,
    connectAccountUrl: `${base}/connect/accounts/${stripeAccount}`,
    hint: usePlatform && invoiceList.length > 0
      ? "Invoices are on the PLATFORM account. Create them inside the connected account (Connect > Accounts > acct_xxx) for the scan to find them."
      : !usePlatform && invoiceList.length === 0
        ? "No open invoices on connected account. Try ?source=platform to check platform account."
        : undefined,
  });
}

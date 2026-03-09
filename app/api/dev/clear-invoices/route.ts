import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

/**
 * DEV ONLY: Deletes all invoices (and their chases) for the current user.
 * Use this to clear old seed data and start fresh with Stripe-only data.
 */
export async function POST() {
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
    .select("id")
    .eq("user_id", user.id);

  const accountIds = accounts?.map((a) => a.id) ?? [];
  if (!accountIds.length) {
    return NextResponse.json({ deleted: 0, message: "No accounts found." });
  }

  const admin = createAdminClient();

  const { data: invoices } = await admin
    .from("invoices")
    .select("id")
    .in("account_id", accountIds);

  const invoiceIds = invoices?.map((i) => i.id) ?? [];
  if (invoiceIds.length === 0) {
    return NextResponse.json({ deleted: 0, message: "No invoices to clear." });
  }

  await admin.from("chases").delete().in("invoice_id", invoiceIds);
  const { error } = await admin.from("invoices").delete().in("account_id", accountIds);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    deleted: invoiceIds.length,
    message: `Cleared ${invoiceIds.length} invoices. Run Scan to fetch from Stripe.`,
  });
}

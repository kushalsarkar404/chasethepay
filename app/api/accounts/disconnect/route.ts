import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

/**
 * Disconnect Stripe: deletes all accounts for the user.
 * Cascades to invoices and chases (via DB constraints).
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
    .select("id")
    .eq("user_id", user.id);

  const accountIds = accounts?.map((a) => a.id) ?? [];
  if (!accountIds.length) {
    return NextResponse.json({ ok: true, message: "No Stripe account connected." });
  }

  const admin = createAdminClient();

  const { error } = await admin
    .from("accounts")
    .delete()
    .in("id", accountIds);

  if (error) {
    console.error("[accounts/disconnect] Delete error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to disconnect" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}

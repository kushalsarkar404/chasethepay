import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
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
  if (accountIds.length === 0) {
    return NextResponse.json({ invoices: [] });
  }

  const { data: invoices, error } = await supabase
    .from("invoices")
    .select("*")
    .in("account_id", accountIds)
    .eq("status", "open")
    .gt("amount_remaining", 0)
    .order("due_date", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ invoices: invoices ?? [] });
}

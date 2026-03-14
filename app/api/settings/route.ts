import { createClient } from "@/lib/supabase/server";
import { settingsUpdateSchema } from "@/lib/validations";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const { data: accounts } = await supabase
    .from("accounts")
    .select("id, stripe_account_id")
    .eq("user_id", user.id);

  const stripeConnected = (accounts?.length ?? 0) > 0;
  const stripeAccountId = accounts?.[0]?.stripe_account_id ?? null;

  let chasesUsedThisMonth: number | undefined;
  if (data?.plan !== "pro" && (accounts?.length ?? 0) > 0) {
    const accountIds = accounts!.map((a) => a.id);
    const { data: userInvoices } = await supabase
      .from("invoices")
      .select("id")
      .in("account_id", accountIds);
    const invIds = userInvoices?.map((i) => i.id) ?? [];
    if (invIds.length > 0) {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      const { count } = await supabase
        .from("chases")
        .select("*", { count: "exact", head: true })
        .gte("sent_at", startOfMonth.toISOString())
        .in("invoice_id", invIds);
      chasesUsedThisMonth = count ?? 0;
    } else {
      chasesUsedThisMonth = 0;
    }
  }

  if (error || !data) {
    const { data: created, error: insertError } = await supabase
      .from("settings")
      .insert({
        user_id: user.id,
        plan: "free",
      })
      .select()
      .single();
    if (insertError) {
      return NextResponse.json(
        { error: "Settings not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({
      ...created,
      stripeConnected,
      stripeAccountId,
      ...(chasesUsedThisMonth !== undefined && { chasesUsedThisMonth }),
    });
  }

  return NextResponse.json({
    ...data,
    stripeConnected,
    stripeAccountId,
    ...(chasesUsedThisMonth !== undefined && { chasesUsedThisMonth }),
  });
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = settingsUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().formErrors[0] || "Invalid input" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("settings")
    .upsert(
      { user_id: user.id, ...parsed.data },
      { onConflict: "user_id" }
    );

  if (error) {
    console.error("[settings] Upsert error:", error.message, error.code);
    return NextResponse.json(
      { error: error.message || "Failed to save settings" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}

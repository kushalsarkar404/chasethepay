import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { chaseSendSchema } from "@/lib/validations";
import { executeChase } from "@/lib/chase";
import { NextResponse } from "next/server";

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

  const parsed = chaseSendSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().formErrors[0] || "Invalid input" },
      { status: 400 }
    );
  }

  const { invoiceId } = parsed.data;

  const { data: invoice } = await supabase
    .from("invoices")
    .select("id, account_id, customer_name")
    .eq("id", invoiceId)
    .single();

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  const { data: account } = await supabase
    .from("accounts")
    .select("user_id")
    .eq("id", invoice.account_id)
    .single();

  if (!account || account.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const emailOverride =
    process.env.NODE_ENV === "development" && process.env.DEV_EMAIL_OVERRIDE
      ? process.env.DEV_EMAIL_OVERRIDE
      : undefined;

  const admin = createAdminClient();
  const result = await executeChase(admin, invoiceId, user.id, { emailOverride });

  if (!result.ok) {
    if (result.error === "FREE_LIMIT_REACHED") {
      return NextResponse.json(
        { error: "FREE_LIMIT_REACHED", message: "Free plan limit reached" },
        { status: 403 }
      );
    }
    const status = result.error?.includes("not found") ? 404 : 400;
    return NextResponse.json(
      { error: result.error ?? "Failed to send" },
      { status }
    );
  }

  return NextResponse.json({
    ok: true,
    customerName: invoice.customer_name ?? "Customer",
  });
}

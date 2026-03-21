import { createAdminClient } from "@/lib/supabase/admin";
import { trackServer } from "@/lib/analytics-server";
import { AnalyticsEvents } from "@/lib/analytics-events";
import { getResend } from "@/lib/email";
import { NextResponse } from "next/server";

/**
 * Resend webhook for email.opened and email.clicked.
 * Enables behavior-aware chase customization (e.g. "You opened our last reminder—here's the pay link again").
 *
 * Configure in Resend Dashboard → Webhooks → Add endpoint:
 *   URL: https://yoursite.com/api/webhooks/resend
 *   Events: email.opened, email.clicked
 *
 * Enable open/click tracking on your domain in Resend (Domains → your domain → Configuration).
 */
export async function POST(req: Request) {
  const rawBody = await req.text();
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("[webhooks/resend] RESEND_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const headersList = req.headers;
  const svixId = headersList.get("svix-id");
  const svixTimestamp = headersList.get("svix-timestamp");
  const svixSignature = headersList.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing webhook headers" }, { status: 400 });
  }

  let event: { type: string; data?: { tags?: Record<string, string> } };
  try {
    const resend = getResend();
    event = resend.webhooks.verify({
      payload: rawBody,
      headers: { id: svixId, timestamp: svixTimestamp, signature: svixSignature },
      webhookSecret,
    }) as { type: string; data?: { tags?: Record<string, string> } };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Invalid signature: ${msg}` }, { status: 400 });
  }

  const chaseId = event.data?.tags?.chase_id;
  if (!chaseId) return NextResponse.json({ received: true });

  if (event.type !== "email.opened" && event.type !== "email.clicked") {
    return NextResponse.json({ received: true });
  }

  const admin = createAdminClient();
  const now = new Date().toISOString();

  // Get user_id for Mixpanel (chase -> invoice -> account -> user_id)
  const { data: chaseRow } = await admin
    .from("chases")
    .select("invoice_id")
    .eq("id", chaseId)
    .single();
  const { data: invRow } = chaseRow
    ? await admin.from("invoices").select("account_id").eq("id", chaseRow.invoice_id).single()
    : { data: null };
  const { data: accRow } = invRow
    ? await admin.from("accounts").select("user_id").eq("id", invRow.account_id).single()
    : { data: null };
  const userId = accRow?.user_id;

  if (event.type === "email.opened") {
    const { error } = await admin
      .from("chases")
      .update({ opened_at: now })
      .eq("id", chaseId)
      .is("opened_at", null);
    if (error) console.error("[webhooks/resend] Failed to update opened_at:", error);
    if (userId) trackServer(userId, AnalyticsEvents.Chase_EmailOpened, { chase_id: chaseId }).catch(() => {});
  } else if (event.type === "email.clicked") {
    const { error } = await admin
      .from("chases")
      .update({ clicked_at: now })
      .eq("id", chaseId)
      .is("clicked_at", null);
    if (error) console.error("[webhooks/resend] Failed to update clicked_at:", error);
    if (userId) trackServer(userId, AnalyticsEvents.Chase_EmailClicked, { chase_id: chaseId }).catch(() => {});
  }

  return NextResponse.json({ received: true });
}

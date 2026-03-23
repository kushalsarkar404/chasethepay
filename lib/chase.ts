import type { SupabaseClient } from "@supabase/supabase-js";
import { getStripe } from "@/lib/stripe";
import { getResend, sendChaseEmail } from "@/lib/email";
import { generateChaseMessage } from "@/lib/openai";
import { format, subDays, subMinutes } from "date-fns";

const FREE_CHASES_PER_MONTH = 10;

interface ChaseResult {
  ok: boolean;
  error?: string;
}

/**
 * Execute a chase for an invoice. Uses admin client for cron (no user session).
 * Performs all eligibility checks, sends email, and updates DB.
 */
export async function executeChase(
  admin: SupabaseClient,
  invoiceId: string,
  userId: string,
  options?: { emailOverride?: string }
): Promise<ChaseResult> {
  const { data: invoice, error: invErr } = await admin
    .from("invoices")
    .select("id, account_id, stripe_invoice_id, customer_name, customer_email, amount_remaining, due_date, chase_count, last_chased_at, status, payment_url")
    .eq("id", invoiceId)
    .single();

  if (invErr || !invoice) return { ok: false, error: "Invoice not found" };

  const { data: account } = await admin
    .from("accounts")
    .select("user_id, stripe_account_id")
    .eq("id", invoice.account_id)
    .single();

  if (!account || account.user_id !== userId) return { ok: false, error: "Account mismatch" };

  if (invoice.status !== "open" || !invoice.customer_email) {
    return { ok: false, error: "Invoice has no email or is not open" };
  }

  const { data: settings } = await admin
    .from("settings")
    .select("max_chases, chase_frequency, ai_tone, plan, sender_name, reply_to_email")
    .eq("user_id", userId)
    .single();

  const maxChases = settings?.max_chases ?? 5;
  const frequency = settings?.chase_frequency ?? "3days";
  const cutoff =
    frequency === "1min"
      ? subMinutes(new Date(), 1)
      : subDays(new Date(), frequency === "1day" ? 1 : frequency === "3days" ? 3 : 7);

  if (invoice.chase_count >= maxChases) return { ok: false, error: "Max chases reached" };

  const lastChased = invoice.last_chased_at ? new Date(invoice.last_chased_at) : null;
  const lastChasedRounded = lastChased
    ? new Date(Math.floor(lastChased.getTime() / 60000) * 60000)
    : null;
  if (lastChasedRounded && cutoff < lastChasedRounded) return { ok: false, error: "Frequency not met" };

  if (settings?.plan !== "pro") {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: userAccounts } = await admin.from("accounts").select("id").eq("user_id", userId);
    const accIds = userAccounts?.map((a) => a.id) ?? [];
    const { data: userInvoices } = await admin.from("invoices").select("id").in("account_id", accIds);
    const invIds = userInvoices?.map((i) => i.id) ?? [];

    const { count } = await admin
      .from("chases")
      .select("*", { count: "exact", head: true })
      .gte("sent_at", startOfMonth.toISOString())
      .in("invoice_id", invIds);

    if ((count ?? 0) >= FREE_CHASES_PER_MONTH) return { ok: false, error: "FREE_LIMIT_REACHED" };
  }

  const tone = (settings?.ai_tone ?? "friendly") as "friendly" | "professional" | "firm";
  const chaseNumber = (invoice.chase_count ?? 0) + 1;
  const autoTone = chaseNumber >= 5 ? "firm" : chaseNumber >= 3 ? "professional" : tone;
  const dueDate = new Date(invoice.due_date);
  const dueDateFormatted = format(dueDate, "MMMM d, yyyy");
  const businessName = settings?.sender_name ?? "Your business";

  // Behavior from previous chase (opened but not clicked vs clicked pay link)
  let lastChaseBehavior: "opened" | "clicked" | null = null;
  if (chaseNumber > 1) {
    const { data: lastChase } = await admin
      .from("chases")
      .select("opened_at, clicked_at")
      .eq("invoice_id", invoiceId)
      .order("sent_at", { ascending: false })
      .limit(1)
      .single();
    if (lastChase?.clicked_at) lastChaseBehavior = "clicked";
    else if (lastChase?.opened_at) lastChaseBehavior = "opened";
  }

  let message: string;
  try {
    message = await generateChaseMessage({
      customerName: invoice.customer_name ?? "Customer",
      amountDollars: (invoice.amount_remaining ?? 0) / 100,
      dueDateFormatted,
      tone: autoTone,
      businessName,
      chaseNumber,
      lastChaseBehavior,
    });
  } catch (err) {
    console.error("[chase] OpenAI error:", err);
    return { ok: false, error: "Failed to generate message" };
  }

  let paymentUrl: string | null =
    typeof invoice.payment_url === "string" && invoice.payment_url
      ? invoice.payment_url
      : null;

  if (!paymentUrl && invoice.stripe_invoice_id && account.stripe_account_id) {
    try {
      const stripe = getStripe();
      let stripeInv = await stripe.invoices.retrieve(invoice.stripe_invoice_id, {
        stripeAccount: account.stripe_account_id,
      });
      paymentUrl = stripeInv.hosted_invoice_url ?? null;

      if (!paymentUrl && stripeInv.status === "draft") {
        await stripe.invoices.finalizeInvoice(invoice.stripe_invoice_id, {
          stripeAccount: account.stripe_account_id,
        });
        stripeInv = await stripe.invoices.retrieve(invoice.stripe_invoice_id, {
          stripeAccount: account.stripe_account_id,
        });
        paymentUrl = stripeInv.hosted_invoice_url ?? null;
      }

      if (paymentUrl) {
        await admin.from("invoices").update({ payment_url: paymentUrl }).eq("id", invoiceId);
      } else {
        console.warn("[chase] No payment URL for invoice", invoiceId, "stripe:", invoice.stripe_invoice_id);
      }
    } catch (err) {
      console.warn("[chase] Failed to fetch payment URL:", err instanceof Error ? err.message : err);
    }
  }

  const messageHtml = message
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\\n/g, "<br>")
    .replace(/\n/g, "<br>");

  const payButtonBlock =
    paymentUrl &&
    `<tr><td style="padding: 0 40px 24px; font-size: 16px;"><table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr><td align="center"><a href="${paymentUrl}" style="display: inline-block; background: #2563eb; color: #ffffff; font-weight: 600; font-size: 16px; padding: 16px 40px; border-radius: 6px; text-decoration: none; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">Pay Now</a><p style="margin: 8px 0 0; font-size: 11px; color: #9ca3af;">via ChaseThePay</p></td></tr></table></td></tr>`;

  const emailBody = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #f4f4f5; padding: 40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
<tr><td style="padding: 40px 40px 16px; font-size: 16px; line-height: 1.6; color: #374151;">
${messageHtml}
</td></tr>${payButtonBlock || ""}
<tr><td style="padding: 24px 40px 40px; font-size: 12px; line-height: 1.5; color: #9ca3af; border-top: 1px solid #e5e7eb;">
If you've already paid, please disregard this message.
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

  const fromEmail = process.env.EMAIL_FROM ?? "noreply@resend.dev";
  const senderName = settings?.sender_name?.trim();
  const fromValue = senderName
    ? `"${senderName.replace(/"/g, "")}" <${fromEmail}>`
    : fromEmail;
  const toEmail = options?.emailOverride ?? invoice.customer_email;

  const replyTo = settings?.reply_to_email?.trim() || undefined;

  // Insert chase first so we have an id for Resend tags (open/click webhook correlation)
  const { data: chaseRow, error: chaseErr } = await admin
    .from("chases")
    .insert({ invoice_id: invoiceId, type: "email", message, status: "sent" })
    .select("id")
    .single();

  if (chaseErr || !chaseRow) {
    console.error("[chase] DB insert error:", chaseErr);
    return { ok: false, error: "Failed to log chase" };
  }

  try {
    await sendChaseEmail({
      to: toEmail,
      from: fromValue,
      subject: `Reminder: Invoice due ${dueDateFormatted}`,
      body: emailBody,
      isHtml: true,
      replyTo,
      tags: [{ name: "chase_id", value: chaseRow.id }],
    });
  } catch (err) {
    console.error("[chase] Resend error:", err);
    await admin.from("chases").delete().eq("id", chaseRow.id);
    return { ok: false, error: err instanceof Error ? err.message : "Failed to send" };
  }

  await admin
    .from("invoices")
    .update({ chase_count: chaseNumber, last_chased_at: new Date().toISOString() })
    .eq("id", invoiceId);

  const { syncUserMarketingAdmin } = await import("@/lib/marketing");
  syncUserMarketingAdmin(userId).catch((e) => console.error("[chase] marketing sync:", e));

  return { ok: true };
}

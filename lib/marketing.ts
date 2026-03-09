import { createClient } from "@/lib/supabase/server";

export type MarketingEvent = "sign_in" | "view_billing" | "survey_sent";

/**
 * Track a marketing event and optionally sync computed metrics.
 * Call from API routes or server components.
 */
export async function trackMarketingEvent(
  userId: string,
  event?: MarketingEvent
): Promise<void> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data: existing } = await supabase
    .from("user_marketing")
    .select("user_id, first_signed_in_at, viewed_billing_at")
    .eq("user_id", userId)
    .single();

  const updates: Record<string, unknown> = { updated_at: now };

  if (event === "sign_in") {
    if (!existing) {
      updates.first_signed_in_at = now;
    }
    updates.last_signed_in_at = now;
  } else if (event === "view_billing") {
    if (!existing?.viewed_billing_at) {
      updates.viewed_billing_at = now;
    }
  }
  // survey_sent is typically set by admin/backend, not from client

  await supabase.from("user_marketing").upsert(
    {
      user_id: userId,
      ...updates,
    },
    { onConflict: "user_id" }
  );

  await syncUserMarketing(userId);
}

/**
 * Sync computed metrics (chases count, recovered amount, plan, stripe status) from source tables.
 */
export async function syncUserMarketing(userId: string): Promise<void> {
  const supabase = await createClient();
  await supabase.rpc("sync_user_marketing", { p_user_id: userId });
}

/**
 * Sync marketing metrics using admin client (for webhooks, callbacks - no user session).
 */
export async function syncUserMarketingAdmin(userId: string): Promise<void> {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const admin = createAdminClient();
  await admin.rpc("sync_user_marketing", { p_user_id: userId });
}

/**
 * Mark that a survey was sent to the user.
 */
export async function markSurveySent(userId: string): Promise<void> {
  const supabase = await createClient();
  const now = new Date().toISOString();
  await supabase
    .from("user_marketing")
    .upsert(
      {
        user_id: userId,
        survey_sent_at: now,
        updated_at: now,
      },
      { onConflict: "user_id" }
    );
}

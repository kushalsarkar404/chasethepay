"use client";

import mixpanel from "mixpanel-browser";
import { AnalyticsEvents } from "./analytics-events";

const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;

const isEnabled = typeof window !== "undefined" && MIXPANEL_TOKEN;

export function initMixpanel() {
  if (!isEnabled) return;
  mixpanel.init(MIXPANEL_TOKEN, {
    debug: process.env.NODE_ENV === "development",
    track_pageview: false, // we track page views explicitly with Page_Viewed
    persistence: "localStorage",
    ignore_dnt: false,
    autocapture: true,
    record_sessions_percent: 100,
    ip: true,
  });
}

type Plan = "free" | "pro" | "test";

export function identifyUser(
  userId: string,
  traits: {
    email: string;
    plan: Plan;
    stripeConnected: boolean;
    createdAt: string;
  }
) {
  if (!isEnabled) return;
  mixpanel.identify(userId);
  mixpanel.people.set({
    $email: traits.email,
    $created: traits.createdAt,
    plan: traits.plan,
    stripe_connected: traits.stripeConnected,
    $name: traits.email.split("@")[0],
  });
  mixpanel.register({
    user_plan: traits.plan,
    stripe_connected: traits.stripeConnected,
  });
}

/**
 * Track a typed event with consistent properties.
 * Best practice: use AnalyticsEvents constants.
 */
export function track(
  event: string,
  properties?: Record<string, string | number | boolean | undefined | null>
) {
  if (!isEnabled) return;
  mixpanel.track(event, {
    ...properties,
    app_version: process.env.NEXT_PUBLIC_APP_VERSION ?? "1.0.0",
    environment: process.env.NODE_ENV,
  });
}

/** Track recovered revenue (invoice paid after chase). */
export function trackRevenue(amountCents: number, invoiceId: string) {
  if (!isEnabled) return;
  const amountUsd = amountCents / 100;
  mixpanel.people.track_charge(amountUsd);
  mixpanel.track("Revenue_Recovered", {
    amount_usd: amountUsd,
    amount_cents: amountCents,
    invoice_id: invoiceId,
  });
}

export function resetUser() {
  if (typeof window === "undefined") return;
  mixpanel.reset();
}

// Re-export for convenience
export { AnalyticsEvents };

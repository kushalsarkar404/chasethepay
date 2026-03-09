"use client";

import { useEffect } from "react";
import { track, AnalyticsEvents } from "@/lib/analytics";

type TrackEvent = "sign_in" | "view_billing";

export function MarketingTracker({ event }: { event?: TrackEvent }) {
  useEffect(() => {
    if (event === "view_billing") track(AnalyticsEvents.Settings_BillingViewed);
    fetch("/api/marketing/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event ? { event } : {}),
    }).catch(() => {});
  }, [event]);
  return null;
}

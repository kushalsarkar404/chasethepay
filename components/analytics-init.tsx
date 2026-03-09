"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { initMixpanel, track, AnalyticsEvents } from "@/lib/analytics";

export function AnalyticsInit() {
  const pathname = usePathname();

  useEffect(() => {
    initMixpanel();
  }, []);

  useEffect(() => {
    if (pathname) {
      track(AnalyticsEvents.Page_Viewed, {
        page: pathname,
        referrer: typeof document !== "undefined" ? document.referrer || undefined : undefined,
      });
    }
  }, [pathname]);

  return null;
}

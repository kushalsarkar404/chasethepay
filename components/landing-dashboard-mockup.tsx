"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * Dashboard mockup for landing page. Shows placeholder if image fails to load.
 * Add chasethepay-dashboard.png to /public for the real screenshot.
 */
export function LandingDashboardMockup() {
  const [imgError, setImgError] = useState(false);

  const placeholder = (
    <div className="landing-dashboard-wrap hidden min-h-[400px] items-center justify-center bg-[var(--landing-surface)] md:flex">
      <div className="w-full max-w-2xl space-y-6 p-8">
        <div className="flex gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 flex-1 rounded-lg bg-[var(--landing-border)]/60"
            />
          ))}
        </div>
        <div className="h-8 w-48 rounded bg-[var(--landing-border)]/60" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex h-12 items-center gap-4 rounded border border-[var(--landing-border)] bg-white px-4"
            >
              <div className="h-3 w-24 rounded bg-[var(--landing-border)]/60" />
              <div className="h-3 w-16 rounded bg-[var(--landing-border)]/60" />
              <div className="h-3 w-20 rounded bg-[var(--landing-border)]/60 ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (imgError) return placeholder;

  return (
    <div className="landing-dashboard-wrap relative mx-auto hidden w-full max-w-6xl overflow-hidden md:block lg:max-w-7xl">
      <Image
        src="/chasethepay-dashboard.png"
        alt="ChaseThePay dashboard showing overdue invoices and recovery"
        width={1200}
        height={720}
        className="w-full h-auto"
        priority
        unoptimized
        onError={() => setImgError(true)}
      />
    </div>
  );
}

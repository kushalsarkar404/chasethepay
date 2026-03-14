"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Zap, ArrowRight } from "lucide-react";
import { track, AnalyticsEvents } from "@/lib/analytics";

const FREE_CHASES_PER_MONTH = 10;

interface FreeChasesBannerProps {
  chasesUsed: number;
  onUpgradeClick?: () => void;
}

export function FreeChasesBanner({
  chasesUsed,
  onUpgradeClick,
}: FreeChasesBannerProps) {
  const remaining = Math.max(0, FREE_CHASES_PER_MONTH - chasesUsed);
  const percentUsed = (chasesUsed / FREE_CHASES_PER_MONTH) * 100;

  useEffect(() => {
    track(AnalyticsEvents.FreeChasesBanner_Viewed, { chases_used: chasesUsed, remaining });
  }, []);

  const handleUpgradeClick = () => {
    track(AnalyticsEvents.FreeChasesBanner_UpgradeClicked);
    onUpgradeClick?.();
  };

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)]/50 p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--green-dim)]">
            <Zap className="h-5 w-5 text-[var(--green)]" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-[var(--text)]">
              {remaining}/{FREE_CHASES_PER_MONTH} free chases left this month
            </p>
            <div className="mt-1.5 h-1.5 w-full max-w-[200px] overflow-hidden rounded-full bg-[var(--border)]">
              <div
                className="h-full rounded-full bg-[var(--green)] transition-all"
                style={{ width: `${percentUsed}%` }}
              />
            </div>
          </div>
        </div>
        <Button
          asChild
          variant="brand"
          size="sm"
          className="shrink-0 w-full sm:w-auto"
          onClick={handleUpgradeClick}
        >
          <Link href="/settings" className="inline-flex items-center gap-1.5">
            Pay for unlimited chases
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { track, AnalyticsEvents } from "@/lib/analytics";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpgradeModal({ open, onOpenChange }: UpgradeModalProps) {
  useEffect(() => {
    if (open) track(AnalyticsEvents.Upgrade_ModalShown);
  }, [open]);

  async function handleUpgrade() {
    track(AnalyticsEvents.Upgrade_ButtonClicked);
    const res = await fetch("/api/billing/checkout", { method: "POST" });
    const data = await res.json();
    if (data.url) {
      track(AnalyticsEvents.Billing_CheckoutStarted);
      window.location.href = data.url;
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-[var(--border)] bg-[var(--bg2)] sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--green-dim)]">
            <CreditCard className="h-6 w-6 text-[var(--green)]" />
          </div>
          <DialogTitle className="text-center font-display text-xl text-[var(--text)]">
            Free limit reached
          </DialogTitle>
          <DialogDescription className="text-center text-[var(--muted)]">
            You&apos;ve used all 10 free chases this month. Upgrade to Pro for unlimited chases.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 sm:justify-center">
          <Button
            variant="outline"
            className="border-[var(--border)]"
            onClick={() => {
              track(AnalyticsEvents.Upgrade_MaybeLaterClicked);
              onOpenChange(false);
            }}
          >
            Maybe later
          </Button>
          <Button variant="brand" onClick={handleUpgrade}>
            Upgrade — $9.99/mo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

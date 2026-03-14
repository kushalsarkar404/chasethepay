"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const FREQUENCY_LABELS: Record<string, string> = {
  "1min": "1 minute",
  "1day": "1 day",
  "3days": "3 days",
  weekly: "1 week",
};

interface FrequencyNotMetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chaseFrequency: string;
}

export function FrequencyNotMetModal({
  open,
  onOpenChange,
  chaseFrequency,
}: FrequencyNotMetModalProps) {
  const frequencyLabel =
    FREQUENCY_LABELS[chaseFrequency] ?? "the configured interval";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-[var(--border)] bg-[var(--bg2)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-[var(--text)]">
            Too soon to send another reminder
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-[var(--text)]">
            You need to wait at least <strong>{frequencyLabel}</strong> between
            reminders for the same invoice.
          </p>
          <p className="text-sm text-[var(--muted)]">
            To send more frequently, update the chase frequency in Settings.
          </p>
          <Button asChild variant="brand" size="sm" className="w-full sm:w-auto">
            <Link href="/settings" onClick={() => onOpenChange(false)}>
              Go to Settings
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

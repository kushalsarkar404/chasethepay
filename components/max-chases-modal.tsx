"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface MaxChasesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  maxChases: number;
}

export function MaxChasesModal({
  open,
  onOpenChange,
  maxChases,
}: MaxChasesModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-[var(--border)] bg-[var(--bg2)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-[var(--text)]">
            Maximum chase attempts reached
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-[var(--text)]">
            You&apos;ve reached the limit of <strong>{maxChases}</strong>{" "}
            {maxChases === 1 ? "reminder" : "reminders"} per invoice for this
            customer.
          </p>
          <p className="text-sm text-[var(--muted)]">
            To send more reminders, increase the &quot;Max chases per
            invoice&quot; limit in Settings.
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

"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2 } from "lucide-react";

interface SuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
  detail?: string;
}

export function SuccessModal({
  open,
  onOpenChange,
  title,
  message,
  detail,
}: SuccessModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-[var(--border)] bg-[var(--bg2)] sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--green-dim)]">
            <CheckCircle2 className="h-7 w-7 text-[var(--green)]" />
          </div>
          <DialogTitle className="text-center font-display text-xl text-[var(--text)]">
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-1 text-center">
          <p className="text-[var(--text)]">{message}</p>
          {detail && (
            <p className="text-sm text-[var(--muted)]">{detail}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TooltipWrapper } from "@/components/tooltip-wrapper";
import { Send } from "lucide-react";
import type { Invoice } from "@/types/database";
import { track, AnalyticsEvents } from "@/lib/analytics";

interface ChaseButtonProps {
  invoice: Invoice;
  onSent?: (data?: { customerName: string }) => void;
  onFreeLimitReached?: () => void;
}

export function ChaseButton({ invoice, onSent, onFreeLimitReached }: ChaseButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/chases/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId: invoice.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data?.error === "FREE_LIMIT_REACHED" && onFreeLimitReached) {
          track(AnalyticsEvents.Chase_FreeLimitReached);
          onFreeLimitReached();
          return;
        }
        throw new Error(data?.message ?? data?.error ?? "Failed to send chase");
      }
      track(AnalyticsEvents.Chase_Sent, {
        invoice_id: invoice.id,
        channel: "email",
        chase_number: invoice.chase_count + 1,
        amount_usd: invoice.amount_remaining / 100,
        days_overdue: Math.floor(
          (Date.now() - new Date(invoice.due_date).getTime()) / (1000 * 60 * 60 * 24)
        ),
      });
      onSent?.({ customerName: data.customerName ?? invoice.customer_name ?? "Customer" });
    } catch (err) {
      const reason = err instanceof Error ? err.message : "unknown";
      track(AnalyticsEvents.Chase_Failed, {
        invoice_id: invoice.id,
        channel: "email",
        reason: reason.includes("email") ? "no_email" : "email_error",
      });
      alert(reason);
    } finally {
      setLoading(false);
    }
  }

  return (
    <TooltipWrapper content="Send a reminder email to the customer">
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={loading}
      className="border-[var(--border)] hover:border-[var(--green)] hover:bg-[var(--green-dim)] hover:text-[var(--green)]"
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        <>
          <Send className="h-3.5 w-3.5" />
          Chase
        </>
      )}
    </Button>
    </TooltipWrapper>
  );
}

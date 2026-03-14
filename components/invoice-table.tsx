"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ChaseButton } from "./chase-button";
import { formatDistanceToNow } from "date-fns";
import type { Invoice } from "@/types/database";
import { cn } from "@/lib/utils";

function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function StatusBadge({ status, recoveredAt }: { status: string; recoveredAt: string | null }) {
  if (recoveredAt) {
    return (
      <Badge className="badge-paid border-0">Paid</Badge>
    );
  }
  if (status === "open") {
    return (
      <Badge className="badge-overdue border-0">Overdue</Badge>
    );
  }
  if (status === "paid") {
    return (
      <Badge className="badge-paid border-0">Paid</Badge>
    );
  }
  return (
    <Badge className="badge-pending border-0">{status}</Badge>
  );
}

interface InvoiceTableProps {
  invoices: Invoice[];
  maxChases?: number;
  chaseFrequency?: string;
  onChaseSent?: (data?: { customerName: string }) => void;
  onFreeLimitReached?: () => void;
  onMaxChasesReached?: (maxChases: number) => void;
  onFrequencyNotMet?: (chaseFrequency: string) => void;
  isLoading?: boolean;
}

export function InvoiceTable({
  invoices,
  maxChases = 5,
  chaseFrequency = "3days",
  onChaseSent,
  onFreeLimitReached,
  onMaxChasesReached,
  onFrequencyNotMet,
  isLoading,
}: InvoiceTableProps) {
  if (isLoading) {
    return (
      <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
        <Table className="min-w-[600px]">
          <TableHeader>
            <TableRow className="border-[var(--border)] hover:bg-transparent">
              <TableHead className="text-[var(--muted)]" title="Customer or company name">Customer</TableHead>
              <TableHead className="text-[var(--muted)]" title="Outstanding balance">Amount</TableHead>
              <TableHead className="text-[var(--muted)]" title="When the invoice was due">Due date</TableHead>
              <TableHead className="text-[var(--muted)]" title="Number of reminder emails sent">Chases</TableHead>
              <TableHead className="text-[var(--muted)]" title="When the last reminder was sent">Last chased</TableHead>
              <TableHead className="text-[var(--muted)]" title="Invoice payment status">Status</TableHead>
              <TableHead className="text-[var(--muted)] w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRow key={i} className="border-[var(--border)] hover:bg-transparent">
                <TableCell><div className="skeleton h-4 w-32" /></TableCell>
                <TableCell><div className="skeleton h-4 w-20" /></TableCell>
                <TableCell><div className="skeleton h-4 w-24" /></TableCell>
                <TableCell><div className="skeleton h-4 w-8" /></TableCell>
                <TableCell><div className="skeleton h-4 w-20" /></TableCell>
                <TableCell><div className="skeleton h-5 w-16 rounded" /></TableCell>
                <TableCell><div className="skeleton h-8 w-20 rounded" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (!invoices.length) {
    return null;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
      <Table className="min-w-[600px]">
          <TableHeader>
            <TableRow className="border-[var(--border)] hover:bg-transparent">
              <TableHead className="text-[var(--muted)] font-medium" title="Customer or company name">Customer</TableHead>
              <TableHead className="text-[var(--muted)] font-medium" title="Outstanding balance">Amount</TableHead>
              <TableHead className="text-[var(--muted)] font-medium" title="When the invoice was due">Due date</TableHead>
              <TableHead className="text-[var(--muted)] font-medium" title="Number of reminder emails sent">Chases</TableHead>
              <TableHead className="text-[var(--muted)] font-medium" title="When the last reminder was sent">Last chased</TableHead>
              <TableHead className="text-[var(--muted)] font-medium" title="Invoice payment status">Status</TableHead>
              <TableHead className="w-28" />
            </TableRow>
          </TableHeader>
        <TableBody>
          {invoices.map((inv) => (
            <TableRow
              key={inv.id}
              className="border-[var(--border)] hover:bg-[var(--surface)]/50"
            >
              <TableCell className="font-medium text-[var(--text)]">
                {inv.customer_name || "—"}
              </TableCell>
              <TableCell>
                <span
                  className={cn(
                    "font-display font-semibold",
                    inv.recovered_at ? "text-[var(--green)]" : "text-[var(--danger)]"
                  )}
                >
                  {formatCents(inv.amount_remaining)}
                </span>
              </TableCell>
              <TableCell className="text-[var(--muted)] text-sm">
                {formatDistanceToNow(new Date(inv.due_date), { addSuffix: true })}
              </TableCell>
              <TableCell className="text-[var(--muted)]">{inv.chase_count}</TableCell>
              <TableCell className="text-[var(--muted)] text-sm">
                {inv.last_chased_at
                  ? formatDistanceToNow(new Date(inv.last_chased_at), { addSuffix: true })
                  : "—"}
              </TableCell>
              <TableCell>
                <StatusBadge status={inv.status} recoveredAt={inv.recovered_at} />
              </TableCell>
              <TableCell>
                {!inv.recovered_at && inv.status === "open" && inv.customer_email && (
                  <ChaseButton
                    invoice={inv}
                    maxChases={maxChases}
                    chaseFrequency={chaseFrequency}
                    onSent={onChaseSent}
                    onFreeLimitReached={onFreeLimitReached}
                    onMaxChasesReached={onMaxChasesReached}
                    onFrequencyNotMet={onFrequencyNotMet}
                  />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

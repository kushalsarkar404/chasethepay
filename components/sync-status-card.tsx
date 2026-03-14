"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format, formatDistanceToNow } from "date-fns";
import { HelpCircle } from "lucide-react";

interface CronStatus {
  lastScan: string | null;
  nextScan: string;
  scanScanned: number;
  scanSynced: number;
  lastAutoChase: string | null;
  nextAutoChase: string;
  autoChaseSent: number;
}

function formatTime(iso: string) {
  return format(new Date(iso), "h:mm a");
}

function formatRelative(iso: string) {
  return formatDistanceToNow(new Date(iso), { addSuffix: true });
}

const EXAMPLE_ROWS = [
  { time: "2:00 PM", action: "Fetch", detail: "12 overdue invoices pulled from Stripe", result: "Dashboard updated" },
  { time: "2:15 PM", action: "Fetch", detail: "2 new invoices, 1 marked paid", result: "Dashboard updated" },
  { time: "3:00 PM", action: "Send", detail: "3 chase emails sent (per your frequency)", result: "Customers reminded" },
  { time: "3:15 PM", action: "Fetch", detail: "No changes", result: "—" },
];

export function SyncStatusCard() {
  const { data, isLoading } = useQuery<CronStatus>({
    queryKey: ["cron-status"],
    queryFn: async () => {
      const res = await fetch("/api/cron-status");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    refetchInterval: 15 * 60 * 1000,
  });

  const [learnOpen, setLearnOpen] = useState(false);

  if (isLoading || !data) return null;

  return (
    <>
      <div className="mb-6 rounded-xl border border-[var(--border)]/60 bg-[var(--surface)]/30 px-3 py-3 sm:mb-8 sm:px-5 sm:py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="grid min-w-0 grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4 sm:gap-x-8">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">Last fetched</p>
              <p className="mt-0.5 font-medium text-[var(--text)]">
                {data.lastScan ? formatRelative(data.lastScan) : "—"}
              </p>
              {data.lastScan && data.scanScanned + data.scanSynced > 0 && (
                <p className="text-xs text-[var(--muted)]">
                  {data.scanScanned} fetched, {data.scanSynced} updated
                </p>
              )}
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">Next fetch</p>
              <p className="mt-0.5 font-semibold text-[var(--green)]">{formatTime(data.nextScan)}</p>
              <p className="text-xs text-[var(--muted)]">Every 15 min</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">Last chase</p>
              <p className="mt-0.5 font-medium text-[var(--text)]">
                {data.lastAutoChase ? formatRelative(data.lastAutoChase) : "—"}
              </p>
              {data.lastAutoChase && data.autoChaseSent > 0 && (
                <p className="text-xs text-[var(--muted)]">{data.autoChaseSent} email{data.autoChaseSent === 1 ? "" : "s"} sent</p>
              )}
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">Next chase</p>
              <p className="mt-0.5 font-semibold text-[var(--green)]">{formatTime(data.nextAutoChase)}</p>
              <p className="text-xs text-[var(--muted)]">Hourly</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setLearnOpen(true)}
            className="flex items-center gap-1.5 text-sm text-[var(--green)] hover:underline sm:self-start"
          >
            <HelpCircle className="h-4 w-4 shrink-0" />
            Learn how it works
          </button>
        </div>
      </div>

      <Dialog open={learnOpen} onOpenChange={setLearnOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-[var(--border)] bg-[var(--bg2)] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-lg text-[var(--text)]">
              How automation works
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm text-[var(--text)]">
            <p className="text-[var(--muted)]">
              ChaseThePay runs two automated jobs in the background. You don&apos;t need to do anything—we keep your dashboard fresh and send reminders based on your settings.
            </p>
            <div className="space-y-2">
              <div className="rounded-lg border border-[var(--border)]/60 bg-[var(--surface)]/50 p-3">
                <p className="font-semibold text-[var(--text)]">Fetch (every 15 min)</p>
                <p className="mt-1 text-[var(--muted)]">
                  Pulls overdue invoices from Stripe and updates payment status. New and paid invoices appear in your dashboard automatically.
                </p>
              </div>
              <div className="rounded-lg border border-[var(--border)]/60 bg-[var(--surface)]/50 p-3">
                <p className="font-semibold text-[var(--text)]">Send (hourly)</p>
                <p className="mt-1 text-[var(--muted)]">
                  Sends chase emails based on your configuration: frequency (daily, every 3 days, or weekly), max chases per invoice, and plan limits.
                </p>
              </div>
            </div>
            <div>
              <p className="mb-2 font-medium text-[var(--text)]">Example timeline</p>
              <div className="overflow-hidden rounded-lg border border-[var(--border)]">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--surface)]/50">
                      <th className="px-3 py-2 font-medium text-[var(--muted)]">Time</th>
                      <th className="px-3 py-2 font-medium text-[var(--muted)]">Action</th>
                      <th className="px-3 py-2 font-medium text-[var(--muted)]">Detail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {EXAMPLE_ROWS.map((row, i) => (
                      <tr key={i} className="border-b border-[var(--border)]/50 last:border-0">
                        <td className="px-3 py-2 font-mono text-xs text-[var(--text)]">{row.time}</td>
                        <td className="px-3 py-2">
                          <span
                            className={
                              row.action === "Send"
                                ? "rounded bg-[var(--green-dim)] px-1.5 py-0.5 text-xs font-medium text-[var(--green)]"
                                : "rounded bg-[var(--surface)] px-1.5 py-0.5 text-xs font-medium text-[var(--muted)]"
                            }
                          >
                            {row.action}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-[var(--muted)]">{row.detail}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <p className="text-xs text-[var(--muted2)]">
              Use <strong>Refresh from Stripe</strong> anytime to manually fetch the latest invoices.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

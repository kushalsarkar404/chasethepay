"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { track, AnalyticsEvents } from "@/lib/analytics";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface SentEmail {
  id: string;
  message: string;
  sentAt: string;
  status: string;
  invoiceId: string;
  recipientName: string;
  recipientEmail: string;
}

function truncate(str: string, len: number) {
  if (str.length <= len) return str;
  return str.slice(0, len) + "…";
}

export default function SentEmailsPage() {
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [detailEmail, setDetailEmail] = useState<SentEmail | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["sent-emails"],
    queryFn: async () => {
      const res = await fetch("/api/sent-emails");
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      return json.items as SentEmail[];
    },
  });

  const items = data ?? [];

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((i) => i.id)));
    }
  };

  const handleDelete = async () => {
    if (selectedIds.size === 0) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/sent-emails", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });
      if (!res.ok) throw new Error("Failed to delete");
      track(AnalyticsEvents.SentEmails_Deleted, { count: selectedIds.size });
      setSelectedIds(new Set());
      queryClient.invalidateQueries({ queryKey: ["sent-emails"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      setDetailEmail(null);
    } catch {
      alert("Failed to delete. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 md:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-xl font-bold tracking-tight text-[var(--text)] sm:text-2xl">
            Sent emails
          </h1>
          <p className="mt-1 text-xs text-[var(--muted)] sm:text-sm">
            Reminder emails sent to customers
          </p>
        </div>
        {selectedIds.size > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="border-[var(--danger)] text-[var(--danger)] hover:bg-[var(--danger)]/10 hover:text-[var(--danger)]"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 className="h-4 w-4" />
            Delete {selectedIds.size} selected
          </Button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
        {isLoading ? (
          <div className="p-8">
            <div className="skeleton h-8 w-full max-w-md" />
            <div className="mt-4 space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="skeleton h-12 w-full" />
              ))}
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-[var(--muted)]">No sent emails yet.</p>
            <p className="mt-1 text-sm text-[var(--muted2)]">
              Chase overdue invoices from the Dashboard to send reminders.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-[var(--border)] hover:bg-transparent">
                <TableHead className="w-12 p-3">
                  <input
                    type="checkbox"
                    checked={items.length > 0 && selectedIds.size === items.length}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-[var(--border)]"
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead className="text-[var(--muted)]">Recipient</TableHead>
                <TableHead className="text-[var(--muted)]">Content</TableHead>
                <TableHead className="text-[var(--muted)]">Sent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow
                  key={item.id}
                  className={cn(
                    "cursor-pointer border-[var(--border)] transition-colors hover:bg-[var(--surface)]/80",
                    selectedIds.has(item.id) && "bg-[var(--green-dim)]/30"
                  )}
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest('input[type="checkbox"]')) return;
                    track(AnalyticsEvents.SentEmails_DetailOpened, { invoice_id: item.invoiceId });
                    setDetailEmail(item);
                  }}
                >
                  <TableCell
                    className="w-12 p-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(item.id)}
                      onChange={() => toggleSelect(item.id)}
                      className="h-4 w-4 rounded border-[var(--border)]"
                      aria-label={`Select ${item.recipientName}`}
                    />
                  </TableCell>
                  <TableCell className="p-3">
                    <div>
                      <p className="font-medium text-[var(--text)]">
                        {item.recipientName}
                      </p>
                      <p className="text-xs text-[var(--muted)]">
                        {item.recipientEmail}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px] overflow-hidden p-3 text-sm text-[var(--muted)]">
                    <span className="block truncate" title={item.message.replace(/\n/g, " ")}>
                      {truncate(item.message.replace(/\n/g, " "), 60)}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap p-3 text-sm text-[var(--muted)]">
                    {formatDistanceToNow(new Date(item.sentAt), { addSuffix: true })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={!!detailEmail} onOpenChange={(open) => !open && setDetailEmail(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-[var(--border)] bg-[var(--bg2)] sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-display text-lg text-[var(--text)]">
              {detailEmail?.recipientName ?? "Email"}
            </DialogTitle>
          </DialogHeader>
          {detailEmail && (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
                  Recipient
                </p>
                <p className="mt-1 text-[var(--text)]">
                  {detailEmail.recipientName}
                </p>
                <p className="text-sm text-[var(--muted)]">
                  {detailEmail.recipientEmail}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
                  Sent
                </p>
                <p className="mt-1 text-[var(--text)]">
                  {new Date(detailEmail.sentAt).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
                  Message
                </p>
                <div className="mt-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
                  <pre className="whitespace-pre-wrap font-sans text-sm text-[var(--text)] leading-relaxed">
                    {detailEmail.message}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

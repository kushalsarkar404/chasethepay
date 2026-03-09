"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { InvoiceTable } from "@/components/invoice-table";
import { SuccessModal } from "@/components/success-modal";
import { UpgradeModal } from "@/components/upgrade-modal";
import { StripeConnectButton } from "@/components/stripe-connect-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RefreshCw, Inbox, Filter, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { TooltipWrapper } from "@/components/tooltip-wrapper";
import { cn } from "@/lib/utils";
import type { Invoice } from "@/types/database";
import { track, AnalyticsEvents } from "@/lib/analytics";

type DateRangePreset = "7d" | "30d" | "90d" | "all";

interface RecoveryItem {
  id: string;
  stripeInvoiceId: string | null;
  customerName: string | null;
  amount: number;
  recoveredAt: string | null;
}

interface DashboardContentProps {
  invoices: Invoice[];
  analytics: {
    totalRecovered: number;
    recoveryHistory?: RecoveryItem[];
  } | null;
  hasStripeConnected: boolean;
}

export function DashboardContent({
  invoices: initialInvoices,
  analytics,
  hasStripeConnected,
}: DashboardContentProps) {
  const [activeTab, setActiveTab] = useState<"overdue" | "recovery">("overdue");
  const [dateRange, setDateRange] = useState<DateRangePreset>("all");
  const [amountMin, setAmountMin] = useState("");
  const [amountMax, setAmountMax] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshModal, setRefreshModal] = useState<{ open: boolean; scanned: number; updated: number } | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [chaseModal, setChaseModal] = useState<{ open: boolean; customerName: string } | null>(null);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const { data: invoices, isLoading, refetch } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const res = await fetch("/api/invoices");
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      return json.invoices ?? [];
    },
    initialData: initialInvoices,
    refetchInterval: 15 * 60 * 1000, // poll every 15 min (matches cron scan)
  });

  const queryClient = useQueryClient();
  const { data: analyticsData } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const res = await fetch("/api/analytics");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    initialData: analytics,
    enabled: hasStripeConnected,
    refetchInterval: 15 * 60 * 1000, // poll every 15 min (matches cron scan)
  });

  const displayAnalytics = analyticsData ?? analytics;
  const recoveryHistory = displayAnalytics?.recoveryHistory ?? [];

  const getDateCutoff = () => {
    const now = new Date();
    switch (dateRange) {
      case "7d":
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case "30d":
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case "90d":
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      default:
        return null;
    }
  };

  const filteredInvoices = useMemo(() => {
    if (!invoices) return [];
    const cutoff = getDateCutoff();
    const minCents = amountMin ? Math.round(parseFloat(amountMin) * 100) : null;
    const maxCents = amountMax ? Math.round(parseFloat(amountMax) * 100) : null;
    const q = searchQuery.toLowerCase().trim();

    return invoices.filter((inv: Invoice) => {
      if (cutoff && new Date(inv.due_date) < cutoff) return false;
      if (minCents != null && (inv.amount_remaining ?? 0) < minCents) return false;
      if (maxCents != null && (inv.amount_remaining ?? 0) > maxCents) return false;
      if (q && !(inv.customer_name ?? "").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [invoices, dateRange, amountMin, amountMax, searchQuery]);

  const filteredRecoveryHistory = useMemo(() => {
    const cutoff = getDateCutoff();
    const minCents = amountMin ? Math.round(parseFloat(amountMin) * 100) : null;
    const maxCents = amountMax ? Math.round(parseFloat(amountMax) * 100) : null;
    const q = searchQuery.toLowerCase().trim();

    return recoveryHistory.filter((r: RecoveryItem) => {
      if (cutoff && r.recoveredAt && new Date(r.recoveredAt) < cutoff) return false;
      if (minCents != null && r.amount < minCents) return false;
      if (maxCents != null && r.amount > maxCents) return false;
      if (q && !(r.customerName ?? "").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [recoveryHistory, dateRange, amountMin, amountMax, searchQuery]);

  const hasActiveFilters =
    dateRange !== "all" || amountMin !== "" || amountMax !== "" || searchQuery !== "";

  const clearFilters = () => {
    setDateRange("all");
    setAmountMin("");
    setAmountMax("");
    setSearchQuery("");
  };

  useEffect(() => {
    if (!hasStripeConnected) return;
    const supabase = createClient();
    const channel = supabase
      .channel("invoices-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "invoices" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["invoices"] });
          queryClient.invalidateQueries({ queryKey: ["analytics"] });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [hasStripeConnected, queryClient]);

  const totalRecoveredFiltered =
    filteredRecoveryHistory.reduce((s: number, r: RecoveryItem) => s + r.amount, 0);
  const totalRecoveredFormatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(totalRecoveredFiltered / 100);

  const totalAmountOverdue =
    filteredInvoices.reduce((s: number, i: Invoice) => s + (i.amount_remaining ?? 0), 0);
  const totalAmountOverdueFormatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(totalAmountOverdue / 100);

  const overdueCount = filteredInvoices.length;
  const recoveredCount = filteredRecoveryHistory.length;

  if (!hasStripeConnected) {
    return (
      <div className="p-8">
        <div className="mx-auto max-w-2xl">
          <div className="section-label mb-2">Get started</div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--text)]">
            Connect your Stripe account
          </h1>
          <p className="mt-3 text-[var(--muted)]">
            ChaseThePay pulls overdue invoices from Stripe and sends AI-crafted
            email reminders to your customers. Connect once, then we handle the
            rest.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)]/50 p-16">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--green-dim)]">
              <Inbox className="h-8 w-8 text-[var(--green)]" />
            </div>
            <p className="mb-6 text-center text-[var(--muted)]">
              No invoices yet. Connect Stripe to import overdue invoices and
              start chasing.
            </p>
            <StripeConnectButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--text)]">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Overdue invoices and recovery analytics
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <TooltipWrapper content="Fetch new invoices from Stripe, update payment status, and refresh the dashboard">
          <Button
            variant="brand"
            size="sm"
            onClick={async () => {
              setRefreshing(true);
              try {
                const [scanRes, syncRes] = await Promise.all([
                  fetch("/api/invoices/scan", { method: "POST" }),
                  fetch("/api/invoices/sync", { method: "POST" }),
                ]);
                const scanData = await scanRes.json();
                const syncData = await syncRes.json();
                refetch();
                queryClient.invalidateQueries({ queryKey: ["analytics"] });
                track(AnalyticsEvents.Dashboard_Refreshed, {
                  invoices_scanned: scanData.scanned ?? 0,
                  status_updated: syncData.updated ?? 0,
                });
                setRefreshModal({
                  open: true,
                  scanned: scanData.scanned ?? 0,
                  updated: syncData.updated ?? 0,
                });
              } finally {
                setRefreshing(false);
              }
            }}
            disabled={refreshing || isLoading}
          >
            <RefreshCw className={`h-4 w-4 shrink-0 ${refreshing || isLoading ? "animate-spin" : ""}`} />
            Refresh from Stripe
          </Button>
          </TooltipWrapper>
        </div>
      </div>

      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <TooltipWrapper content="Number of open, overdue invoices ready to chase">
        <div className="card-ctp p-5">
          <p className="text-sm text-[var(--muted)]">Overdue invoices</p>
          <p className="font-display mt-1 text-2xl font-bold text-[var(--text)]">
            {overdueCount}
          </p>
          <p className="mt-1 text-xs text-[var(--muted2)]">
            Ready to chase
          </p>
        </div>
        </TooltipWrapper>
        <TooltipWrapper content="Sum of outstanding balances on overdue invoices">
        <div className="card-ctp p-5">
          <p className="text-sm text-[var(--muted)]">Total amount overdue</p>
          <p className="font-display mt-1 text-2xl font-bold text-[var(--danger)]">
            {totalAmountOverdueFormatted}
          </p>
          <p className="mt-1 text-xs text-[var(--muted2)]">
            Outstanding balance
          </p>
        </div>
        </TooltipWrapper>
        <TooltipWrapper content="Total amount recovered from invoices we chased (paid after chase)">
        <div className="card-ctp p-5">
          <p className="text-sm text-[var(--muted)]">Total recovered</p>
          <p className="font-display mt-1 text-2xl font-bold text-[var(--green)]">
            {totalRecoveredFormatted}
          </p>
          <p className="mt-1 text-xs text-[var(--muted2)]">
            Invoices chased and paid
          </p>
        </div>
        </TooltipWrapper>
        <TooltipWrapper content="Count of invoices paid after we sent chase emails">
        <div className="card-ctp p-5">
          <p className="text-sm text-[var(--muted)]">Invoices recovered</p>
          <p className="font-display mt-1 text-2xl font-bold text-[var(--green)]">
            {recoveredCount}
          </p>
          <p className="mt-1 text-xs text-[var(--muted2)]">
            Paid after chase
          </p>
        </div>
        </TooltipWrapper>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
        <div className="flex items-center gap-2 text-sm text-[var(--muted)]" title="Filter the data shown in the tables below">
          <Filter className="h-4 w-4 shrink-0" />
          <span>Filters</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRangePreset)}>
            <SelectTrigger className="h-8 w-[130px] border-[var(--border)] bg-[var(--surface)] text-sm" title="Show only invoices due or recovered within this period">
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All time</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1">
            <Input
              type="number"
              placeholder="Min $"
              value={amountMin}
              onChange={(e) => setAmountMin(e.target.value)}
              title="Minimum invoice amount to show"
              className="h-8 w-24 border-[var(--border)] bg-[var(--surface)] text-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <span className="text-[var(--muted)]" title="Amount range">–</span>
            <Input
              type="number"
              placeholder="Max $"
              value={amountMax}
              onChange={(e) => setAmountMax(e.target.value)}
              title="Maximum invoice amount to show"
              className="h-8 w-24 border-[var(--border)] bg-[var(--surface)] text-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </div>
          <Input
            type="search"
            placeholder="Search customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            title="Search by customer name"
            className="h-8 w-48 border-[var(--border)] bg-[var(--surface)] text-sm"
          />
          {hasActiveFilters && (
            <TooltipWrapper content="Remove all filters">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-[var(--muted)] hover:text-[var(--text)]"
              onClick={clearFilters}
            >
              <X className="h-3.5 w-3.5" />
              Clear filters
            </Button>
            </TooltipWrapper>
          )}
        </div>
      </div>

      <div>
        <div
          role="tablist"
          className="mb-4 flex gap-1 rounded-lg bg-[var(--surface)] p-1 w-fit"
        >
          <button
            role="tab"
            aria-selected={activeTab === "overdue"}
            onClick={() => {
              setActiveTab("overdue");
              track(AnalyticsEvents.Dashboard_TabSwitched, { tab: "overdue" });
            }}
            title="View open invoices that need chasing"
            className={cn(
              "rounded-md px-4 py-2 text-sm font-medium transition-colors",
              activeTab === "overdue"
                ? "bg-[var(--green)] text-[#03160c]"
                : "text-[var(--muted)] hover:text-[var(--text)]"
            )}
          >
            Overdue invoices
          </button>
          <button
            role="tab"
            aria-selected={activeTab === "recovery"}
            onClick={() => {
              setActiveTab("recovery");
              track(AnalyticsEvents.Dashboard_TabSwitched, { tab: "recovery" });
            }}
            title="View invoices paid after we chased them"
            className={cn(
              "rounded-md px-4 py-2 text-sm font-medium transition-colors",
              activeTab === "recovery"
                ? "bg-[var(--green)] text-[#03160c]"
                : "text-[var(--muted)] hover:text-[var(--text)]"
            )}
          >
            Recovery history
          </button>
        </div>

        {activeTab === "overdue" && (
          <>
            {filteredInvoices.length === 0 && !isLoading ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)]/30 py-16">
                {hasActiveFilters && (invoices?.length ?? 0) > 0 ? (
                  <>
                    <p className="text-[var(--muted)]">No invoices match your filters.</p>
                    <p className="mt-1 text-sm text-[var(--muted2)]">
                      Try adjusting or clearing filters.
                    </p>
                    <Button variant="outline" size="sm" className="mt-4 border-[var(--border)]" onClick={clearFilters}>
                      Clear filters
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-[var(--muted)]">No overdue invoices right now.</p>
                    <p className="mt-1 text-sm text-[var(--muted2)]">
                      You don&apos;t have any overdue invoices. Click Refresh to update from Stripe.
                    </p>
                    <Button
                      variant="brand"
                      className="mt-4"
                      title="Fetch overdue invoices from your Stripe account"
                      onClick={async () => {
                        setRefreshing(true);
                        try {
                          const [scanRes, syncRes] = await Promise.all([
                            fetch("/api/invoices/scan", { method: "POST" }),
                            fetch("/api/invoices/sync", { method: "POST" }),
                          ]);
                          const scanData = await scanRes.json();
                          const syncData = await syncRes.json();
                          refetch();
                          queryClient.invalidateQueries({ queryKey: ["analytics"] });
                          track(AnalyticsEvents.Dashboard_Refreshed, {
                            invoices_scanned: scanData.scanned ?? 0,
                            status_updated: syncData.updated ?? 0,
                          });
                          setRefreshModal({
                            open: true,
                            scanned: scanData.scanned ?? 0,
                            updated: syncData.updated ?? 0,
                          });
                        } finally {
                          setRefreshing(false);
                        }
                      }}
                      disabled={refreshing}
                    >
                      Refresh from Stripe
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <InvoiceTable
                invoices={filteredInvoices}
                isLoading={isLoading}
                onChaseSent={(data) => {
                  refetch();
                  queryClient.invalidateQueries({ queryKey: ["analytics"] });
                  if (data?.customerName) {
                    setChaseModal({ open: true, customerName: data.customerName });
                  }
                }}
                onFreeLimitReached={() => setUpgradeModalOpen(true)}
              />
            )}
          </>
        )}

        {activeTab === "recovery" && (
          <div className="card-ctp overflow-hidden">
            {filteredRecoveryHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                {hasActiveFilters && recoveryHistory.length > 0 ? (
                  <>
                    <p className="text-[var(--muted)]">No recoveries match your filters.</p>
                    <p className="mt-1 text-sm text-[var(--muted2)]">
                      Try adjusting or clearing filters.
                    </p>
                    <Button variant="outline" size="sm" className="mt-4 border-[var(--border)]" onClick={clearFilters}>
                      Clear filters
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-[var(--muted)]">No recovery history yet.</p>
                    <p className="mt-1 text-sm text-[var(--muted2)]">
                      Chase invoices and mark them as paid to see them here.
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-left text-[var(--muted)]">
                      <th className="pb-3 pr-4 pt-4 font-medium" title="Customer or company name">Customer</th>
                      <th className="pb-3 pr-4 pt-4 font-medium" title="Amount recovered">Amount</th>
                      <th className="pb-3 pr-4 pt-4 font-medium" title="Stripe invoice ID">Stripe ID</th>
                      <th className="pb-3 pt-4 font-medium" title="Date the invoice was paid">Recovered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecoveryHistory.map((r: RecoveryItem) => (
                      <tr key={r.id} className="border-b border-[var(--border)]/50">
                        <td className="py-3 pr-4 text-[var(--text)]">{r.customerName || "—"}</td>
                        <td className="py-3 pr-4 font-medium text-[var(--green)]">
                          {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(r.amount / 100)}
                        </td>
                        <td className="py-3 pr-4 font-mono text-xs text-[var(--muted)]">{r.stripeInvoiceId || "—"}</td>
                        <td className="py-3 text-[var(--muted)]">
                          {r.recoveredAt ? new Date(r.recoveredAt).toLocaleDateString() : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      <SuccessModal
        open={!!refreshModal}
        onOpenChange={(open) => !open && setRefreshModal(null)}
        title="Refresh complete"
        message={
          refreshModal
            ? refreshModal.scanned || refreshModal.updated
              ? `${refreshModal.scanned} invoice${refreshModal.scanned === 1 ? "" : "s"} fetched, ${refreshModal.updated} status${refreshModal.updated === 1 ? "" : "es"} updated.`
              : "No new invoices or status changes."
            : ""
        }
        detail={
          refreshModal
            ? refreshModal.scanned || refreshModal.updated
              ? "Dashboard data is up to date with Stripe."
              : "Add overdue invoices in Stripe or wait for payments to sync."
            : ""
        }
      />

      <SuccessModal
        open={!!chaseModal}
        onOpenChange={(open) => !open && setChaseModal(null)}
        title="Chase sent"
        message={`Reminder email sent to ${chaseModal?.customerName ?? "customer"}.`}
        detail="Status will update automatically when they pay."
      />

      <UpgradeModal
        open={upgradeModalOpen}
        onOpenChange={setUpgradeModalOpen}
      />
    </div>
  );
}

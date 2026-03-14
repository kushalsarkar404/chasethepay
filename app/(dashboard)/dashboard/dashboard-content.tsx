"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { InvoiceTable } from "@/components/invoice-table";
import { SuccessModal } from "@/components/success-modal";
import { SyncStatusCard } from "@/components/sync-status-card";
import { UpgradeModal } from "@/components/upgrade-modal";
import { MaxChasesModal } from "@/components/max-chases-modal";
import { FrequencyNotMetModal } from "@/components/frequency-not-met-modal";
import { FreeChasesBanner } from "@/components/free-chases-banner";
import { OnboardingModal, getOnboardingCompleted } from "@/components/onboarding-modal";
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
  const [maxChasesModalOpen, setMaxChasesModalOpen] = useState(false);
  const [maxChasesModalValue, setMaxChasesModalValue] = useState(5);
  const [frequencyNotMetModalOpen, setFrequencyNotMetModalOpen] = useState(false);
  const [frequencyNotMetModalValue, setFrequencyNotMetModalValue] = useState("3days");
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const res = await fetch("/api/settings");
      if (!res.ok) throw new Error("Failed to fetch settings");
      return res.json();
    },
  });

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
    track(AnalyticsEvents.Dashboard_Viewed);
  }, []);

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

  useEffect(() => {
    if (settings === undefined || getOnboardingCompleted()) return;
    const needsSetup =
      !hasStripeConnected ||
      !settings?.sender_name ||
      settings.sender_name === "Your business";
    if (needsSetup) setOnboardingOpen(true);
  }, [settings, hasStripeConnected]);

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
      <>
        <div className="px-4 py-6 sm:p-6 md:p-8">
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
            <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)]/50 p-8 sm:p-12 md:p-16">
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

        <OnboardingModal
          open={onboardingOpen}
          onOpenChange={setOnboardingOpen}
          hasStripeConnected={hasStripeConnected}
          initialSettings={
            settings
              ? {
                  sender_name: settings.sender_name ?? "Your business",
                  ai_tone: settings.ai_tone ?? "friendly",
                  chase_frequency: settings.chase_frequency ?? "3days",
                  max_chases: settings.max_chases ?? 5,
                  reply_to_email: settings.reply_to_email ?? "",
                }
              : null
          }
          onComplete={() => {
            queryClient.invalidateQueries({ queryKey: ["settings"] });
            queryClient.invalidateQueries({ queryKey: ["invoices"] });
            queryClient.invalidateQueries({ queryKey: ["analytics"] });
          }}
        />
      </>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 md:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-xl font-bold tracking-tight text-[var(--text)] sm:text-2xl">
            Dashboard
          </h1>
          <p className="mt-1 text-xs text-[var(--muted)] sm:text-sm">
            Overdue invoices and recovery analytics
          </p>
        </div>
        <div className="flex w-full flex-shrink-0 flex-wrap gap-2 sm:w-auto">
          <TooltipWrapper content="Fetch new invoices from Stripe, update payment status, and refresh the dashboard">
          <Button
            variant="brand"
            size="sm"
            className="w-full sm:w-auto"
            onClick={async () => {
              track(AnalyticsEvents.Invoices_ScanStarted);
              setRefreshing(true);
              try {
                const [scanRes, syncRes] = await Promise.all([
                  fetch("/api/invoices/scan", { method: "POST" }),
                  fetch("/api/invoices/sync", { method: "POST" }),
                ]);
                const scanData = await scanRes.json().catch(() => ({}));
                const syncData = await syncRes.json().catch(() => ({}));
                refetch();
                queryClient.invalidateQueries({ queryKey: ["analytics"] });
                const scanned = scanData.scanned ?? 0;
                const updated = syncData.updated ?? 0;
                const hasScanErrors = (scanData.errors?.length ?? 0) > 0;
                const scanFailed = !scanRes.ok || hasScanErrors;
                if (scanFailed) {
                  track(AnalyticsEvents.Invoices_ScanFailed, {
                    errors: scanData.errors?.length ?? 0,
                    status: scanRes.status,
                  });
                } else {
                  track(AnalyticsEvents.Invoices_ScanCompleted, { scanned, status_updated: updated });
                }
                track(AnalyticsEvents.Dashboard_Refreshed, { invoices_scanned: scanned, status_updated: updated });
                setRefreshModal({
                  open: true,
                  scanned,
                  updated,
                });
              } catch {
                track(AnalyticsEvents.Invoices_ScanFailed, { errors: 1, status: 0 });
                setRefreshModal({ open: true, scanned: 0, updated: 0 });
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

      {hasStripeConnected &&
        settings?.plan !== "pro" &&
        settings?.chasesUsedThisMonth !== undefined && (
          <div className="mb-6">
            <FreeChasesBanner
              chasesUsed={settings.chasesUsedThisMonth}
              onUpgradeClick={() => setUpgradeModalOpen(true)}
            />
          </div>
        )}

      <div className="mb-6 grid gap-3 sm:mb-10 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <TooltipWrapper content="Number of open, overdue invoices ready to chase">
        <div className="card-ctp min-w-0 p-4 sm:p-5">
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
        <div className="card-ctp min-w-0 overflow-hidden p-4 sm:p-5">
          <p className="text-sm text-[var(--muted)]">Total amount overdue</p>
          <p className="font-display mt-1 truncate text-xl font-bold text-[var(--danger)] sm:text-2xl">
            {totalAmountOverdueFormatted}
          </p>
          <p className="mt-1 text-xs text-[var(--muted2)]">
            Outstanding balance
          </p>
        </div>
        </TooltipWrapper>
        <TooltipWrapper content="Total amount recovered from invoices we chased (paid after chase)">
        <div className="card-ctp min-w-0 overflow-hidden p-4 sm:p-5">
          <p className="text-sm text-[var(--muted)]">Total recovered</p>
          <p className="font-display mt-1 truncate text-xl font-bold text-[var(--green)] sm:text-2xl">
            {totalRecoveredFormatted}
          </p>
          <p className="mt-1 text-xs text-[var(--muted2)]">
            Invoices chased and paid
          </p>
        </div>
        </TooltipWrapper>
        <TooltipWrapper content="Count of invoices paid after we sent chase emails">
        <div className="card-ctp min-w-0 p-4 sm:p-5">
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

      <SyncStatusCard />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
        <div className="flex items-center gap-2 text-sm text-[var(--muted)]" title="Filter the data shown in the tables below">
          <Filter className="h-4 w-4 shrink-0" />
          <span>Filters</span>
        </div>
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRangePreset)}>
            <SelectTrigger className="h-8 min-w-0 border-[var(--border)] bg-[var(--surface)] text-sm sm:w-[130px]" title="Show only invoices due or recovered within this period">
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
            className="h-8 min-w-0 flex-1 border-[var(--border)] bg-[var(--surface)] text-sm sm:w-48 sm:flex-initial"
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

      <div className="min-w-0 overflow-hidden">
        <div
          role="tablist"
          className="mb-4 flex w-full gap-1 overflow-x-auto rounded-lg bg-[var(--surface)] p-1 sm:w-fit"
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
              "shrink-0 rounded-md px-3 py-2 text-sm font-medium transition-colors sm:px-4",
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
              "shrink-0 rounded-md px-3 py-2 text-sm font-medium transition-colors sm:px-4",
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
                        track(AnalyticsEvents.Invoices_ScanStarted);
                        setRefreshing(true);
                        try {
                          const [scanRes, syncRes] = await Promise.all([
                            fetch("/api/invoices/scan", { method: "POST" }),
                            fetch("/api/invoices/sync", { method: "POST" }),
                          ]);
                          const scanData = await scanRes.json().catch(() => ({}));
                          const syncData = await syncRes.json().catch(() => ({}));
                          refetch();
                          queryClient.invalidateQueries({ queryKey: ["analytics"] });
                          const scanned = scanData.scanned ?? 0;
                          const updated = syncData.updated ?? 0;
                          const hasScanErrors = (scanData.errors?.length ?? 0) > 0;
                          const scanFailed = !scanRes.ok || hasScanErrors;
                          if (scanFailed) {
                            track(AnalyticsEvents.Invoices_ScanFailed, {
                              errors: scanData.errors?.length ?? 0,
                              status: scanRes.status,
                            });
                          } else {
                            track(AnalyticsEvents.Invoices_ScanCompleted, { scanned, status_updated: updated });
                          }
                          track(AnalyticsEvents.Dashboard_Refreshed, { invoices_scanned: scanned, status_updated: updated });
                          setRefreshModal({ open: true, scanned, updated });
                        } catch {
                          track(AnalyticsEvents.Invoices_ScanFailed, { errors: 1, status: 0 });
                          setRefreshModal({ open: true, scanned: 0, updated: 0 });
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
                maxChases={settings?.max_chases ?? 5}
                chaseFrequency={settings?.chase_frequency ?? "3days"}
                isLoading={isLoading}
                onChaseSent={(data) => {
                  refetch();
                  queryClient.invalidateQueries({ queryKey: ["analytics"] });
                  queryClient.invalidateQueries({ queryKey: ["settings"] });
                  if (data?.customerName) {
                    setChaseModal({ open: true, customerName: data.customerName });
                  }
                }}
                onFreeLimitReached={() => setUpgradeModalOpen(true)}
                onMaxChasesReached={(maxChases) => {
                  setMaxChasesModalValue(maxChases);
                  setMaxChasesModalOpen(true);
                }}
                onFrequencyNotMet={(chaseFrequency) => {
                  setFrequencyNotMetModalValue(chaseFrequency);
                  setFrequencyNotMetModalOpen(true);
                }}
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
                <table className="min-w-[500px] w-full text-sm">
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

      <MaxChasesModal
        open={maxChasesModalOpen}
        onOpenChange={setMaxChasesModalOpen}
        maxChases={maxChasesModalValue}
      />

      <FrequencyNotMetModal
        open={frequencyNotMetModalOpen}
        onOpenChange={setFrequencyNotMetModalOpen}
        chaseFrequency={frequencyNotMetModalValue}
      />

      <OnboardingModal
        open={onboardingOpen}
        onOpenChange={setOnboardingOpen}
        hasStripeConnected={hasStripeConnected}
        initialSettings={
          settings
            ? {
                sender_name: settings.sender_name ?? "Your business",
                ai_tone: settings.ai_tone ?? "friendly",
                chase_frequency: settings.chase_frequency ?? "3days",
                max_chases: settings.max_chases ?? 5,
                reply_to_email: settings.reply_to_email ?? "",
              }
            : null
        }
        onComplete={() => {
          queryClient.invalidateQueries({ queryKey: ["settings"] });
          queryClient.invalidateQueries({ queryKey: ["invoices"] });
          queryClient.invalidateQueries({ queryKey: ["analytics"] });
        }}
      />
    </div>
  );
}

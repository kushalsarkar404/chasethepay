"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StripeConnectButton } from "@/components/stripe-connect-button";
import { Loader2, AlertTriangle } from "lucide-react";
import { track, AnalyticsEvents } from "@/lib/analytics";
import { MarketingTracker } from "@/components/marketing-tracker";

const schema = z.object({
  sender_name: z.string().min(1, "Sender name is required").max(100),
  ai_tone: z.enum(["friendly", "professional", "firm"]),
  chase_frequency: z.enum(["1min", "1day", "3days", "weekly"]),
  max_chases: z.number().int().min(1).max(20),
  from_email: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [stripeStatus, setStripeStatus] = useState<string | null>(null);
  const [stripeConnected, setStripeConnected] = useState(false);
  const [stripeAccountId, setStripeAccountId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [disconnectModalOpen, setDisconnectModalOpen] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      sender_name: "Your business",
      ai_tone: "friendly",
      chase_frequency: "3days",
      max_chases: 5,
      from_email: "",
    },
  });

  useEffect(() => {
    const stripe = searchParams.get("stripe");
    if (stripe) {
      setStripeStatus(stripe);
      if (stripe === "success") {
        setStripeConnected(true);
        track(AnalyticsEvents.Stripe_ConnectSuccess);
      }
      if (stripe === "error") track(AnalyticsEvents.Stripe_ConnectFailed);
      window.history.replaceState({}, "", "/settings");
    }
  }, [searchParams]);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.stripeConnected) setStripeConnected(true);
        if (data.stripeAccountId) setStripeAccountId(data.stripeAccountId);
        if (data.sender_name) form.setValue("sender_name", data.sender_name);
        if (data.ai_tone) form.setValue("ai_tone", data.ai_tone);
        if (data.chase_frequency) form.setValue("chase_frequency", data.chase_frequency);
        if (data.max_chases) form.setValue("max_chases", data.max_chases);
        if (data.from_email) form.setValue("from_email", data.from_email);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [form]);

  async function onSubmit(data: FormData) {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          from_email: data.from_email?.trim() ? data.from_email : null,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      track(AnalyticsEvents.Settings_Updated, {
        field_changed: "multiple",
      });
    } catch {
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--muted)]" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <MarketingTracker event="view_billing" />
      <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--text)]">
        Settings
      </h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Configure AI tone, chase frequency, and Stripe
      </p>

      {stripeStatus === "success" && (
        <div className="mt-6 rounded-lg bg-[var(--green-dim)] border border-[var(--green)]/30 p-4 text-sm text-[var(--green)]">
          Stripe connected successfully.
        </div>
      )}
      {stripeStatus === "error" && (
        <div className="mt-6 rounded-lg bg-[var(--danger)]/10 border border-[var(--danger)]/30 p-4 text-sm text-[var(--danger)]">
          Stripe connection failed. Please try again.
        </div>
      )}

      <div className="mt-10 space-y-10">
        <section>
          <h2 className="font-display text-lg font-semibold text-[var(--text)]">
            Stripe Connect
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {stripeConnected
              ? "Your Stripe account is connected"
              : "Connect your Stripe account to pull overdue invoices"}
          </p>
          <div className="mt-4">
            {stripeConnected ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 rounded-lg bg-[var(--green-dim)] border border-[var(--green)]/30 px-4 py-3 text-sm text-[var(--green)]">
                  <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Connected
                </div>
                {stripeAccountId && (
                  <p className="text-xs text-[var(--muted2)]">
                    Account: {stripeAccountId}
                  </p>
                )}
              </div>
            ) : (
              <StripeConnectButton />
            )}
          </div>
        </section>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8"
        >
          <section>
            <h2 className="font-display text-lg font-semibold text-[var(--text)]">
              Chase preferences
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2" title="Name shown at the end of chase emails (e.g. Thank you, Acme Inc)">
                <Label>Sender name</Label>
                <Input
                  placeholder="Your business"
                  {...form.register("sender_name")}
                  className="bg-[var(--surface)] border-[var(--border)]"
                />
                <p className="text-xs text-[var(--muted2)]">
                  Used as the sign-off in chase emails (e.g. &quot;Thank you, Sender name&quot;)
                </p>
              </div>
              <div className="space-y-2" title="Tone of reminder emails: friendly, professional, or firm">
                <Label>AI tone</Label>
                <Select
                  value={form.watch("ai_tone")}
                  onValueChange={(v) => form.setValue("ai_tone", v as FormData["ai_tone"])}
                >
                  <SelectTrigger className="bg-[var(--surface)] border-[var(--border)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="firm">Firm</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2" title="How often to send reminders to the same invoice">
                <Label>Chase frequency</Label>
                <Select
                  value={form.watch("chase_frequency")}
                  onValueChange={(v) => form.setValue("chase_frequency", v as FormData["chase_frequency"])}
                >
                  <SelectTrigger className="bg-[var(--surface)] border-[var(--border)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1day">Every 1 day</SelectItem>
                    <SelectItem value="3days">Every 3 days</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2" title="Maximum number of reminder emails per invoice before stopping">
                <Label>Max chases per invoice</Label>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  {...form.register("max_chases", { valueAsNumber: true })}
                  className="bg-[var(--surface)] border-[var(--border)]"
                />
              </div>
              <div className="space-y-2 sm:col-span-2" title="Email address chase emails are sent from (default: Resend)">
                <Label>From email (optional)</Label>
                <Input
                  type="email"
                  placeholder="billing@yourcompany.com"
                  {...form.register("from_email")}
                  className="bg-[var(--surface)] border-[var(--border)]"
                />
              </div>
            </div>
          </section>

          <Button type="submit" variant="brand" disabled={saving} title="Save your chase preferences">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Save settings"
            )}
          </Button>
        </form>

        <section>
          <h2 className="font-display text-lg font-semibold text-[var(--text)]">
            Billing
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Upgrade to Pro for unlimited chases
          </p>
          <Button
            variant="outline"
            className="mt-4 border-[var(--border)]"
            title="Upgrade for unlimited chases per month"
            onClick={async () => {
              track(AnalyticsEvents.Billing_CheckoutStarted);
              const res = await fetch("/api/billing/checkout", {
                method: "POST",
              });
              const data = await res.json();
              if (data.url) window.location.href = data.url;
            }}
          >
            Upgrade to Pro — $4.99/mo
          </Button>
        </section>

        {stripeConnected && (
          <section className="rounded-lg border border-[var(--danger)]/30 bg-[var(--danger)]/5 p-6">
            <h2 className="font-display text-lg font-semibold text-[var(--danger)] flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Danger zone
            </h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Disconnecting Stripe will permanently delete all your invoices, chase history, and recovery data. You can reconnect Stripe anytime to start fresh.
            </p>
            <Button
              variant="destructive"
              className="mt-4"
              title="Disconnect Stripe and delete all invoice data. This cannot be undone."
              onClick={() => setDisconnectModalOpen(true)}
            >
              Disconnect Stripe
            </Button>
          </section>
        )}
      </div>

      <Dialog open={disconnectModalOpen} onOpenChange={setDisconnectModalOpen}>
        <DialogContent className="border-[var(--border)] bg-[var(--bg2)] sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--danger)]/20">
              <AlertTriangle className="h-6 w-6 text-[var(--danger)]" />
            </div>
            <DialogTitle className="text-center font-display text-xl text-[var(--text)]">
              Disconnect Stripe?
            </DialogTitle>
            <DialogDescription className="text-center text-[var(--muted)]">
              This will permanently delete all invoices, chase history, and recovery data. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-center">
            <Button
              variant="outline"
              className="border-[var(--border)]"
              onClick={() => setDisconnectModalOpen(false)}
              disabled={disconnecting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={disconnecting}
              onClick={async () => {
                setDisconnecting(true);
                try {
                  const res = await fetch("/api/accounts/disconnect", { method: "POST" });
                  const data = await res.json();
                  if (!res.ok) throw new Error(data.error || "Failed to disconnect");
                  track(AnalyticsEvents.Stripe_Disconnected);
                  setDisconnectModalOpen(false);
                  setStripeConnected(false);
                  setStripeAccountId(null);
                  router.refresh();
                } catch (err) {
                  alert(err instanceof Error ? err.message : "Failed to disconnect");
                } finally {
                  setDisconnecting(false);
                }
              }}
            >
              {disconnecting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Disconnecting…
                </>
              ) : (
                "Disconnect Stripe"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

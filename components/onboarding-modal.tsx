"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { StripeConnectButton } from "@/components/stripe-connect-button";
import { Loader2, ChevronRight, ChevronLeft } from "lucide-react";
import { track, AnalyticsEvents } from "@/lib/analytics";

const ONBOARDING_KEY = "chasethepay_onboarding_completed";

export function getOnboardingCompleted(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(ONBOARDING_KEY) === "true";
}

export function setOnboardingCompleted(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ONBOARDING_KEY, "true");
}

interface OnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hasStripeConnected: boolean;
  initialSettings: {
    sender_name: string;
    ai_tone: string;
    chase_frequency: string;
    max_chases: number;
  } | null;
  onComplete: () => void;
}

const STEPS = [
  { id: 1, title: "Welcome" },
  { id: 2, title: "Your business" },
  { id: 3, title: "Connect Stripe" },
  { id: 4, title: "Chase preferences" },
];

export function OnboardingModal({
  open,
  onOpenChange,
  hasStripeConnected,
  initialSettings,
  onComplete,
}: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [senderName, setSenderName] = useState(
    initialSettings?.sender_name && initialSettings.sender_name !== "Your business"
      ? initialSettings.sender_name
      : ""
  );
  const [aiTone, setAiTone] = useState(initialSettings?.ai_tone ?? "friendly");
  const [chaseFrequency, setChaseFrequency] = useState(initialSettings?.chase_frequency ?? "3days");
  const [maxChases, setMaxChases] = useState(initialSettings?.max_chases ?? 5);
  const [saving, setSaving] = useState(false);
  const allowCloseRef = useRef(false);

  useEffect(() => {
    if (initialSettings) {
      setSenderName(
        initialSettings.sender_name && initialSettings.sender_name !== "Your business"
          ? initialSettings.sender_name
          : ""
      );
      setAiTone(initialSettings.ai_tone || "friendly");
      setChaseFrequency(initialSettings.chase_frequency || "3days");
      setMaxChases(initialSettings.max_chases ?? 5);
    }
  }, [initialSettings]);

  useEffect(() => {
    if (open && hasStripeConnected && step === 3) {
      setStep(4);
    }
  }, [open, hasStripeConnected, step]);

  async function handleComplete() {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender_name: senderName.trim() || "Your business",
          ai_tone: aiTone,
          chase_frequency: chaseFrequency,
          max_chases: maxChases,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      track(AnalyticsEvents.Onboarding_Completed);
      setOnboardingCompleted();
      allowCloseRef.current = true;
      onComplete();
      onOpenChange(false);
    } catch {
      alert("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const canProceed = step === 2 ? senderName.trim().length > 0 : true;
  const isLastStep = step === 4;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) onOpenChange(true);
        else if (allowCloseRef.current) {
          allowCloseRef.current = false;
          onOpenChange(false);
        }
      }}
    >
      <DialogContent
        className="border-[var(--border)] bg-[var(--bg2)] max-h-[90vh] overflow-y-auto sm:max-w-lg"
        showCloseButton={false}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Welcome to ChaseThePay</DialogTitle>
          <DialogDescription>Let&apos;s get you set up in a few steps.</DialogDescription>
        </DialogHeader>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-6">
          {STEPS.map((s) => {
            const isActive = step === s.id;
            const isPast = step > s.id;
            return (
              <div
                key={s.id}
                className={`
                  rounded-full px-3 py-1.5 text-xs font-medium
                  ${isActive ? "bg-[var(--green)]/20 text-[var(--green)]" : ""}
                  ${isPast ? "bg-[var(--green)]/10 text-[var(--muted)]" : ""}
                  ${!isActive && !isPast ? "text-[var(--muted)]" : ""}
                `}
              >
                {s.title}
              </div>
            );
          })}
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <h2 className="font-display text-xl font-bold text-[var(--text)]">
              Welcome to ChaseThePay
            </h2>
            <p className="text-sm text-[var(--muted)]">
              Let&apos;s get you set up in a few steps. You&apos;ll configure your business name,
              connect Stripe, and choose how often to send chase emails.
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-xl font-bold text-[var(--text)]">
                What&apos;s your business name?
              </h2>
              <p className="mt-2 text-sm text-[var(--muted)]">
                This appears at the end of chase emails (e.g. &quot;Thank you, Acme Inc&quot;) and as the
                display name in the recipient&apos;s inbox.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sender_name">Sender name</Label>
              <Input
                id="sender_name"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Your business"
                className="bg-[var(--surface)] border-[var(--border)]"
                autoFocus
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-xl font-bold text-[var(--text)]">
                Connect Stripe
              </h2>
              <p className="mt-2 text-sm text-[var(--muted)]">
                ChaseThePay pulls overdue invoices from your Stripe account. Connect once and we&apos;ll
                sync automatically every 15 minutes. You&apos;ll be redirected to Stripe to authorize.
              </p>
            </div>
            {hasStripeConnected ? (
              <div className="rounded-lg border border-[var(--green)]/30 bg-[var(--green-dim)] px-4 py-3 text-sm text-[var(--green)]">
                ✓ Stripe connected. You can continue.
              </div>
            ) : (
              <StripeConnectButton />
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-xl font-bold text-[var(--text)]">
                Chase preferences
              </h2>
              <p className="mt-2 text-sm text-[var(--muted)]">
                How often should we remind customers? You can change these anytime in Settings.
              </p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>AI tone</Label>
                <Select value={aiTone} onValueChange={setAiTone}>
                  <SelectTrigger className="bg-[var(--surface)] border-[var(--border)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="friendly">Friendly — casual and warm</SelectItem>
                    <SelectItem value="professional">Professional — formal and clear</SelectItem>
                    <SelectItem value="firm">Firm — direct and urgent</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-[var(--muted)]">
                  Tone escalates automatically after 3+ chases
                </p>
              </div>
              <div className="space-y-2">
                <Label>Chase frequency</Label>
                <Select value={chaseFrequency} onValueChange={setChaseFrequency}>
                  <SelectTrigger className="bg-[var(--surface)] border-[var(--border)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1day">Every 1 day</SelectItem>
                    <SelectItem value="3days">Every 3 days</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-[var(--muted)]">
                  Minimum time between reminders for the same invoice
                </p>
              </div>
              <div className="space-y-2">
                <Label>Max chases per invoice</Label>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={maxChases}
                  onChange={(e) => setMaxChases(parseInt(e.target.value, 10) || 5)}
                  className="bg-[var(--surface)] border-[var(--border)]"
                />
                <p className="text-xs text-[var(--muted)]">
                  Stop after this many reminders per invoice
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 flex items-center justify-end gap-2 border-t border-[var(--border)] pt-6">
            {step > 1 && (
              <Button
                variant="outline"
                size="sm"
                className="border-[var(--border)]"
                onClick={() => setStep((s) => s - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
            )}
            {!isLastStep ? (
              <Button
                variant="brand"
                size="sm"
                disabled={!canProceed}
                onClick={() => setStep((s) => s + 1)}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="brand"
                size="sm"
                disabled={saving}
                onClick={handleComplete}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Complete setup"
                )}
              </Button>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

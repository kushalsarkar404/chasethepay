"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { track, AnalyticsEvents } from "@/lib/analytics";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      track(AnalyticsEvents.User_SignupStarted, { method: "email" });
      const supabase = createClient();
      const { error: err } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (err) {
        setError(err.message);
        return;
      }
      track(AnalyticsEvents.User_AccountCreated, { method: "email" });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <main className="relative flex min-h-screen flex-col items-center justify-center px-4">
        <div className="hero-orb" aria-hidden />
        <div className="relative z-10 w-full max-w-md">
          <div className="card-ctp border-border-bright p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--green-dim)]">
              <svg
                className="h-7 w-7 text-[var(--green)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--text)]">
              Check your email
            </h1>
            <p className="mt-3 text-sm text-[var(--muted)]">
              We sent a confirmation link to <strong>{email}</strong>. Click it
              to activate your account.
            </p>
            <p className="mt-4 text-xs text-[var(--muted2)]">
              Didn&apos;t get it? Check spam or{" "}
              <button
                type="button"
                onClick={() => setSuccess(false)}
                className="text-[var(--green)] hover:underline"
              >
                try again
              </button>
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-4">
      <div className="hero-orb" aria-hidden />
      <div className="relative z-10 w-full max-w-md">
        <div className="card-ctp border-border-bright p-8">
          <div className="mb-8">
            <Logo href="/" className="text-xl" />
            <p className="mt-1 text-sm text-[var(--muted)]">
              Stop chasing invoices. Let AI chase for you.
            </p>
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--text)]">
            Create an account
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Connect Stripe and let AI chase your overdue invoices
          </p>
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="bg-[var(--surface)] border-[var(--border)]"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Min 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="bg-[var(--surface)] border-[var(--border)]"
                disabled={loading}
              />
            </div>
            {error && (
              <p className="text-sm text-[var(--danger)]" role="alert">
                {error}
              </p>
            )}
            <Button
              type="submit"
              variant="brand"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? "Creating account…" : "Sign up"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-[var(--muted)]">
            Already have an account?{" "}
            <Link href="/login" className="text-[var(--green)] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

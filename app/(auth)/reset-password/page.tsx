"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setHasSession(!!user);
      setCheckingSession(false);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) {
        setError(err.message);
        return;
      }
      await supabase.auth.signOut();
      router.push("/login?reset=success");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <main className="relative flex min-h-screen flex-col items-center justify-center px-4">
        <div className="hero-orb" aria-hidden />
        <div className="relative z-10 w-full max-w-md text-center">
          <p className="text-[var(--muted)]">Loading…</p>
        </div>
      </main>
    );
  }

  if (!hasSession) {
    return (
      <main className="relative flex min-h-screen flex-col items-center justify-center px-4">
        <div className="hero-orb" aria-hidden />
        <div className="relative z-10 w-full max-w-md">
          <div className="card-ctp border-border-bright p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--danger)]/10">
              <svg
                className="h-7 w-7 text-[var(--danger)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--text)]">
              Invalid or expired link
            </h1>
            <p className="mt-3 text-sm text-[var(--muted)]">
              This password reset link is invalid or has expired. Request a new
              one below.
            </p>
            <Button asChild variant="brand" className="mt-6 w-full" size="lg">
              <Link href="/forgot-password">Request new reset link</Link>
            </Button>
            <Link
              href="/login"
              className="mt-4 inline-block text-sm text-[var(--green)] hover:underline"
            >
              ← Back to sign in
            </Link>
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
            Set new password
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Enter your new password below.
          </p>
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
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
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? "Updating…" : "Update password"}
            </Button>
          </form>
          <Link
            href="/login"
            className="mt-6 inline-block text-sm text-[var(--muted)] hover:text-[var(--text)]"
          >
            ← Back to sign in
          </Link>
        </div>
      </div>
    </main>
  );
}

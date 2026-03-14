"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { track, AnalyticsEvents } from "@/lib/analytics";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/dashboard";
  const resetSuccess = searchParams.get("reset") === "success";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (err) {
        track(AnalyticsEvents.User_LoginFailed, { reason: err.message });
        setError(err.message);
        return;
      }
      track(AnalyticsEvents.User_LoginSuccess, { method: "email" });
      router.push(redirect);
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
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
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Sign in to your account to continue
          </p>
          {resetSuccess && (
            <div className="mt-6 rounded-lg border border-[var(--green)]/30 bg-[var(--green-dim)] px-4 py-3 text-sm text-[var(--green)]">
              Your password has been updated. Sign in with your new password.
            </div>
          )}
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-[var(--green)] hover:underline"
                >
                  Forgot?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
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
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-[var(--muted)]">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-[var(--green)] hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}

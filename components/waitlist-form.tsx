"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: name || undefined }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong.");
        return;
      }

      setStatus("success");
      setMessage("You're on the list! We'll be in touch.");
      setEmail("");
      setName("");
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-2">
        <Input
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={status === "loading"}
          className="h-11 flex-1 bg-[var(--surface)] border-[var(--border)] text-[var(--text)] placeholder:text-[var(--muted)]"
        />
        <Input
          type="text"
          placeholder="Name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={status === "loading"}
          className="h-11 flex-1 bg-[var(--surface)] border-[var(--border)] text-[var(--text)] placeholder:text-[var(--muted)] sm:max-w-[160px]"
        />
      </div>
      <Button
        type="submit"
        variant="brand"
        size="lg"
        disabled={status === "loading"}
        className="w-full sm:w-auto"
      >
        {status === "loading" ? "Joining…" : "Join waitlist"}
      </Button>
      {message && (
        <p
          className={`text-sm ${
            status === "success" ? "text-[var(--green)]" : "text-[var(--danger)]"
          }`}
        >
          {message}
        </p>
      )}
    </form>
  );
}

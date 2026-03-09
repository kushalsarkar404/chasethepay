"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link2 } from "lucide-react";
import { track, AnalyticsEvents } from "@/lib/analytics";

export function StripeConnectButton() {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      track(AnalyticsEvents.Stripe_ConnectClicked);
      const res = await fetch("/api/accounts/connect", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to connect");
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to connect");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="brand"
      onClick={handleClick}
      disabled={loading}
      className="gap-2"
    >
      <Link2 className="h-4 w-4" />
      {loading ? "Connecting…" : "Connect Stripe"}
    </Button>
  );
}

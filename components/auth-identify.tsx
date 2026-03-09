"use client";

import { useEffect } from "react";
import { identifyUser } from "@/lib/analytics";

interface AuthIdentifyProps {
  userId: string;
  email: string;
}

export function AuthIdentify({ userId, email }: AuthIdentifyProps) {
  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        identifyUser(userId, {
          email,
          plan: data.plan ?? "free",
          stripeConnected: !!data.stripeConnected,
          createdAt: data.created_at ?? new Date().toISOString(),
        });
      })
      .catch(() => {
        identifyUser(userId, {
          email,
          plan: "free",
          stripeConnected: false,
          createdAt: new Date().toISOString(),
        });
      });
  }, [userId, email]);
  return null;
}

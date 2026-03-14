import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description: "Configure AI tone, chase frequency, Stripe Connect, and billing.",
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

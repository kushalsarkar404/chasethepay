import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log in",
  description: "Sign in to your ChaseThePay account to manage invoice chasing.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Reset your ChaseThePay password. We'll send you a recovery link.",
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

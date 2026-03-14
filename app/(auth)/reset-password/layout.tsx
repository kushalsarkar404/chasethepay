import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Set a new password for your ChaseThePay account.",
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

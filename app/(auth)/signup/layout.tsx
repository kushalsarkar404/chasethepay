import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create your ChaseThePay account. Free to start—10 chases per month.",
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

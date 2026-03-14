import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/dashboard-shell";
import { MarketingTracker } from "@/components/marketing-tracker";
import { AuthIdentify } from "@/components/auth-identify";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <DashboardShell>
      <AuthIdentify userId={user.id} email={user.email ?? ""} />
      <MarketingTracker event="sign_in" />
      <div className="min-h-screen overflow-x-hidden bg-[var(--bg)]">
        {children}
      </div>
    </DashboardShell>
  );
}

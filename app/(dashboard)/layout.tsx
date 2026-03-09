import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardNav } from "@/components/dashboard-nav";
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
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-40 w-64 border-r border-[var(--border)] bg-[var(--bg2)]">
        <div className="flex h-16 items-center gap-2 px-6 border-b border-[var(--border)]">
          <a
            href="/dashboard"
            className="font-display text-lg font-bold tracking-tight text-[var(--text)]"
          >
            ChaseThePay
          </a>
        </div>
        <DashboardNav />
      </aside>
      <main className="flex-1 pl-64">
        <AuthIdentify userId={user.id} email={user.email ?? ""} />
        <MarketingTracker event="sign_in" />
        <div className="min-h-screen bg-[var(--bg)]">
          {children}
        </div>
      </main>
    </div>
  );
}

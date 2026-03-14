"use client";

import { useState } from "react";
import Link from "next/link";
import { DashboardNav } from "./dashboard-nav";
import { Logo } from "./logo";
import { Menu, X } from "lucide-react";

export function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Mobile header - fixed top bar */}
      <header className="fixed left-0 right-0 top-0 z-30 flex h-14 items-center justify-between border-b border-[var(--border)] bg-[var(--bg2)] px-4 md:hidden">
        <Logo href="/dashboard" className="text-lg" />
        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={sidebarOpen}
          onClick={() => setSidebarOpen(true)}
          className="rounded p-2 text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* Sidebar backdrop (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      {/* Sidebar - hidden on mobile until opened */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 border-r border-[var(--border)] bg-[var(--bg2)] transition-transform duration-200 ease-out
          md:relative md:z-auto md:translate-x-0 md:flex-shrink-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex h-14 items-center justify-between border-b border-[var(--border)] px-4 md:h-16 md:px-6">
          <Logo href="/dashboard" className="text-lg" />
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setSidebarOpen(false)}
            className="rounded p-2 text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--text)] md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div onClick={() => setSidebarOpen(false)}>
          <DashboardNav />
        </div>
      </aside>

      {/* Main content - pt for mobile header */}
      <main className="min-w-0 flex-1 pt-14 md:pt-0">
        {children}
      </main>
    </div>
  );
}

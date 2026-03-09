import Link from "next/link";
import { Button } from "@/components/ui/button";
import { NightScene } from "@/components/night-scene";
import { WaitlistForm } from "@/components/waitlist-form";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "ChaseThePay",
  applicationCategory: "FinanceApplication",
  description:
    "AI-powered invoice chasing. Connect Stripe and send intelligent email reminders to overdue customers automatically.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export const metadata = {
  title: "ChaseThePay — AI-Powered Invoice Chasing",
  description:
    "Stop chasing invoices. Let AI chase for you. Connect Stripe and ChaseThePay sends intelligent email reminders to overdue customers—automatically.",
  openGraph: {
    title: "ChaseThePay — AI-Powered Invoice Chasing",
    description:
      "Stop chasing invoices. Let AI chase for you. Connect Stripe and ChaseThePay sends intelligent email reminders to overdue customers—automatically.",
  },
};

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="hidden md:block">
        <NightScene />
        <div className="hero-orb" aria-hidden />
      </div>
      <header className="relative z-10 flex items-center justify-between px-4 py-4 sm:px-6 sm:py-6 lg:px-12">
        <span className="font-display text-xl font-bold tracking-tight text-[var(--text)]">
          ChaseThePay
        </span>
        <nav className="flex items-center gap-4">
<Link
              href="/login"
              className="text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--text)]"
            >
              Log in
            </Link>
          <Button asChild variant="brand">
            <Link href="#waitlist">Join waitlist</Link>
          </Button>
        </nav>
      </header>

      <section className="relative z-10 px-4 pt-12 pb-12 sm:px-6 sm:pt-16 sm:pb-16 md:px-12 md:pt-24 md:pb-20 lg:px-24">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 inline-flex items-center gap-2 rounded-xl border border-[var(--green)]/30 bg-[var(--green-dim)] px-4 py-2.5 text-sm text-[var(--green)]">
            <span className="font-semibold">Invite only</span>
            <span className="text-[var(--muted)]">·</span>
            <span>50 spots · Free for life</span>
          </div>
          <p className="section-label text-xs sm:text-sm">AI-powered invoice recovery</p>
          <h1 className="font-display mt-3 text-3xl font-extrabold tracking-tight text-[var(--text)] sm:mt-4 sm:text-5xl md:text-6xl lg:text-7xl">
            Stop chasing invoices.
            <br />
            <span className="text-[var(--green)]">Let AI chase for you.</span>
          </h1>
          <p className="section-sub mt-6 max-w-2xl text-base sm:mt-8 sm:text-lg">
            Connect Stripe. ChaseThePay finds overdue invoices and sends
            intelligent, personalized email reminders to your customers—so you
            get paid without the awkward follow-ups.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:mt-12 sm:flex-row sm:gap-4">
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="w-full sm:w-fit"
            >
              <Link href="#how-it-works">How it works</Link>
            </Button>
            <Button asChild size="lg" variant="brand" className="w-full sm:w-fit">
              <Link href="#waitlist">Join waitlist</Link>
            </Button>
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="relative z-10 border-t border-[var(--border)] px-4 py-12 sm:px-6 sm:py-16 md:px-12 md:py-20 lg:px-24 scroll-mt-16 md:scroll-mt-20"
      >
        <div className="mx-auto max-w-5xl">
          <p className="section-label text-xs sm:text-sm">How it works</p>
          <h2 className="section-title mt-3 text-2xl text-[var(--text)] sm:mt-4 sm:text-3xl md:text-4xl">
            Three steps to get paid
          </h2>
          <p className="section-sub mt-3 max-w-2xl text-sm sm:mt-4 sm:text-base">
            No spreadsheets. No manual reminders. Just connect and let the AI do
            the chasing.
          </p>
          <div className="mt-10 grid gap-6 sm:mt-12 sm:gap-8 md:mt-16 md:grid-cols-3 md:gap-12">
            <div className="card-ctp p-5 sm:p-6 md:p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--green-dim)] text-[var(--green)] font-display font-bold">
                1
              </div>
              <h3 className="font-display text-lg font-semibold text-[var(--text)]">
                Connect Stripe
              </h3>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Link your Stripe account. We pull overdue invoices automatically
                every 4 hours.
              </p>
            </div>
            <div className="card-ctp p-5 sm:p-6 md:p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--green-dim)] text-[var(--green)] font-display font-bold">
                2
              </div>
              <h3 className="font-display text-lg font-semibold text-[var(--text)]">
                AI writes the emails
              </h3>
              <p className="mt-2 text-sm text-[var(--muted)]">
                GPT-4 generates personalized reminders. Tone escalates from
                friendly to firm as needed.
              </p>
            </div>
            <div className="card-ctp p-5 sm:p-6 md:p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--green-dim)] text-[var(--green)] font-display font-bold">
                3
              </div>
              <h3 className="font-display text-lg font-semibold text-[var(--text)]">
                Get paid
              </h3>
              <p className="mt-2 text-sm text-[var(--muted)]">
                When customers pay, we mark it recovered. Track ROI in your
                dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="relative z-10 border-t border-[var(--border)] px-4 py-12 sm:px-6 sm:py-16 md:px-12 md:py-20 lg:px-24 scroll-mt-16 md:scroll-mt-20">
        <div className="mx-auto max-w-3xl">
          <p className="section-label text-xs sm:text-sm">FAQ</p>
          <h2 className="font-display mt-2 text-xl font-bold tracking-tight text-[var(--text)] sm:text-2xl md:text-3xl">
            Common questions
          </h2>
          <div className="mt-8 space-y-2 sm:mt-10">
            <details className="group rounded-xl border border-[var(--border)] bg-[var(--surface)]/30">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-[var(--text)] sm:items-center sm:px-5 sm:py-4 sm:text-base [&::-webkit-details-marker]:hidden">
                Is ChaseThePay only for Stripe?
                <span className="shrink-0 text-[var(--muted)] transition group-open:rotate-180">▼</span>
              </summary>
              <p className="border-t border-[var(--border)] px-4 py-3 text-sm text-[var(--muted)] sm:px-5 sm:py-4">
                Right now, yes—we integrate with Stripe. If you use Stripe for invoicing, we pull your overdue invoices and chase them. We’re exploring other platforms for the future.
              </p>
            </details>
            <details className="group rounded-xl border border-[var(--border)] bg-[var(--surface)]/30">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-[var(--text)] sm:items-center sm:px-5 sm:py-4 sm:text-base [&::-webkit-details-marker]:hidden">
                How does the AI actually work?
                <span className="shrink-0 text-[var(--muted)] transition group-open:rotate-180">▼</span>
              </summary>
              <p className="border-t border-[var(--border)] px-4 py-3 text-sm text-[var(--muted)] sm:px-5 sm:py-4">
                GPT-4 writes personalized reminders based on the invoice amount, days overdue, and your preferred tone (friendly, professional, or firm). Each chase escalates in tone so customers get a nudge, not a threat.
              </p>
            </details>
            <details className="group rounded-xl border border-[var(--border)] bg-[var(--surface)]/30">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-[var(--text)] sm:items-center sm:px-5 sm:py-4 sm:text-base [&::-webkit-details-marker]:hidden">
                How is this actually helpful?
                <span className="shrink-0 text-[var(--muted)] transition group-open:rotate-180">▼</span>
              </summary>
              <p className="border-t border-[var(--border)] px-4 py-3 text-sm text-[var(--muted)] sm:px-5 sm:py-4">
                Chasing invoices manually is time-consuming and awkward. ChaseThePay automates it—you connect Stripe once, and we send reminders so you can focus on work that matters instead of “hey, did you get my invoice?”
              </p>
            </details>
            <details className="group rounded-xl border border-[var(--border)] bg-[var(--surface)]/30">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-[var(--text)] sm:items-center sm:px-5 sm:py-4 sm:text-base [&::-webkit-details-marker]:hidden">
                Will my customers get spammed?
                <span className="shrink-0 text-[var(--muted)] transition group-open:rotate-180">▼</span>
              </summary>
              <p className="border-t border-[var(--border)] px-4 py-3 text-sm text-[var(--muted)] sm:px-5 sm:py-4">
                No. You control the chase frequency (daily, every 3 days, or weekly) and the max chases per invoice. We stop when they pay.
              </p>
            </details>
            <details className="group rounded-xl border border-[var(--border)] bg-[var(--surface)]/30">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-[var(--text)] sm:items-center sm:px-5 sm:py-4 sm:text-base [&::-webkit-details-marker]:hidden">
                Do I need to write anything?
                <span className="shrink-0 text-[var(--muted)] transition group-open:rotate-180">▼</span>
              </summary>
              <p className="border-t border-[var(--border)] px-4 py-3 text-sm text-[var(--muted)] sm:px-5 sm:py-4">
                Nope. You connect Stripe, set your tone and frequency, and we handle the rest. The AI writes every reminder—no templates or copy-pasting.
              </p>
            </details>
            <details className="group rounded-xl border border-[var(--border)] bg-[var(--surface)]/30">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-[var(--text)] sm:items-center sm:px-5 sm:py-4 sm:text-base [&::-webkit-details-marker]:hidden">
                What if I only have a few overdue invoices?
                <span className="shrink-0 text-[var(--muted)] transition group-open:rotate-180">▼</span>
              </summary>
              <p className="border-t border-[var(--border)] px-4 py-3 text-sm text-[var(--muted)] sm:px-5 sm:py-4">
                Even a few overdue invoices add up. ChaseThePay is useful for freelancers, small agencies, and anyone who bills through Stripe—whether you have 3 or 30 overdue.
              </p>
            </details>
          </div>
        </div>
      </section>

      <section className="relative z-10 border-t border-[var(--border)] px-4 py-12 sm:px-6 sm:py-16 md:px-12 md:py-20 lg:px-24">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight text-[var(--text)] sm:text-3xl md:text-4xl">
            Ready to stop chasing?
          </h2>
          <p className="mt-3 text-sm text-[var(--muted)] sm:mt-4 sm:text-base">
            Completely free for our first 50 invited users.
          </p>
          <Button asChild size="lg" variant="brand" className="mt-6 w-full sm:mt-8 sm:w-fit">
            <Link href="#waitlist">Join waitlist</Link>
          </Button>
        </div>
      </section>

      <section
        id="waitlist"
        className="relative z-10 border-t border-[var(--border)] px-4 py-12 sm:px-6 sm:py-16 md:px-12 md:py-20 lg:px-24 scroll-mt-16 md:scroll-mt-20"
      >
        <div className="mx-auto max-w-xl">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/30 p-6 sm:p-8">
            <h2 className="font-display text-xl font-bold tracking-tight text-[var(--text)] sm:text-2xl">
              Get early access
            </h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              We&apos;re limiting ChaseThePay to 50 users during our launch. All invited users get unlimited access—completely free. Join the waitlist and we&apos;ll reach out when a spot opens.
            </p>
            <WaitlistForm />
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-[var(--border)] px-4 py-6 sm:px-6 sm:py-8 lg:px-12">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <span className="text-sm text-[var(--muted2)]">
            © {new Date().getFullYear()} ChaseThePay
          </span>
          <div className="flex gap-6">
            <Link href="/login" className="text-sm text-[var(--muted)] hover:text-[var(--text)]">
              Log in
            </Link>
            <Link href="#waitlist" className="text-sm text-[var(--muted)] hover:text-[var(--text)]">
              Join waitlist
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

import Link from "next/link";
import Image from "next/image";
import { Check, Zap, ArrowRight } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { NightScene } from "@/components/night-scene";
import { ScrollDayOverlay } from "@/components/scroll-day-overlay";

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

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is ChaseThePay only for Stripe?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Right now, yes—we integrate with Stripe. If you use Stripe for invoicing, we pull your overdue invoices and chase them. We're exploring other platforms for the future.",
      },
    },
    {
      "@type": "Question",
      name: "How does the AI actually work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "GPT-4 writes personalized reminders based on the invoice amount, days overdue, and your preferred tone (friendly, professional, or firm). Each chase escalates in tone so customers get a nudge, not a threat.",
      },
    },
    {
      "@type": "Question",
      name: "How is this actually helpful?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Chasing invoices manually is time-consuming and awkward. ChaseThePay automates it—you connect Stripe once, and we send reminders so you can focus on work that matters instead of awkward follow-ups.",
      },
    },
    {
      "@type": "Question",
      name: "Will my customers get spammed?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. You control the chase frequency (daily, every 3 days, or weekly) and the max chases per invoice. We stop when they pay.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need to write anything?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Nope. You connect Stripe, set your tone and frequency, and we handle the rest. The AI writes every reminder—no templates or copy-pasting.",
      },
    },
    {
      "@type": "Question",
      name: "What if I only have a few overdue invoices?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Even a few overdue invoices add up. ChaseThePay is useful for freelancers, small agencies, and anyone who bills through Stripe—whether you have 3 or 30 overdue.",
      },
    },
    {
      "@type": "Question",
      name: "What data do you access from my Stripe account?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We use Stripe Connect and only access what we need to send reminders and track recovery: open overdue invoices (ID, due date, amount), customer name and email, payment link, and payment status. We do not access payment methods, card numbers, or bank details. You can disconnect Stripe anytime from Settings.",
      },
    },
  ],
};

export const metadata = {
  title: "ChaseThePay — Automated Invoice Chasing",
  description:
    "Stop chasing invoices. Let AI chase for you. Connect Stripe and ChaseThePay sends intelligent email reminders to overdue customers—automatically.",
  openGraph: {
    title: "ChaseThePay — Automated Invoice Chasing",
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="pointer-events-none fixed inset-0 z-0 hidden overflow-hidden md:block">
        <NightScene />
        <div className="hero-orb" aria-hidden />
      </div>
      <ScrollDayOverlay />
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[var(--border)]/50 bg-[var(--bg)]/80 backdrop-blur-md px-4 py-4 sm:px-6 lg:px-12">
        <Logo href="/" className="text-xl" />
        <nav className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--text)]"
          >
            Log in
          </Link>
          <Button asChild variant="brand">
            <Link href="/signup">Chase for free</Link>
          </Button>
        </nav>
      </header>

      <section className="relative z-10 px-4 pt-8 pb-16 sm:pt-12 sm:pb-20 md:pt-16 md:pb-24 lg:pt-20 lg:pb-28">
        <div className="mx-auto max-w-3xl text-center">
          <div
            className="mb-8 inline-block border-2 border-[var(--text)] bg-[#FCCC0A] px-4 py-2 shadow-[3px_3px_0_var(--text)]"
            style={{ transform: "rotate(-1deg)" }}
          >
            <p className="font-display text-sm font-extrabold uppercase tracking-wider text-[#03160c]">
              10 free chases per month
            </p>
            <p className="mt-0.5 text-xs font-bold uppercase tracking-widest text-[#03160c]/80">
              No card required · $9.99/mo after
            </p>
          </div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-[var(--text)] sm:text-4xl md:text-5xl lg:text-6xl">
            Recover unpaid invoices automatically.
          </h1>
          <p className="mt-6 text-base text-[var(--muted)] sm:text-lg max-w-2xl mx-auto">
            Connect Stripe. We find overdue invoices and send AI-written reminders to your customers—so you get paid without the awkward follow-ups.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" variant="brand" className="w-full sm:w-auto">
              <Link href="/signup">Get Started For Free</Link>
            </Button>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 text-sm font-medium text-[var(--green)] underline underline-offset-4 hover:text-[var(--text)] transition-colors"
            >
              See How it Works
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
          <div className="mt-16 md:mt-20 hidden md:flex justify-center">
            <div className="relative w-full max-w-4xl overflow-hidden rounded-xl border border-[var(--border)] shadow-2xl">
              <Image
                src="/chasethepay-dashboard.png"
                alt="ChaseThePay dashboard showing overdue invoices and recovery"
                width={1200}
                height={720}
                className="w-full h-auto"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="relative z-10 border-t border-[var(--border)] px-4 py-12 sm:px-6 sm:py-16 md:px-12 md:py-20 lg:px-24"
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

      <section
        id="pricing"
        className="relative z-10 border-t border-[var(--border)] px-4 py-12 sm:px-6 sm:py-16 md:px-12 md:py-20 lg:px-24"
      >
        <div className="mx-auto max-w-5xl">
          <p className="section-label text-xs sm:text-sm">Pricing</p>
          <h2 className="section-title mt-3 text-2xl text-[var(--text)] sm:mt-4 sm:text-3xl md:text-4xl">
            Simple, predictable. Pay only when you scale.
          </h2>
          <p className="section-sub mt-3 max-w-2xl text-sm sm:mt-4 sm:text-base">
            Start free. Upgrade when you need more. No contracts, cancel anytime.
          </p>
          <div className="mt-10 grid gap-6 sm:mt-14 md:grid-cols-2 md:gap-8 lg:gap-10">
            {/* Free tier */}
            <div className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]/20 p-6 transition-all hover:border-[var(--border-bright)] sm:p-8">
              <div className="flex items-start justify-between">
                <h3 className="font-display text-xl font-bold text-[var(--text)] sm:text-2xl">
                  Free
                </h3>
                <div className="text-right">
                  <span className="font-display text-3xl font-bold text-[var(--text)]">$0</span>
                  <span className="text-sm text-[var(--muted)]">/month</span>
                </div>
              </div>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Perfect for trying it out or light use.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "10 chase emails per month",
                  "AI-powered reminders",
                  "Stripe integration",
                  "Recovery dashboard",
                  "Resets every month",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-[var(--text)]">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--green-dim)]">
                      <Check className="h-3 w-3 text-[var(--green)]" strokeWidth={2.5} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <Button
                asChild
                variant="outline"
                className="mt-8 w-full border-[var(--border)] bg-transparent hover:bg-[var(--surface)]"
              >
                <Link href="/signup">Get started free</Link>
              </Button>
            </div>

            {/* Pro tier */}
            <div className="relative overflow-hidden rounded-2xl border-2 border-[var(--green)]/50 bg-gradient-to-b from-[var(--green-dim)]/30 to-transparent p-6 shadow-[0_0_40px_rgba(16,232,152,0.08)] transition-all hover:border-[var(--green)]/70 hover:shadow-[0_0_50px_rgba(16,232,152,0.12)] sm:p-8">
              <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-[var(--green)]/20 px-3 py-1 text-xs font-semibold text-[var(--green)]">
                <Zap className="h-3.5 w-3.5" />
                Most popular
              </div>
              <div className="flex items-start justify-between">
                <h3 className="font-display text-xl font-bold text-[var(--text)] sm:text-2xl">
                  Pro
                </h3>
                <div className="text-right">
                  <span className="font-display text-3xl font-bold text-[var(--green)]">$9.99</span>
                  <span className="text-sm text-[var(--muted)]">/month</span>
                </div>
              </div>
              <p className="mt-2 text-sm text-[var(--muted)]">
                For teams that chase a lot. Unlimited peace of mind.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Unlimited chase emails",
                  "AI-powered reminders",
                  "Stripe integration",
                  "Recovery dashboard",
                  "Priority support",
                  "Cancel anytime",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-[var(--text)]">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--green)]/20">
                      <Check className="h-3 w-3 text-[var(--green)]" strokeWidth={2.5} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <Button asChild variant="brand" size="lg" className="mt-8 w-full">
                <Link href="/signup">Start Pro</Link>
              </Button>
              <p className="mt-3 text-center text-xs text-[var(--muted)]">
                Upgrade from your dashboard after signup
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
            <details className="group rounded-xl border border-[var(--border)] bg-[var(--surface)]/30">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-[var(--text)] sm:items-center sm:px-5 sm:py-4 sm:text-base [&::-webkit-details-marker]:hidden">
                What data do you access from my Stripe account?
                <span className="shrink-0 text-[var(--muted)] transition group-open:rotate-180">▼</span>
              </summary>
              <div className="border-t border-[var(--border)] px-4 py-3 text-sm text-[var(--muted)] sm:px-5 sm:py-4 space-y-3">
                <p>
                  We use Stripe Connect and only access what we need to send reminders and track recovery. We fetch:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Open overdue invoices (ID, due date, amount owed)</li>
                  <li>Customer name and email (to send the reminder)</li>
                  <li>Payment link (Stripe&apos;s hosted invoice URL, so customers can pay with one click)</li>
                  <li>Payment status (to know when an invoice is paid)</li>
                </ul>
                <p>
                  We do <strong>not</strong> access payment methods, card numbers, bank details, or any data beyond what&apos;s listed above. You can disconnect Stripe anytime from Settings, which removes our access and deletes your invoice data from our system.
                </p>
              </div>
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
            Start free with 10 chases per month.
          </p>
          <Button asChild size="lg" variant="brand" className="mt-6 w-full sm:mt-8 sm:w-fit">
            <Link href="/signup">Sign up</Link>
          </Button>
        </div>
      </section>

      <footer className="relative z-10 border-t border-[var(--border)] px-4 py-5 sm:px-6 sm:py-6 lg:px-12">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <span className="text-sm text-[var(--muted2)]">
            © {new Date().getFullYear()} ChaseThePay
          </span>
          <div className="flex gap-6">
            <Link href="/login" className="text-sm text-[var(--muted)] hover:text-[var(--text)]">
              Log in
            </Link>
            <Link href="/signup" className="text-sm text-[var(--muted)] hover:text-[var(--text)]">
              Chase for free
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

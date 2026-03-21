import Link from "next/link";
import { Check, Zap, ArrowRight, Briefcase, Users, Layers, Scale, Store, FileCheck } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { LandingDashboardMockup } from "@/components/landing-dashboard-mockup";
import { TypewriterText } from "@/components/typewriter-text";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "ChaseThePay",
  applicationCategory: "FinanceApplication",
  description:
    "Automated invoice chasing. Connect Stripe and send personalized email reminders to overdue customers—so you get paid without the awkward follow-ups.",
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
      name: "How do the reminders actually work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We craft each reminder based on the invoice amount, when it was due, and your preferred tone. We also track opens and clicks—so the next reminder adapts to where the customer left off. Thoughtful follow-ups that get responses.",
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
    "Stop chasing invoices. Connect Stripe and ChaseThePay sends personalized reminders to overdue customers—so you get paid without the awkward follow-ups.",
  openGraph: {
    title: "ChaseThePay — Automated Invoice Chasing",
    description:
      "Stop chasing invoices. Connect Stripe and ChaseThePay sends personalized reminders to overdue customers—so you get paid without the awkward follow-ups.",
  },
};

export default function Home() {
  return (
    <main className="landing-page relative min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[var(--landing-border)] bg-white/90 backdrop-blur-sm px-4 py-4 sm:px-6 lg:px-12">
        <Logo href="/" className="text-xl" />
        <nav className="flex items-center gap-4 sm:gap-6">
          <a
            href="#how-it-works"
            className="hidden text-sm font-medium text-[var(--landing-muted)] transition-colors hover:text-[var(--landing-text)] sm:block"
          >
            Features
          </a>
          <a
            href="#pricing"
            className="hidden text-sm font-medium text-[var(--landing-muted)] transition-colors hover:text-[var(--landing-text)] sm:block"
          >
            Pricing
          </a>
          <Link
            href="/login"
            className="text-sm font-medium text-[var(--landing-muted)] transition-colors hover:text-[var(--landing-text)]"
          >
            Log in
          </Link>
          <Button asChild className="landing-btn-primary rounded-lg px-5">
            <Link href="/signup">Sign up</Link>
          </Button>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative px-4 pt-12 pb-16 sm:pt-16 sm:pb-20 md:pt-20 md:pb-28">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm text-[var(--landing-muted)] sm:text-base">
            Automated invoice chasing, made for{" "}
            <TypewriterText className="font-bold text-[var(--primary)]" />
          </p>
          <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-[var(--landing-text)] sm:text-4xl md:text-5xl lg:text-6xl">
            Turn your overdue invoices into{" "}
            <span className="landing-gradient-text">paid</span> ones
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-base text-[var(--landing-muted)] sm:text-lg">
            Connect Stripe. We find overdue invoices and send personalized reminders to your customers—so you get paid without the awkward follow-ups.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <Button
              asChild
              size="lg"
              className="landing-btn-primary landing-btn-glow w-full rounded-lg px-8 py-6 text-base font-semibold sm:w-auto"
            >
              <Link href="/signup">Get started free</Link>
            </Button>
            <Link
              href="#how-it-works"
              className="inline-flex items-center gap-2 text-base font-medium text-[var(--primary)] underline underline-offset-4 transition-colors hover:text-[var(--primary-hover)]"
            >
              See how it works
              <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
            </Link>
          </div>
          <p className="mt-4 text-sm text-[var(--landing-muted2)]">
            10 free chases per month · No credit card required
          </p>

          {/* Dashboard mockup — hidden on small screens */}
          <div className="mt-16 hidden md:mt-24 md:block">
            <LandingDashboardMockup />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="border-t border-[var(--landing-border)] bg-[var(--landing-surface)] px-4 py-16 sm:px-6 sm:py-20 md:px-12 md:py-24"
      >
        <div className="mx-auto max-w-5xl">
          <h2 className="font-display text-2xl font-bold tracking-tight text-[var(--landing-text)] sm:text-3xl md:text-4xl">
            How it works
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-[var(--landing-muted)] sm:text-base">
            With ChaseThePay, you can recover unpaid invoices without manual follow-ups. Connect once and we handle the rest.
          </p>
          <div className="mt-12 flex flex-col items-stretch gap-4 md:mt-16 md:flex-row md:items-start md:gap-0">
            {/* Step 1 */}
            <div className="landing-step-card relative flex-1 p-6 md:rounded-xl">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--landing-text)] text-white font-display font-bold">
                1
              </div>
              <p className="text-[var(--landing-text)] font-medium">
                Connect your Stripe account in under a minute.
              </p>
            </div>
            {/* Connector - visible on md+ */}
            <div className="hidden flex-shrink-0 items-center px-2 pt-14 md:flex md:w-8">
              <div className="h-0.5 w-full border-t-2 border-dashed border-[var(--landing-border)]" />
            </div>
            {/* Mobile connector */}
            <div className="flex justify-center py-2 md:hidden">
              <div className="h-4 w-0.5 border-l-2 border-dashed border-[var(--landing-border)]" />
            </div>
            {/* Step 2 - featured */}
            <div className="landing-step-card landing-step-card-featured relative flex-1 p-6 md:rounded-xl">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--landing-text)] text-white font-display font-bold">
                2
              </div>
              <p className="text-[var(--landing-text)] font-medium">
                We send smart reminders and track clicks—so the next message adapts to where they left off.
              </p>
            </div>
            {/* Connector */}
            <div className="hidden flex-shrink-0 items-center px-2 pt-14 md:flex md:w-8">
              <div className="h-0.5 w-full border-t-2 border-dashed border-[var(--landing-border)]" />
            </div>
            {/* Mobile connector */}
            <div className="flex justify-center py-2 md:hidden">
              <div className="h-4 w-0.5 border-l-2 border-dashed border-[var(--landing-border)]" />
            </div>
            {/* Step 3 */}
            <div className="landing-step-card relative flex-1 p-6 md:rounded-xl">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--landing-text)] text-white font-display font-bold">
                3
              </div>
              <p className="text-[var(--landing-text)] font-medium">
                Get paid. Track recovered invoices in your dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="border-t border-[var(--landing-border)] px-4 py-16 sm:px-6 sm:py-20 md:px-12 md:py-24">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--landing-muted)]">
            Who it&apos;s for
          </p>
          <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-[var(--landing-text)] sm:text-3xl md:text-4xl">
            Built for people who get paid after the work is done
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-[var(--landing-muted)] sm:text-base">
            If you invoice, wait for payment, and sometimes have to nudge—ChaseThePay is for you.
          </p>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Briefcase, title: "Freelancers & agencies", desc: "Project-based billing. The work ships, the invoice follows—and sometimes gets forgotten." },
              { icon: Users, title: "Consultants", desc: "Retainers and per-project fees. You deliver, they pay. Until they don't, and you're stuck chasing." },
              { icon: Layers, title: "B2B services", desc: "Design, dev, marketing. You invoice after the job. Payment isn't automatic—follow-ups are." },
              { icon: Scale, title: "Professional services", desc: "Accountants, lawyers, architects. Manual invoicing. Clients who mean well but forget." },
              { icon: Store, title: "Marketplaces", desc: "Payouts, commissions, affiliate checks. Money that sits in someone else's queue." },
              { icon: FileCheck, title: "SaaS with custom deals", desc: "Annual invoices, negotiated terms. You sent the invoice—now you wait." },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="landing-step-card flex gap-4 p-6"
              >
                <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--green)]/10 text-[var(--green)]">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-display text-base font-semibold text-[var(--landing-text)] sm:text-lg">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm text-[var(--landing-muted)]">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reminders that work */}
      <section className="border-t border-[var(--landing-border)] bg-[var(--landing-surface)] px-4 py-16 sm:px-6 sm:py-20 md:px-12 md:py-24">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--landing-muted)]">
            Reminders that work
          </p>
          <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-[var(--landing-text)] sm:text-3xl md:text-4xl">
            We pay attention so you get paid
          </h2>
          <p className="mt-3 text-sm text-[var(--landing-muted)] sm:text-base">
            We don&apos;t blast the same reminder every time. We track what happens when it lands in their inbox.
          </p>
          <div className="mt-8 space-y-6">
            <p className="text-[var(--landing-text)] text-sm sm:text-base leading-relaxed">
              Did they click but bounce before paying? We see that—the follow-up offers the link again, no guilt trip. Each reminder is crafted around where they actually left off.
            </p>
            <p className="text-[var(--landing-text)] text-sm sm:text-base leading-relaxed">
              So it feels like a thoughtful follow-up from you—not a generic ping. More paid invoices. Fewer awkward conversations.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section
        id="pricing"
        className="border-t border-[var(--landing-border)] px-4 py-16 sm:px-6 sm:py-20 md:px-12 md:py-24"
      >
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--landing-muted)]">
            Pricing
          </p>
          <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-[var(--landing-text)] sm:text-3xl md:text-4xl">
            Simple, predictable. Pay only when you scale.
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-[var(--landing-muted)] sm:text-base">
            Start free. Upgrade when you need more. No contracts, cancel anytime.
          </p>
          <div className="mt-12 grid gap-6 sm:mt-14 md:grid-cols-2 md:gap-8">
            <div className="landing-step-card p-6 sm:p-8">
              <div className="flex items-start justify-between">
                <h3 className="font-display text-xl font-bold text-[var(--landing-text)] sm:text-2xl">
                  Free
                </h3>
                <div className="text-right">
                  <span className="font-display text-3xl font-bold text-[var(--landing-text)]">$0</span>
                  <span className="text-sm text-[var(--landing-muted)]">/month</span>
                </div>
              </div>
              <p className="mt-2 text-sm text-[var(--landing-muted)]">
                Perfect for trying it out or light use.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "10 chase emails per month",
                  "Smart, personalized reminders",
                  "Stripe integration",
                  "Recovery dashboard",
                  "Resets every month",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-[var(--landing-text)]">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--green)]/20">
                      <Check className="h-3 w-3 text-[var(--green)]" strokeWidth={2.5} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <Button
                asChild
                variant="outline"
                className="landing-btn-outline mt-8 w-full rounded-lg"
              >
                <Link href="/signup">Get started free</Link>
              </Button>
            </div>

            <div className="landing-step-card relative overflow-hidden border-2 border-[var(--green)]/40 bg-gradient-to-b from-[var(--green)]/5 to-transparent p-6 sm:p-8">
              <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-[var(--green)]/20 px-3 py-1 text-xs font-semibold text-[var(--green)]">
                <Zap className="h-3.5 w-3.5" />
                Most popular
              </div>
              <div className="flex items-start justify-between">
                <h3 className="font-display text-xl font-bold text-[var(--landing-text)] sm:text-2xl">
                  Pro
                </h3>
                <div className="text-right">
                  <span className="font-display text-3xl font-bold text-[var(--green)]">$9.99</span>
                  <span className="text-sm text-[var(--landing-muted)]">/month</span>
                </div>
              </div>
              <p className="mt-2 text-sm text-[var(--landing-muted)]">
                For teams that chase a lot. Unlimited peace of mind.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Unlimited chase emails",
                  "Smart, personalized reminders",
                  "Stripe integration",
                  "Recovery dashboard",
                  "Priority support",
                  "Cancel anytime",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-[var(--landing-text)]">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--green)]/20">
                      <Check className="h-3 w-3 text-[var(--green)]" strokeWidth={2.5} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <Button asChild variant="brand" size="lg" className="mt-8 w-full rounded-lg">
                <Link href="/signup">Start Pro</Link>
              </Button>
              <p className="mt-3 text-center text-xs text-[var(--landing-muted)]">
                Upgrade from your dashboard after signup
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-[var(--landing-border)] bg-[var(--landing-surface)] px-4 py-16 sm:px-6 sm:py-20 md:px-12 md:py-24 scroll-mt-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--landing-muted)]">
            FAQ
          </p>
          <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-[var(--landing-text)] sm:text-3xl">
            Common questions
          </h2>
          <div className="mt-8 space-y-2 sm:mt-10">
            {[
              {
                q: "Is ChaseThePay only for Stripe?",
                a: "Right now, yes—we integrate with Stripe. If you use Stripe for invoicing, we pull your overdue invoices and chase them. We're exploring other platforms for the future.",
              },
              {
                q: "How do the reminders actually work?",
                a: "We craft each reminder based on the invoice amount, when it was due, and your preferred tone. We also track clicks—so the next reminder adapts to where the customer left off.",
              },
              {
                q: "How is this actually helpful?",
                a: "Chasing invoices manually is time-consuming and awkward. ChaseThePay automates it—you connect Stripe once, and we send reminders so you can focus on work that matters.",
              },
              {
                q: "Will my customers get spammed?",
                a: "No. You control the chase frequency (daily, every 3 days, or weekly) and the max chases per invoice. We stop when they pay.",
              },
              {
                q: "Do I need to write anything?",
                a: "Nope. You connect Stripe, set your tone and frequency, and we handle the rest. The AI writes every reminder—no templates or copy-pasting.",
              },
              {
                q: "What if I only have a few overdue invoices?",
                a: "Even a few overdue invoices add up. ChaseThePay is useful for freelancers, small agencies, and anyone who bills through Stripe—whether you have 3 or 30 overdue.",
              },
              {
                q: "What data do you access from my Stripe account?",
                a: "We use Stripe Connect and only access what we need: open overdue invoices (ID, due date, amount), customer name and email, payment link, and payment status. We do not access payment methods, card numbers, or bank details. You can disconnect Stripe anytime.",
              },
            ].map(({ q, a }) => (
              <details
                key={q}
                className="group rounded-xl border border-[var(--landing-border)] bg-white"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-[var(--landing-text)] sm:px-5 sm:py-4 sm:text-base [&::-webkit-details-marker]:hidden">
                  {q}
                  <span className="shrink-0 text-[var(--landing-muted)] transition group-open:rotate-180">▼</span>
                </summary>
                <p className="border-t border-[var(--landing-border)] px-4 py-3 text-sm text-[var(--landing-muted)] sm:px-5 sm:py-4">
                  {a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[var(--landing-border)] px-4 py-16 sm:px-6 sm:py-20 md:px-12 md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight text-[var(--landing-text)] sm:text-3xl md:text-4xl">
            Ready to stop chasing?
          </h2>
          <p className="mt-3 text-sm text-[var(--landing-muted)] sm:mt-4 sm:text-base">
            Start free with 10 chases per month.
          </p>
          <Button asChild size="lg" className="landing-btn-primary landing-btn-glow mt-6 rounded-lg px-8 sm:mt-8">
            <Link href="/signup">Sign up</Link>
          </Button>
        </div>
      </section>

      {/* Brand / social proof */}
      <section className="border-t border-[var(--landing-border)] px-4 py-12 sm:px-6">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 sm:flex-row">
          <p className="text-sm text-[var(--landing-muted2)]">
            Trusted by freelancers and agencies
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--landing-border)] px-4 py-6 sm:px-6 sm:py-8 lg:px-12">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <span className="text-sm text-[var(--landing-muted2)]">
            © {new Date().getFullYear()} ChaseThePay
          </span>
          <div className="flex gap-6">
            <Link href="/login" className="text-sm text-[var(--landing-muted)] hover:text-[var(--landing-text)]">
              Log in
            </Link>
            <Link href="/signup" className="text-sm text-[var(--landing-muted)] hover:text-[var(--landing-text)]">
              Sign up
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

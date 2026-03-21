import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["700", "800"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://chasethepay.com"),
  icons: {
    icon: [
      { url: "/chasethepay-icon.svg", type: "image/svg+xml" },
      { url: "/chasethepay-icon.png", type: "image/png", sizes: "32x32" },
    ],
    apple: "/chasethepay-icon.png",
  },
  title: {
    default: "ChaseThePay — Automated Invoice Chasing",
    template: "%s | ChaseThePay",
  },
  description:
    "Stop chasing invoices. Let AI chase for you. Connect Stripe, and ChaseThePay sends intelligent email reminders to overdue customers—automatically.",
  keywords: [
    "invoice chasing",
    "overdue invoices",
    "accounts receivable",
    "AI invoice reminder",
    "Stripe invoices",
    "freelancer invoicing",
  ],
  authors: [{ name: "ChaseThePay" }],
  creator: "ChaseThePay",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "ChaseThePay",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${bricolage.variable} ${dmSans.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

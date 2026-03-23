import { NextRequest, NextResponse } from "next/server";

const ALLOWED_HOSTS = ["invoice.stripe.com", "files.stripe.com"];

function decodeBase64Url(str: string): string {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  return atob(padded);
}

/**
 * Redirect to Stripe invoice URL. Keeps links on our domain for deliverability.
 * GET /pay?u=BASE64URL(stripe_url)
 */
export async function GET(request: NextRequest) {
  const baseUrl = request.nextUrl.origin;
  const homeRedirect = new URL("/", baseUrl);

  const u = request.nextUrl.searchParams.get("u");
  if (!u) {
    return NextResponse.redirect(homeRedirect, 302);
  }

  let target: string;
  try {
    target = decodeBase64Url(u);
  } catch {
    return NextResponse.redirect(homeRedirect, 302);
  }

  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    return NextResponse.redirect(homeRedirect, 302);
  }

  if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
    return NextResponse.redirect(homeRedirect, 302);
  }

  return NextResponse.redirect(parsed.toString(), 302);
}

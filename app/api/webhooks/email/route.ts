import { NextResponse } from "next/server";

export async function POST() {
  // Delivery status updates from email provider (e.g. Resend webhooks)
  return NextResponse.json({ received: true });
}

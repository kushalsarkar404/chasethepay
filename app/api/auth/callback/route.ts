import { NextResponse } from "next/server";

export async function POST() {
  // Supabase OAuth callback — create session + settings row
  return NextResponse.json({ ok: true });
}

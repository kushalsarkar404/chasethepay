import { createClient } from "@/lib/supabase/server";
import { trackMarketingEvent } from "@/lib/marketing";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { event?: "sign_in" | "view_billing" | "survey_sent" };
  try {
    body = await req.json().catch(() => ({}));
  } catch {
    body = {};
  }

  const event = body.event;
  if (event && !["sign_in", "view_billing", "survey_sent"].includes(event)) {
    return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  }

  try {
    await trackMarketingEvent(user.id, event);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[marketing/track]", err);
    return NextResponse.json(
      { error: "Failed to track" },
      { status: 500 }
    );
  }
}

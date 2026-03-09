import { createClient } from "@/lib/supabase/server";
import { markSurveySent } from "@/lib/marketing";
import { NextResponse } from "next/server";

/**
 * Mark that a survey was sent to the current user.
 * Requires authentication.
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await markSurveySent(user.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[marketing/survey-sent]", err);
    return NextResponse.json(
      { error: "Failed to record survey" },
      { status: 500 }
    );
  }
}

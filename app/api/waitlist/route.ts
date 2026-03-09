import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Please enter a valid email"),
  name: z.string().max(100).optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().formErrors[0] ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { email, name } = parsed.data;

  const supabase = await createClient();

  const { error } = await supabase.from("waitlist").insert({
    email: email.toLowerCase().trim(),
    name: name?.trim() || null,
  });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "You're already on the waitlist." },
        { status: 409 }
      );
    }
    console.error("[waitlist] insert error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, message: "You're on the list!" });
}

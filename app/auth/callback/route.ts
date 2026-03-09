import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        try {
          const admin = createAdminClient();
          const { data: existing } = await admin
            .from("settings")
            .select("user_id")
            .eq("user_id", user.id)
            .single();
          if (!existing) {
            await admin.from("settings").insert({ user_id: user.id });
          }
        } catch {
          // Service key may be missing in dev; settings created on first use
        }
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}

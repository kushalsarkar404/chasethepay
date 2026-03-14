import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("chases")
    .select(
      `
      id,
      message,
      sent_at,
      status,
      invoice_id,
      invoices (
        customer_name,
        customer_email
      )
    `
    )
    .order("sent_at", { ascending: false });

  if (error) {
    console.error("[sent-emails] List error:", error.message);
    return NextResponse.json(
      { error: error.message || "Failed to fetch" },
      { status: 500 }
    );
  }

  const items = (data ?? []).map((c) => {
    const inv = (c.invoices as unknown) as { customer_name: string | null; customer_email: string | null } | null;
    return {
      id: c.id,
      message: c.message,
      sentAt: c.sent_at,
      status: c.status,
      invoiceId: c.invoice_id,
      recipientName: inv?.customer_name ?? "—",
      recipientEmail: inv?.customer_email ?? "—",
    };
  });

  return NextResponse.json({ items });
}

export async function DELETE(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const schema = z.object({ ids: z.array(z.string().uuid()) });
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Body must have ids: string[] of chase UUIDs" },
      { status: 400 }
    );
  }

  const { ids } = parsed.data;
  if (ids.length === 0) {
    return NextResponse.json({ deleted: 0 });
  }

  const { error } = await supabase.from("chases").delete().in("id", ids);

  if (error) {
    console.error("[sent-emails] Delete error:", error.message);
    return NextResponse.json(
      { error: error.message || "Failed to delete" },
      { status: 500 }
    );
  }

  return NextResponse.json({ deleted: ids.length });
}

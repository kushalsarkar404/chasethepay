import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

function nextFifteenMin(): Date {
  const now = new Date();
  const ms = now.getTime();
  const interval = 15 * 60 * 1000;
  return new Date(Math.ceil(ms / interval) * interval);
}

function nextHour(): Date {
  const now = new Date();
  const next = new Date(now);
  next.setMinutes(0, 0, 0);
  if (next.getTime() <= now.getTime()) {
    next.setHours(next.getHours() + 1);
  }
  return next;
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: rows, error } = await supabase
    .from("cron_status")
    .select("key, ran_at, scanned, synced, sent")
    .in("key", ["scan", "auto_chase"]);

  const rowsList = error ? [] : rows ?? [];

  const scanRow = rowsList.find((r) => r.key === "scan");
  const autoChaseRow = rowsList.find((r) => r.key === "auto_chase");

  return NextResponse.json({
    lastScan: scanRow?.ran_at ?? null,
    nextScan: nextFifteenMin().toISOString(),
    scanScanned: scanRow?.scanned ?? 0,
    scanSynced: scanRow?.synced ?? 0,
    lastAutoChase: autoChaseRow?.ran_at ?? null,
    nextAutoChase: nextHour().toISOString(),
    autoChaseSent: autoChaseRow?.sent ?? 0,
  });
}

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const poolId = url.searchParams.get("pool_id") || process.env.POOL_ID || "2026-playoffs";

  // Pull entries (latest first). We'll sort by points later when scoring exists.
  const { data, error } = await supabaseAdmin
    .from("pool_entries")
    .select("entrant_name, submitted_at, updated_at, roster")
    .eq("pool_id", poolId)
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []).map((e) => {
    // roster is JSON; compute slot count for display/debug
    const rosterObj = (e.roster ?? {}) as Record<string, unknown>;
    const slotCount = Object.keys(rosterObj).length;

    return {
      entrant_name: e.entrant_name,
      submitted_at: e.submitted_at,
      updated_at: e.updated_at,
      slot_count: slotCount,
      // keep roster out of leaderboard payload by default (lighter + faster)
    };
  });

  return NextResponse.json({ ok: true, poolId, entries: rows });
}

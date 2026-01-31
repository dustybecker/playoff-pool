import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

type LeaderboardRow = {
  entrant_name: string;
  round: number;
  points: number;
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const poolId =
    url.searchParams.get("pool_id") ||
    process.env.POOL_ID ||
    "2026-playoffs";

  const { data, error } = await supabaseAdmin
    .from("entry_round_lineups")
    .select("entrant_name, round, points")
    .eq("pool_id", poolId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const byEntrant = new Map<string, { entrant_name: string; round1: number; round2: number; round3: number; total: number }>();

  for (const row of data ?? []) {
    const entrant = row.entrant_name;
    const points = Number(row.points ?? 0);
    const record =
      byEntrant.get(entrant) ?? {
        entrant_name: entrant,
        round1: 0,
        round2: 0,
        round3: 0,
        total: 0,
      };

    if (row.round === 1) record.round1 += points;
    if (row.round === 2) record.round2 += points;
    if (row.round === 3) record.round3 += points;
    record.total += points;
    byEntrant.set(entrant, record);
  }

  const entries = Array.from(byEntrant.values()).sort((a, b) => b.total - a.total);

  return NextResponse.json({ ok: true, poolId, entries });
}

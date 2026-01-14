import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

type LeaderboardRow = {
  entrant_name: string;
  points: number;
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const poolId =
    url.searchParams.get("pool_id") ||
    process.env.POOL_ID ||
    "2026-playoffs";

  // Read from the NEW view backed by entry_round_lineups
  const { data, error } = await supabaseAdmin
    .from("leaderboard_points_v2")
    .select("entrant_name, points")
    .eq("pool_id", poolId)
    .order("points", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const entries = (data ?? []).map((r: LeaderboardRow) => ({
    entrant_name: r.entrant_name,
    points: Number(r.points ?? 0),
  }));

  return NextResponse.json({ ok: true, poolId, entries });
}

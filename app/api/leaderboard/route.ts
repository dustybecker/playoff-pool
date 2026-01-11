import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

type LeaderboardRow = {
  entrant_name: string;
  points: number;
  updated_at: string | null;
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const poolId =
    url.searchParams.get("pool_id") || process.env.POOL_ID || "2026-playoffs";

  // Read from the Supabase VIEW that already does:
  // roster JSON -> rows (excluding bench) -> join to player_round_points -> sum(points)
  const { data, error } = await supabaseAdmin
    .from("leaderboard_points")
    .select("entrant_name, points, updated_at")
    .eq("pool_id", poolId)
    .order("points", { ascending: false })
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const entries = (data ?? []).map((r: LeaderboardRow) => ({
    entrant_name: r.entrant_name,
    points: Number(r.points ?? 0),
    updated_at: r.updated_at,
  }));

  return NextResponse.json({ ok: true, poolId, entries });
}

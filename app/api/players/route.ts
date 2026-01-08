import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const poolId = searchParams.get("pool_id") ?? "2026-playoffs";
  const conference = searchParams.get("conference"); // AFC | NFC
  const pos = searchParams.get("pos"); // QB | RB | WR | TE
  const q = searchParams.get("q"); // search string

  let query = supabaseAdmin
    .from("pool_players")
    .select("player_id, player_name, pos, team_id, team_abbr, conference")
    .eq("pool_id", poolId);

  if (conference) query = query.eq("conference", conference);
  if (pos) query = query.eq("pos", pos);
  if (q) query = query.ilike("player_name", `%${q}%`);

  const { data, error } = await query.order("player_name");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ players: data });
}

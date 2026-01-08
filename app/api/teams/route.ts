import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const poolId = searchParams.get("pool_id") ?? "2026-playoffs";

  const { data, error } = await supabaseAdmin
  .from("pool_teams")
  .select("team_id, team_name, team_abbr, conference, division, is_playoff")
  .eq("pool_id", poolId)
  .eq("is_playoff", true)
  .order("team_name");


  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ teams: data });
}

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

type Conference = "AFC" | "NFC";
type Pos = "QB" | "RB" | "WR" | "TE";

type Player = {
  player_id: string;
  player_name: string;
  pos?: Pos; // optional here; edit mode is not validating
  team_id?: string;
  team_abbr?: string | null;
  conference?: Conference | null;
};

type Payload = {
  pool_id: string;
  entrant_name: string;
  roster: Record<string, Player | null>;
};

function normalizeName(name: string) {
  return name.trim().replace(/\s+/g, " ");
}

export async function POST(req: Request) {
  let body: Payload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const poolId = (body.pool_id ?? "").trim();
  const entrantName = normalizeName(body.entrant_name ?? "");
  const roster = body.roster ?? {};

  if (!poolId) {
    return NextResponse.json({ error: "Missing pool_id." }, { status: 400 });
  }
  if (!entrantName) {
    return NextResponse.json({ error: "Missing entrant_name." }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("pool_entries")
    .upsert(
      {
        pool_id: poolId,
        entrant_name: entrantName,
        roster,
        // If you have updated_at triggers, omit this.
        // updated_at: new Date().toISOString(),
      },
      { onConflict: "pool_id,entrant_name" }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, pool_id: poolId, entrant_name: entrantName });
}

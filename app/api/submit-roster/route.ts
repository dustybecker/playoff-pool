import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

type Conference = "AFC" | "NFC";
type Pos = "QB" | "RB" | "WR" | "TE";
type SlotBase = "QB" | "RB" | "WR" | "TE" | "FLEX1" | "FLEX2" | "SFLEX";
type SlotId = `${Conference}_${SlotBase}`;

type Player = {
  player_id: string;
  player_name: string;
  pos: Pos;
  team_id: string;
  team_abbr: string | null;
  conference: Conference | null;
};

type Payload = {
  poolId: string;
  entrantName: string;
  selections: Record<string, Player | null>; // keys should be SlotId
};

const SLOTS: Array<{ id: SlotId; conf: Conference; allowed: Pos[] }> = [
  { id: "AFC_QB", conf: "AFC", allowed: ["QB"] },
  { id: "AFC_RB", conf: "AFC", allowed: ["RB"] },
  { id: "AFC_WR", conf: "AFC", allowed: ["WR"] },
  { id: "AFC_TE", conf: "AFC", allowed: ["TE"] },
  { id: "AFC_FLEX1", conf: "AFC", allowed: ["RB", "WR", "TE"] },
  { id: "AFC_FLEX2", conf: "AFC", allowed: ["RB", "WR", "TE"] },
  { id: "AFC_SFLEX", conf: "AFC", allowed: ["QB", "RB", "WR", "TE"] },

  { id: "NFC_QB", conf: "NFC", allowed: ["QB"] },
  { id: "NFC_RB", conf: "NFC", allowed: ["RB"] },
  { id: "NFC_WR", conf: "NFC", allowed: ["WR"] },
  { id: "NFC_TE", conf: "NFC", allowed: ["TE"] },
  { id: "NFC_FLEX1", conf: "NFC", allowed: ["RB", "WR", "TE"] },
  { id: "NFC_FLEX2", conf: "NFC", allowed: ["RB", "WR", "TE"] },
  { id: "NFC_SFLEX", conf: "NFC", allowed: ["QB", "RB", "WR", "TE"] },
];

// Optional: set a lock deadline (server-side enforcement)
// If you don’t want it yet, leave as null.
const ROSTER_LOCK_AT: Date | null = null; // new Date("2026-01-10T18:30:00Z");

function normalizeName(name: string) {
  return name.trim().replace(/\s+/g, " ");
}

function validate(payload: Payload) {
  const errors: string[] = [];

  if (!payload.poolId?.trim()) errors.push("Missing poolId.");
  const entrantName = normalizeName(payload.entrantName ?? "");
  if (!entrantName) errors.push("Enter your name.");

  if (ROSTER_LOCK_AT && Date.now() > ROSTER_LOCK_AT.getTime()) {
    errors.push("Roster is locked (deadline passed).");
  }

  const sel = payload.selections ?? {};
  const used = new Set<string>();

  for (const slot of SLOTS) {
    const p = sel[slot.id] as Player | null | undefined;
    if (!p) {
      errors.push(`Missing selection for ${slot.id}.`);
      continue;
    }

    if (!p.player_id) errors.push(`Invalid player for ${slot.id}.`);
    if (!slot.allowed.includes(p.pos)) errors.push(`Invalid position in ${slot.id}.`);

    // Conference check (only if present on player; you said you fixed conference in Supabase)
    if (p.conference && p.conference !== slot.conf) {
      errors.push(`Wrong conference in ${slot.id}.`);
    }

    // Duplicates
    if (p.player_id) {
      if (used.has(p.player_id)) errors.push(`Duplicate player selected: ${p.player_name}.`);
      used.add(p.player_id);
    }
  }

  return { ok: errors.length === 0, errors, entrantName };
}

export async function POST(req: Request) {
  let body: Payload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { ok, errors, entrantName } = validate(body);
  if (!ok) {
    return NextResponse.json({ error: "Validation failed.", errors }, { status: 400 });
  }

  // Save minimal roster payload (server-trusted)
  // You can store full player objects; this keeps it simple now.
  const roster = body.selections;

  const { error } = await supabaseAdmin
    .from("pool_entries")
    .upsert(
      {
        pool_id: body.poolId,
        entrant_name: entrantName,
        roster,
      },
      { onConflict: "pool_id,entrant_name" }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    poolId: body.poolId,
    entrantName,
  });
}

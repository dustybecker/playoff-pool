import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const poolId = url.searchParams.get("pool_id") || process.env.POOL_ID || "2026-playoffs";

  const { data, error } = await supabaseAdmin
    .from("pool_entries")
    .select("entrant_name, roster, submitted_at, updated_at")
    .eq("pool_id", poolId)
    .order("entrant_name", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, poolId, entries: data ?? [] });
}

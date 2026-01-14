"use client";

import { useEffect, useMemo, useState } from "react";

type RosterSlot = null | {
  player_id?: string;
  player_name?: string;
  playerName?: string; // fallback
};

type Entry = {
  entrant_name: string;
  roster: Record<string, RosterSlot>;
  submitted_at: string | null;
  updated_at: string | null;
};

const SLOT_ORDER: string[] = [
  "AFC_QB",
  "AFC_RB",
  "AFC_WR",
  "AFC_TE",
  "AFC_FLEX1",
  "AFC_FLEX2",
  "AFC_SFLEX",
  "AFC_BENCH1",
  "AFC_BENCH2",
  "NFC_QB",
  "NFC_RB",
  "NFC_WR",
  "NFC_TE",
  "NFC_FLEX1",
  "NFC_FLEX2",
  "NFC_SFLEX",
  "NFC_BENCH1",
  "NFC_BENCH2",

];

function slotShort(slotId: string) {
  // AFC_QB -> A-QB, NFC_FLEX1 -> N-F1, NFC_SFLEX -> N-SF, AFC_BENCH -> A-B
  const [conf, base] = slotId.split("_");
  const c = conf === "AFC" ? "A" : "N";
  if (base === "FLEX1") return `${c}-F1`;
  if (base === "FLEX2") return `${c}-F2`;
  if (base === "SFLEX") return `${c}-SF`;
  if (base === "BENCH") return `${c}-B`;
  return `${c}-${base}`;
}

function getPlayerName(v: RosterSlot) {
  if (!v) return "";
  return v.player_name ?? v.playerName ?? "";
}

export default function AllRostersPage() {
  const poolId = process.env.NEXT_PUBLIC_POOL_ID || "2026-playoffs";

  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/rosters?pool_id=${encodeURIComponent(poolId)}`);
        const text = await res.text();

        let json: any;
        try {
          json = JSON.parse(text);
        } catch {
          throw new Error(`Rosters API did not return JSON. First 200 chars:\n${text.slice(0, 200)}`);
        }

        if (!res.ok) throw new Error(json?.error || "Failed to load rosters");
        if (!cancelled) setEntries(json.entries || []);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [poolId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...entries].sort((a, b) => a.entrant_name.localeCompare(b.entrant_name));
    if (!q) return sorted;
    return sorted.filter((e) => e.entrant_name.toLowerCase().includes(q));
  }, [entries, query]);

  return (
    <main className="pb-24">
      <div className="mb-4">
        <h1 className="text-xl font-semibold">All Rosters</h1>
        <p className="mt-1 text-sm text-muted">
          One table view of all submitted rosters.
        </p>
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search name…"
        className="mb-4 w-full rounded-lg border border-border bg-bg px-3 py-3 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
      />

      {loading && (
        <div className="rounded-lg border border-border bg-surface p-4 text-sm text-muted">
          Loading…
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-danger/40 bg-surface p-4 text-sm text-danger">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="rounded-lg border border-border bg-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full text-sm">
              <thead className="bg-bg/40">
                <tr className="border-b border-border">
                  <th className="p-3 text-left text-xs font-semibold text-muted">Entrant</th>
                  {SLOT_ORDER.map((s) => (
                    <th key={s} className="p-3 text-left text-xs font-semibold text-muted">
                      {slotShort(s)}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td className="p-4 text-sm text-muted" colSpan={1 + SLOT_ORDER.length}>
                      No matching rosters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((e) => (
                    <tr key={e.entrant_name} className="border-b border-border last:border-b-0">
                      <td className="p-3 font-semibold">{e.entrant_name}</td>
                      {SLOT_ORDER.map((slotId) => {
                        const v = (e.roster || {})[slotId] ?? null;
                        const name = getPlayerName(v);
                        return (
                          <td key={slotId} className="p-3">
                            {name ? (
                              <span className="text-text">{name}</span>
                            ) : (
                              <span className="text-muted">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="mt-3 text-xs text-muted">
        Tip: On mobile, swipe horizontally to view all positions.
      </p>
    </main>
  );
}

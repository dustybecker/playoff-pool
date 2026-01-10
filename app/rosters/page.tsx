"use client";

import { useEffect, useMemo, useState } from "react";

type RosterSlot = null | {
  player_id?: string;
  player_name?: string;
  playerName?: string; // fallback if you used a different key earlier
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
  "NFC_BENCH2"
];

function slotLabel(slotId: string) {
  const [conf, base] = slotId.split("_");
  const prettyBase =
    base === "SFLEX"
      ? "SuperFlex"
      : base === "FLEX1"
      ? "Flex 1"
      : base === "FLEX2"
      ? "Flex 2"
      : base === "BENCH1"
      ? "Bench 1"
      : base === "BENCH2"
      ? "Bench 2"
      : base;
  return `${conf} ${prettyBase}`;
}

function getPlayerName(v: RosterSlot) {
  if (!v) return null;
  return v.player_name ?? v.playerName ?? null;
}

export default function RostersPage() {
  const poolId = process.env.NEXT_PUBLIC_POOL_ID || "2026-playoffs";

  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openName, setOpenName] = useState<string | null>(null);

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

  const sorted = useMemo(() => {
    return [...entries].sort((a, b) => a.entrant_name.localeCompare(b.entrant_name));
  }, [entries]);

  return (
    <main className="pb-24">
<div className="mb-4 flex items-start justify-between gap-3">
  <div>
    <h1 className="text-xl font-semibold">Rosters</h1>
    <p className="mt-1 text-sm text-muted">
      Showing {entries.length} submitted rosters.
    </p>
  </div>

  <a
    href="/rosters/all"
    className="rounded-lg border border-border bg-bg px-3 py-2 text-sm font-semibold text-text hover:bg-border/40"
  >
    View All
  </a>
</div>


      {loading && (
        <div className="rounded-lg border border-border bg-surface p-4 text-sm text-muted">
          Loading rosters…
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-danger/40 bg-surface p-4 text-sm text-danger">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="grid gap-3">
          {sorted.map((e) => {
            const isOpen = openName === e.entrant_name;
            const filledCount = Object.values(e.roster || {}).filter((v) => !!getPlayerName(v)).length;

            return (
              <div key={e.entrant_name} className="overflow-hidden rounded-lg border border-border bg-surface">
                <button
                  className="w-full p-4 text-left"
                  onClick={() => setOpenName(isOpen ? null : e.entrant_name)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold">{e.entrant_name}</div>
                      <div className="mt-1 text-xs text-muted">
                        Updated: {e.updated_at ? new Date(e.updated_at).toLocaleString() : "—"}
                        <span className="mx-2">•</span>
                        Filled: {filledCount}/18
                      </div>
                    </div>
                    <div className="text-xs font-semibold text-muted">{isOpen ? "Hide" : "View"}</div>
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-border p-4">
                    <div className="grid gap-2">
                      {SLOT_ORDER.map((slotId) => {
                        const v = (e.roster || {})[slotId] ?? null;
                        const name = getPlayerName(v);

                        return (
                          <div
                            key={slotId}
                            className="flex items-center justify-between rounded-md border border-border/70 bg-bg/40 px-3 py-2"
                          >
                            <div className="text-xs font-semibold text-muted">{slotLabel(slotId)}</div>
                            <div className={["text-sm", name ? "text-text font-semibold" : "text-danger"].join(" ")}>
                              {name ?? "Missing"}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {sorted.length === 0 && (
            <div className="rounded-lg border border-border bg-surface p-4 text-sm text-muted">
              No rosters submitted yet.
            </div>
          )}
        </div>
      )}
    </main>
  );
}

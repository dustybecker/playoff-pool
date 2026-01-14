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
  "NFC_BENCH2",
];

const AFC_BENCH = ["AFC_BENCH1", "AFC_BENCH2"] as const;
const NFC_BENCH = ["NFC_BENCH1", "NFC_BENCH2"] as const;

const AFC_ACTIVE = SLOT_ORDER.filter((s) => s.startsWith("AFC_") && !AFC_BENCH.includes(s as any));
const NFC_ACTIVE = SLOT_ORDER.filter((s) => s.startsWith("NFC_") && !NFC_BENCH.includes(s as any));

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

type Roster = Record<string, RosterSlot>;

function swapSlots(roster: Roster, a: string, b: string): Roster {
  const next: Roster = { ...roster };
  const tmp = next[a] ?? null;
  next[a] = next[b] ?? null;
  next[b] = tmp;
  return next;
}

/**
 * No validation beyond conference-safe swapping.
 * - If you click Move on an AFC active slot => destinations are AFC_BENCH1/2
 * - If you click Move on an AFC bench slot => destinations are all AFC active slots
 * Same for NFC.
 */
function getDestinations(slotId: string): string[] {
  if (slotId.startsWith("AFC_")) {
    if (AFC_BENCH.includes(slotId as any)) return [...AFC_ACTIVE];
    return [...AFC_BENCH];
  }
  if (slotId.startsWith("NFC_")) {
    if (NFC_BENCH.includes(slotId as any)) return [...NFC_ACTIVE];
    return [...NFC_BENCH];
  }
  return [];
}

/**
 * Ensure all expected keys exist. (Keeps your roster JSON shape stable.)
 */
function normalizeRoster(roster: Roster): Roster {
  const next: Roster = { ...roster };
  for (const k of SLOT_ORDER) {
    if (!(k in next)) next[k] = null;
  }
  return next;
}

export default function RostersPage() {
  const poolId = process.env.NEXT_PUBLIC_POOL_ID || "2026-playoffs";

  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [openName, setOpenName] = useState<string | null>(null);

  // Editing state
  const [editingName, setEditingName] = useState<string | null>(null);
  const [draftByName, setDraftByName] = useState<Record<string, Roster>>({});
  const [savingName, setSavingName] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function reload() {
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
      setEntries(json.entries || []);
    } catch (e: any) {
      setError(e?.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (cancelled) return;
      await reload();
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolId]);

  const sorted = useMemo(() => {
    return [...entries].sort((a, b) => a.entrant_name.localeCompare(b.entrant_name));
  }, [entries]);

  function beginEdit(entry: Entry) {
    setActionError(null);
    setEditingName(entry.entrant_name);
    setDraftByName((prev) => ({
      ...prev,
      [entry.entrant_name]: normalizeRoster(entry.roster || {}),
    }));
  }

  function cancelEdit(name: string) {
    setActionError(null);
    setEditingName(null);
    setDraftByName((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }

  function applySwap(name: string, fromSlotId: string, toSlotId: string) {
    setDraftByName((prev) => {
      const current = prev[name] ?? {};
      const nextRoster = swapSlots(current, fromSlotId, toSlotId);
      return { ...prev, [name]: nextRoster };
    });
  }

  async function saveEdit(name: string) {
    setActionError(null);
    const roster = draftByName[name];
    if (!roster) return;

    setSavingName(name);
    try {
      const res = await fetch("/api/edit-roster", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    pool_id: poolId,
    entrant_name: name,
    roster: normalizeRoster(roster),
  }),
});


      const text = await res.text();
      let json: any;
      try {
        json = JSON.parse(text);
      } catch {
        throw new Error(`Submit API did not return JSON. First 200 chars:\n${text.slice(0, 200)}`);
      }
      if (!res.ok) throw new Error(json?.error || "Failed to save roster");

      // Refresh from server so the UI reflects canonical state
      await reload();

      setEditingName(null);
      setDraftByName((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    } catch (e: any) {
      setActionError(e?.message || "Failed to save roster");
    } finally {
      setSavingName(null);
    }
  }

  return (
    <main className="pb-24">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Rosters</h1>
          <p className="mt-1 text-sm text-muted">Showing {entries.length} submitted rosters.</p>
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
        <div className="rounded-lg border border-danger/40 bg-surface p-4 text-sm text-danger">{error}</div>
      )}

      {actionError && (
        <div className="mb-3 rounded-lg border border-danger/40 bg-surface p-4 text-sm text-danger">
          {actionError}
        </div>
      )}

      {!loading && !error && (
        <div className="grid gap-3">
          {sorted.map((e) => {
            const isOpen = openName === e.entrant_name;
            const isEditing = editingName === e.entrant_name;
            const rosterToRender = isEditing ? draftByName[e.entrant_name] ?? e.roster : e.roster;

            const filledCount = Object.values(rosterToRender || {}).filter((v) => !!getPlayerName(v)).length;

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
                    {/* Edit controls */}
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <div className="text-sm font-semibold">{isEditing ? "Editing roster" : "Roster"}</div>

                      {!isEditing ? (
                        <button
                          className="rounded-lg border border-border bg-bg px-3 py-2 text-xs font-semibold text-text hover:bg-border/40"
                          onClick={() => beginEdit(e)}
                        >
                          Edit
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            className="rounded-lg border border-border bg-bg px-3 py-2 text-xs font-semibold text-text hover:bg-border/40"
                            onClick={() => cancelEdit(e.entrant_name)}
                            disabled={savingName === e.entrant_name}
                          >
                            Cancel
                          </button>
                          <button
                            className="rounded-lg border border-border bg-bg px-3 py-2 text-xs font-semibold text-text hover:bg-border/40"
                            onClick={() => saveEdit(e.entrant_name)}
                            disabled={savingName === e.entrant_name}
                          >
                            {savingName === e.entrant_name ? "Saving…" : "Save"}
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="grid gap-2">
                      {SLOT_ORDER.map((slotId) => {
                        const v = (rosterToRender || {})[slotId] ?? null;
                        const name = getPlayerName(v);

                        const destinations = isEditing ? getDestinations(slotId) : [];
                        const showMove = isEditing && destinations.length > 0;

                        return (
                          <div
                            key={slotId}
                            className="flex items-center justify-between gap-3 rounded-md border border-border/70 bg-bg/40 px-3 py-2"
                          >
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-muted">{slotLabel(slotId)}</div>
                              <div
                                className={[
                                  "mt-1 text-sm",
                                  name ? "text-text font-semibold" : "text-danger",
                                ].join(" ")}
                              >
                                {name ?? "Missing"}
                              </div>
                            </div>

                            {showMove ? (
                              <div className="flex shrink-0 items-center gap-2">
                                <div className="text-[11px] font-semibold text-muted">Swap with</div>
                                <select
                                  className="rounded-md border border-border bg-bg px-2 py-1 text-xs text-text"
                                  defaultValue=""
                                  onChange={(ev) => {
                                    const toSlot = ev.target.value;
                                    if (!toSlot) return;
                                    applySwap(e.entrant_name, slotId, toSlot);
                                    ev.currentTarget.value = "";
                                  }}
                                >
                                  <option value="">Select…</option>
                                  {destinations.map((d) => (
                                    <option key={d} value={d}>
                                      {slotLabel(d)}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>

                    {isEditing && (
                      <div className="mt-3 text-xs text-muted">
                        Tip: “Swap with” moves the player in this slot into the destination slot, and moves the
                        destination player back into this slot (including bench).
                      </div>
                    )}
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

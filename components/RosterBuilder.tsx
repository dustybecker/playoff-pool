"use client";

import { useEffect, useMemo, useState } from "react";

type Filter = "ALL" | "AFC" | "NFC";
type Conference = "AFC" | "NFC";
type Pos = "QB" | "RB" | "WR" | "TE";

type Team = {
  team_id: string;
  team_name: string;
  team_abbr: string | null;
  conference: Conference | null;
  division: string | null;
  is_playoff?: boolean | null;
};

type Player = {
  player_id: string;
  player_name: string;
  pos: Pos;
  team_id: string;
  team_abbr: string | null;
  conference: Conference | null;
};

type SlotBase = "QB" | "RB" | "WR" | "TE" | "FLEX1" | "FLEX2" | "SFLEX";
type SlotId = `${Conference}_${SlotBase}`;

type SlotDef = {
  id: SlotId;
  conference: Conference;
  label: string;
  allowed: Pos[];
};

const SLOTS: SlotDef[] = [
  { id: "AFC_QB", conference: "AFC", label: "QB", allowed: ["QB"] },
  { id: "AFC_RB", conference: "AFC", label: "RB", allowed: ["RB"] },
  { id: "AFC_WR", conference: "AFC", label: "WR", allowed: ["WR"] },
  { id: "AFC_TE", conference: "AFC", label: "TE", allowed: ["TE"] },
  { id: "AFC_FLEX1", conference: "AFC", label: "FLEX", allowed: ["RB", "WR", "TE"] },
  { id: "AFC_FLEX2", conference: "AFC", label: "FLEX", allowed: ["RB", "WR", "TE"] },
  { id: "AFC_SFLEX", conference: "AFC", label: "SUPERFLEX", allowed: ["QB", "RB", "WR", "TE"] },

  { id: "NFC_QB", conference: "NFC", label: "QB", allowed: ["QB"] },
  { id: "NFC_RB", conference: "NFC", label: "RB", allowed: ["RB"] },
  { id: "NFC_WR", conference: "NFC", label: "WR", allowed: ["WR"] },
  { id: "NFC_TE", conference: "NFC", label: "TE", allowed: ["TE"] },
  { id: "NFC_FLEX1", conference: "NFC", label: "FLEX", allowed: ["RB", "WR", "TE"] },
  { id: "NFC_FLEX2", conference: "NFC", label: "FLEX", allowed: ["RB", "WR", "TE"] },
  { id: "NFC_SFLEX", conference: "NFC", label: "SUPERFLEX", allowed: ["QB", "RB", "WR", "TE"] },
];

type SlotSelections = Record<SlotId, Player | null>;

function createInitialSelections(): SlotSelections {
  const init = {} as SlotSelections;
  for (const s of SLOTS) init[s.id] = null;
  return init;
}

function pillClass(active: boolean) {
  return [
    "rounded-full border px-3 py-1 text-xs font-semibold",
    active ? "border-accent text-text" : "border-border text-muted",
  ].join(" ");
}

function slotTitle(slot: SlotDef) {
  // Make FLEX labels clearer in the grid
  if (slot.id.endsWith("FLEX1")) return "FLEX 1";
  if (slot.id.endsWith("FLEX2")) return "FLEX 2";
  if (slot.id.endsWith("SFLEX")) return "SUPERFLEX";
  return slot.label;
}

export default function RosterBuilder() {
  const poolId = "2026-playoffs";

  const [filter, setFilter] = useState<Filter>("ALL");

  const [teams, setTeams] = useState<Team[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [teamsError, setTeamsError] = useState<string | null>(null);

  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [playersLoading, setPlayersLoading] = useState(true);
  const [playersError, setPlayersError] = useState<string | null>(null);

  const [selections, setSelections] = useState<SlotSelections>(() => createInitialSelections());
  const [locked, setLocked] = useState(false);
  const [lockedAt, setLockedAt] = useState<string | null>(null);

  // Modal state
  const [selectedSlotId, setSelectedSlotId] = useState<SlotId | null>(null);
  const [selectedTeamIdInModal, setSelectedTeamIdInModal] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  // Roster Submission

const [entrantName, setEntrantName] = useState("");
const [submitStatus, setSubmitStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
const [submitMessage, setSubmitMessage] = useState<string | null>(null);


  // Load teams once
  useEffect(() => {
    let cancelled = false;

    async function loadTeams() {
      setTeamsLoading(true);
      setTeamsError(null);

      try {
        const res = await fetch(`/api/teams?pool_id=${encodeURIComponent(poolId)}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error ?? "Failed to load teams");

        if (!cancelled) setTeams(json.teams ?? []);
      } catch (e: any) {
        if (!cancelled) setTeamsError(e?.message ?? "Failed to load teams");
      } finally {
        if (!cancelled) setTeamsLoading(false);
      }
    }

    loadTeams();
    return () => {
      cancelled = true;
    };
  }, [poolId]);

  // Load all players once (simple and reliable; optimize later if desired)
  useEffect(() => {
    let cancelled = false;

    async function loadPlayers() {
      setPlayersLoading(true);
      setPlayersError(null);

      try {
        const res = await fetch(`/api/players?pool_id=${encodeURIComponent(poolId)}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error ?? "Failed to load players");

        if (!cancelled) setAllPlayers(json.players ?? []);
      } catch (e: any) {
        if (!cancelled) setPlayersError(e?.message ?? "Failed to load players");
      } finally {
        if (!cancelled) setPlayersLoading(false);
      }
    }

    loadPlayers();
    return () => {
      cancelled = true;
    };
  }, [poolId]);

  const filledCount = useMemo(() => Object.values(selections).filter(Boolean).length, [selections]);
  const totalSlots = SLOTS.length;

  const canReview = filledCount > 0;
  const canLock = filledCount === totalSlots && !locked;
  const canSubmit = filledCount === totalSlots && !playersLoading && !teamsLoading;


  const usedPlayerIds = useMemo(() => {
    const ids = new Set<string>();
    for (const p of Object.values(selections)) {
      if (p?.player_id) ids.add(p.player_id);
    }
    return ids;
  }, [selections]);

  const slotsAFC = useMemo(() => SLOTS.filter((s) => s.conference === "AFC"), []);
  const slotsNFC = useMemo(() => SLOTS.filter((s) => s.conference === "NFC"), []);

  const openSlot = (slotId: SlotId) => {
    if (locked) return;
    setSelectedSlotId(slotId);
    setQuery("");

    // If a player is already selected in this slot, default the team dropdown to that player's team
    const existing = selections[slotId];
    setSelectedTeamIdInModal(existing?.team_id ?? null);
  };

  const closeModal = () => {
    setSelectedSlotId(null);
    setSelectedTeamIdInModal(null);
    setQuery("");
  };

  const clearSlot = (slotId: SlotId) => {
    if (locked) return;
    setSelections((prev) => ({ ...prev, [slotId]: null }));
  };

  const lockRoster = () => {
    if (!canLock) return;
    const now = new Date().toISOString();
    setLocked(true);
    setLockedAt(now);
  };

  const reviewText = locked ? "Roster Locked" : "Review Roster";

  const selectedSlot = useMemo(() => {
    if (!selectedSlotId) return null;
    return SLOTS.find((s) => s.id === selectedSlotId) ?? null;
  }, [selectedSlotId]);

  const playoffTeamsByConference = useMemo(() => {
    const afc = teams.filter((t) => t.conference === "AFC");
    const nfc = teams.filter((t) => t.conference === "NFC");
    return { afc, nfc };
  }, [teams]);

  const modalTeams = useMemo(() => {
    if (!selectedSlot) return [];
    const base = selectedSlot.conference === "AFC" ? playoffTeamsByConference.afc : playoffTeamsByConference.nfc;

    // If filter is set to ALL we still only show conference-appropriate teams in the modal.
    return base;
  }, [selectedSlot, playoffTeamsByConference]);

  const modalPlayers = useMemo(() => {
    if (!selectedSlot || !selectedTeamIdInModal) return [];

    const allowed = new Set<Pos>(selectedSlot.allowed);

    return allPlayers
      .filter((p) => p.team_id === selectedTeamIdInModal)
      .filter((p) => allowed.has(p.pos))
      .filter((p) => {
        // No duplicates across slots unless it's already in THIS slot
        const current = selections[selectedSlot.id];
        const isAlreadyInThisSlot = current?.player_id === p.player_id;
        if (isAlreadyInThisSlot) return true;
        return !usedPlayerIds.has(p.player_id);
      })
      .filter((p) => {
        if (!query.trim()) return true;
        const q = query.toLowerCase();
        return p.player_name.toLowerCase().includes(q) || p.pos.toLowerCase().includes(q);
      })
      .sort((a, b) => a.player_name.localeCompare(b.player_name));
  }, [allPlayers, query, selections, selectedSlot, selectedTeamIdInModal, usedPlayerIds]);

  const pickPlayerForSlot = (p: Player) => {
    if (!selectedSlot || locked) return;

    // Defensive checks (should already be filtered)
    if (p.conference && p.conference !== selectedSlot.conference) return;
    if (!selectedSlot.allowed.includes(p.pos)) return;

    // Prevent duplicates
    const current = selections[selectedSlot.id];
    const alreadyUsed = usedPlayerIds.has(p.player_id);
    const isSameAsCurrent = current?.player_id === p.player_id;
    if (alreadyUsed && !isSameAsCurrent) return;

    setSelections((prev) => ({ ...prev, [selectedSlot.id]: p }));
    closeModal();
  };

  const visibleSlots = useMemo(() => {
    if (filter === "ALL") return { afc: slotsAFC, nfc: slotsNFC };
    if (filter === "AFC") return { afc: slotsAFC, nfc: [] as SlotDef[] };
    return { afc: [] as SlotDef[], nfc: slotsNFC };
  }, [filter, slotsAFC, slotsNFC]);

  const SlotCard = ({ slot }: { slot: SlotDef }) => {
    const p = selections[slot.id];
    const isFilled = !!p;

    return (
      <button
        disabled={locked}
        onClick={() => openSlot(slot.id)}
        className={[
          "w-full rounded-lg border border-border bg-surface p-4 text-left",
          "flex items-center justify-between",
          locked ? "opacity-70" : "hover:border-accent/60",
        ].join(" ")}
      >
        <div>
          <div className="text-xs font-semibold text-muted">{slot.conference}</div>
          <div className="text-sm font-semibold">{slotTitle(slot)}</div>

          {isFilled ? (
            <div className="mt-2 text-sm">
              <span className="font-semibold">{p!.player_name}</span>{" "}
              <span className="text-muted">
                ({p!.pos} • {p!.team_abbr ?? p!.team_id})
              </span>
            </div>
          ) : (
            <div className="mt-2 text-sm text-muted">
              Choose {slot.allowed.join("/")} →
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isFilled && !locked && (
            <button
              type="button"
              className="rounded-md border border-border px-2 py-1 text-xs font-semibold text-muted hover:text-text"
              onClick={(e) => {
                e.stopPropagation();
                clearSlot(slot.id);
              }}
            >
              Clear
            </button>
          )}
          <div className="text-xs text-muted">{isFilled ? "✓" : "•"}</div>
        </div>
      </button>
    );
  };

  return (
    <main className="pb-24">
      <div className="mb-4">
        <h1 className="text-xl font-semibold">Roster</h1>
        <p className="mt-1 text-sm text-muted">
          Build your roster by slot. Each conference requires: QB, RB, WR, TE, 2 FLEX, 1 SUPERFLEX.
        </p>
      </div>

      {/* Progress */}
      <div className="mb-4 rounded-lg border border-border bg-surface p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted">Slots filled</div>
          <div className="text-sm font-semibold">
            {filledCount} / {totalSlots}
          </div>
        </div>
        <div className="mt-3 h-2 w-full rounded-full bg-border">
          <div
            className="h-2 rounded-full bg-accent"
            style={{
              width: `${Math.round((filledCount / totalSlots) * 100)}%`,
            }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex items-center gap-2">
        <button className={pillClass(filter === "ALL")} onClick={() => setFilter("ALL")}>
          ALL
        </button>
        <button className={pillClass(filter === "AFC")} onClick={() => setFilter("AFC")}>
          AFC
        </button>
        <button className={pillClass(filter === "NFC")} onClick={() => setFilter("NFC")}>
          NFC
        </button>

        <div className="ml-auto text-xs text-muted">{locked ? "Locked" : "Editable"}</div>
      </div>

      {/* Loading / Errors */}
      {(teamsLoading || playersLoading) && (
        <div className="mb-4 rounded-lg border border-border bg-surface p-4 text-sm text-muted">
          Loading {teamsLoading ? "teams" : "players"}...
        </div>
      )}
      {teamsError && (
        <div className="mb-4 rounded-lg border border-danger/40 bg-surface p-4 text-sm text-danger">
          {teamsError}
        </div>
      )}
      {playersError && (
        <div className="mb-4 rounded-lg border border-danger/40 bg-surface p-4 text-sm text-danger">
          {playersError}
        </div>
      )}

      {/* Slot grid */}
      <div className="grid gap-3">
        {visibleSlots.afc.length > 0 && (
          <div className="mt-2">
            <h2 className="mb-2 text-sm font-semibold text-muted">AFC</h2>
            <div className="grid gap-3">
              {visibleSlots.afc.map((slot) => (
                <SlotCard key={slot.id} slot={slot} />
              ))}
            </div>
          </div>
        )}

        {visibleSlots.nfc.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-2 text-sm font-semibold text-muted">NFC</h2>
            <div className="grid gap-3">
              {visibleSlots.nfc.map((slot) => (
                <SlotCard key={slot.id} slot={slot} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom action bar */}
      <div className="fixed bottom-16 left-0 right-0 z-40 px-4">
        <div className="mx-auto max-w-md rounded-xl border border-border bg-surface/95 p-3 backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <span className="text-muted">Filled: </span>
              <span className="font-semibold">
                {filledCount} / {totalSlots}
              </span>
            </div>

            <button
              disabled={!canReview}
              className={[
                "rounded-lg px-4 py-2 text-sm font-semibold",
                canReview ? "bg-border text-text" : "bg-border/60 text-muted",
              ].join(" ")}
              onClick={() => {
                const el = document.getElementById("review");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              {reviewText}
            </button>
          </div>

          <button
            disabled={!canLock}
            onClick={lockRoster}
            className={[
              "mt-3 w-full rounded-lg py-3 text-sm font-semibold",
              canLock ? "bg-accent text-black" : "bg-border/60 text-muted",
            ].join(" ")}
          >
            Lock Roster
          </button>
        </div>
      </div>

      {/* Submit */}
<div className="mt-8 rounded-lg border border-border bg-surface p-4">
  <h2 className="text-sm font-semibold text-muted">Submit</h2>
  <p className="mt-1 text-sm text-muted">
    Enter your name and submit your roster. Resubmitting with the same name will overwrite your prior entry.
  </p>

  <input
    value={entrantName}
    onChange={(e) => {
      setEntrantName(e.target.value);
      setSubmitStatus("idle");
      setSubmitMessage(null);
    }}
    placeholder="Your name"
    className="mt-3 w-full rounded-lg border border-border bg-bg px-3 py-3 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
  />

  <button
    disabled={!canSubmit || submitStatus === "submitting" || !entrantName.trim()}
    className={[
      "mt-3 w-full rounded-lg py-3 text-sm font-semibold",
      !canSubmit || !entrantName.trim() || submitStatus === "submitting"
        ? "bg-border/60 text-muted"
        : "bg-accent text-black",
    ].join(" ")}
    onClick={async () => {
      try {
        setSubmitStatus("submitting");
        setSubmitMessage(null);

        const res = await fetch("/api/submit-roster", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            poolId,
            entrantName,
            selections,
          }),
        });

        const json = await res.json();
        if (!res.ok) {
          const msg =
            json?.errors?.length
              ? json.errors.join(" ")
              : json?.error ?? "Submission failed.";
          setSubmitStatus("error");
          setSubmitMessage(msg);
          return;
        }

        setSubmitStatus("success");
        setSubmitMessage(`Submitted as "${json.entrantName}".`);
      } catch (e: any) {
        setSubmitStatus("error");
        setSubmitMessage(e?.message ?? "Submission failed.");
      }
    }}
  >
    {submitStatus === "submitting" ? "Submitting..." : "Submit Roster"}
  </button>

  {submitMessage && (
    <div
      className={[
        "mt-3 rounded-lg border p-3 text-sm",
        submitStatus === "success"
          ? "border-border text-text"
          : "border-danger/40 text-danger",
      ].join(" ")}
    >
      {submitMessage}
    </div>
  )}
</div>


      {/* Review */}
      <div id="review" className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-muted">Review</h2>
            {locked && lockedAt && (
              <div className="mt-1 text-xs text-muted">
                Locked: {new Date(lockedAt).toLocaleString()}
              </div>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          {SLOTS.map((slot) => {
            const p = selections[slot.id];
            return (
              <div
                key={slot.id}
                className="flex items-center justify-between border-b border-border p-3 last:border-b-0"
              >
                <div>
                  <div className="text-sm font-semibold">
                    {slot.conference} {slotTitle(slot)}
                  </div>
                  {p ? (
                    <div className="text-xs text-muted">
                      {p.player_name} ({p.pos} • {p.team_abbr ?? p.team_id})
                    </div>
                  ) : (
                    <div className="text-xs text-danger">Missing selection</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Picker Modal */}
      {selectedSlot && (
        <div className="fixed inset-0 z-50">
          <button
            className="absolute inset-0 bg-black/60"
            onClick={closeModal}
            aria-label="Close picker"
          />

          <div className="absolute bottom-20 left-0 right-0 mx-auto max-w-md rounded-t-2xl border border-border bg-surface p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-muted">Pick for</div>
                <div className="text-lg font-semibold">
                  {selectedSlot.conference} {slotTitle(selectedSlot)}
                </div>
                <div className="mt-1 text-xs text-muted">
                  Allowed: {selectedSlot.allowed.join("/")}
                </div>
              </div>

              <button
                className="rounded-lg border border-border px-3 py-2 text-sm font-semibold text-muted"
                onClick={closeModal}
              >
                Close
              </button>
            </div>

            {/* Team selection */}
            <div className="mt-4">
              <label className="mb-2 block text-xs font-semibold text-muted">
                Team
              </label>
              <select
                value={selectedTeamIdInModal ?? ""}
                onChange={(e) => setSelectedTeamIdInModal(e.target.value || null)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent/50"
              >
                <option value="">Select a team…</option>
                {modalTeams.map((t) => (
                  <option key={t.team_id} value={t.team_id}>
                    {(t.team_abbr ?? t.team_id)} — {t.team_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search player..."
              disabled={!selectedTeamIdInModal}
              className={[
                "mt-4 w-full rounded-lg border border-border bg-bg px-3 py-3 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50",
                !selectedTeamIdInModal ? "opacity-60" : "",
              ].join(" ")}
            />

            {/* Player list */}
            <div className="mt-4 max-h-[55vh] overflow-auto rounded-lg border border-border">
              {!selectedTeamIdInModal && (
                <div className="p-3 text-sm text-muted">Select a team to view eligible players.</div>
              )}

              {selectedTeamIdInModal && playersLoading && (
                <div className="p-3 text-sm text-muted">Loading players...</div>
              )}

              {selectedTeamIdInModal && playersError && (
                <div className="p-3 text-sm text-danger">{playersError}</div>
              )}

              {selectedTeamIdInModal &&
                !playersLoading &&
                !playersError &&
                modalPlayers.map((p) => {
                  const current = selections[selectedSlot.id];
                  const isSelectedHere = current?.player_id === p.player_id;

                  return (
                    <button
                      key={p.player_id}
                      onClick={() => pickPlayerForSlot(p)}
                      className={[
                        "w-full border-b border-border p-3 text-left last:border-b-0",
                        "flex items-center justify-between",
                        isSelectedHere ? "bg-border/40" : "hover:bg-border/20",
                      ].join(" ")}
                    >
                      <div>
                        <div className="text-sm font-semibold">{p.player_name}</div>
                        <div className="text-xs text-muted">
                          {p.pos} • {p.team_abbr ?? p.team_id}
                        </div>
                      </div>
                      {isSelectedHere && (
                        <span className="text-xs font-semibold text-accent">Selected</span>
                      )}
                    </button>
                  );
                })}

              {selectedTeamIdInModal &&
                !playersLoading &&
                !playersError &&
                modalPlayers.length === 0 && (
                  <div className="p-3 text-sm text-muted">
                    No eligible players found (position rules + duplicates apply).
                  </div>
                )}
            </div>

            <p className="mt-3 text-xs text-muted">
              Rules enforced: slot position, conference, and no duplicate players.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}

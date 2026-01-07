"use client";

import { useEffect, useMemo, useState } from "react";
import type { Player, Team } from "../lib/playoffData";
import { playoffTeams, playersByTeam } from "../lib/playoffData";



type Filter = "ALL" | "AFC" | "NFC";

type SelectionMap = Record<string, Player | undefined>; // key = teamId

function pillClass(active: boolean) {
  return [
    "rounded-full border px-3 py-1 text-xs font-semibold",
    active ? "border-accent text-text" : "border-border text-muted",
  ].join(" ");
}

export default function RosterBuilder() {


  const [filter, setFilter] = useState<Filter>("ALL");
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selections, setSelections] = useState<SelectionMap>({});
  const [locked, setLocked] = useState(false);

  const teams: Team[] = useMemo(() => {
    if (filter === "ALL") return playoffTeams;
    return playoffTeams.filter((t) => t.conference === filter);
  }, [filter]);

  const totalTeams = playoffTeams.length;
  const selectedCount = Object.values(selections).filter(Boolean).length;

  const canReview = selectedCount > 0;
  const canLock = selectedCount === totalTeams && !locked;

  const selectedRoster = useMemo(() => {
    return playoffTeams
      .map((t) => ({
        team: t,
        player: selections[t.id],
      }))
      .filter((row) => row.player);
  }, [selections]);

  const teamRow = (team: Team) => {
    const chosen = selections[team.id];
    return (
      <button
        key={team.id}
        disabled={locked}
        onClick={() => setSelectedTeamId(team.id)}
        className={[
          "w-full rounded-lg border border-border bg-surface p-4 text-left",
          "flex items-center justify-between",
          locked ? "opacity-70" : "hover:border-accent/60",
        ].join(" ")}
      >
        <div>
          <div className="text-sm font-semibold">
            {team.id} {team.name}
            <span className="ml-2 text-xs text-muted">{team.conference}</span>
          </div>
          {chosen ? (
            <div className="mt-2 text-sm">
              <span className="text-muted">Selected: </span>
              <span className="font-semibold">{chosen.name}</span>{" "}
              <span className="text-muted">({chosen.pos})</span>
            </div>
          ) : (
            <div className="mt-2 text-sm text-muted">Pick a player →</div>
          )}
        </div>

        <div className="text-xs text-muted">
          {chosen ? "✓" : "•"}
        </div>
      </button>
    );
  };

  const closePicker = () => {
    setSelectedTeamId(null);
    setQuery("");
  };

  const pickPlayer = (p: Player) => {
    if (locked) return;
    setSelections((prev) => ({ ...prev, [p.teamId]: p }));
    closePicker();
  };

  const clearTeam = (teamId: string) => {
    if (locked) return;
    setSelections((prev) => {
      const next = { ...prev };
      delete next[teamId];
      return next;
    });
  };
    const continueRoster = () => {
    if (locked) {
      document.getElementById("review")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      return;
    }

    // Find the first team that does not have a selected player yet
    const nextTeam = playoffTeams.find((t) => !selections[t.id]);

    if (nextTeam) {
      setSelectedTeamId(nextTeam.id); // opens the picker
      return;
    }

    // If all teams are selected, jump to review
    document.getElementById("review")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };


  const lockRoster = () => {
  if (!canLock) return;
  setLocked(true);
};



const reviewText = locked
  ? "View Roster"
  : selectedCount < totalTeams
  ? "Continue"
  : "Review Roster";


  return (
    <main className="pb-24">
      <div className="mb-4">
        <h1 className="text-xl font-semibold">Roster</h1>
        <p className="mt-1 text-sm text-muted">
          Pick one player from each playoff team. Roster locks before kickoff.
        </p>
      </div>

      {/* Progress */}
      <div className="mb-4 rounded-lg border border-border bg-surface p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted">Teams selected</div>
          <div className="text-sm font-semibold">
            {selectedCount} / {totalTeams}
          </div>
        </div>
        <div className="mt-3 h-2 w-full rounded-full bg-border">
          <div
            className="h-2 rounded-full bg-accent"
            style={{
              width: `${Math.round((selectedCount / totalTeams) * 100)}%`,
            }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex items-center gap-2">
        <button
          className={pillClass(filter === "ALL")}
          onClick={() => setFilter("ALL")}
        >
          ALL
        </button>
        <button
          className={pillClass(filter === "AFC")}
          onClick={() => setFilter("AFC")}
        >
          AFC
        </button>
        <button
          className={pillClass(filter === "NFC")}
          onClick={() => setFilter("NFC")}
        >
          NFC
        </button>

        <div className="ml-auto text-xs text-muted">
          {locked ? "Locked" : "Editable"}
        </div>
      </div>

      {/* Team list */}
      <div className="grid gap-3">
        {teams.map(teamRow)}
      </div>

      {/* Bottom action bar */}
      <div className="fixed bottom-16 left-0 right-0 z-40 px-4">
        <div className="mx-auto max-w-md rounded-xl border border-border bg-surface/95 p-3 backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <span className="text-muted">Selected: </span>
              <span className="font-semibold">
                {selectedCount} / {totalTeams}
              </span>
            </div>
<button
  disabled={!canReview}
  className={[
    "rounded-lg px-4 py-2 text-sm font-semibold",
    canReview ? "bg-border text-text" : "bg-border/60 text-muted",
  ].join(" ")}
  onClick={continueRoster}
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

      {/* Review */}
      <div id="review" className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-muted">Review</h2>
          </div>

          {locked && (
            <span className="rounded-full bg-border px-3 py-1 text-xs font-semibold text-text">
              🔒 Locked
            </span>
          )}
        </div>


        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          {playoffTeams.map((t) => {
            const p = selections[t.id];
            const missing = !p;
            return (
              <div
                key={t.id}
                className="flex items-center justify-between border-b border-border p-3 last:border-b-0"
              >
                <div>
                  <div className="text-sm font-semibold">
                    {t.id} {t.name}
                    <span className="ml-2 text-xs text-muted">{t.conference}</span>
                  </div>
                  {p ? (
                    <div className="text-xs text-muted">
                      {p.name} ({p.pos})
                    </div>
                  ) : (
                    <div className="text-xs text-danger">
                      Missing selection
                    </div>
                  )}
                </div>

                {!locked && !missing && (
                  <button
                    className="text-xs font-semibold text-muted hover:text-text"
                    onClick={() => clearTeam(t.id)}
                  >
                    Clear
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Picker Modal */}
      {selectedTeamId && (
        <div className="fixed inset-0 z-50">
          {/* overlay */}
          <button
            className="absolute inset-0 bg-black/60"
            onClick={closePicker}
            aria-label="Close player picker"
          />

          {/* sheet */}
          <div className="absolute bottom-20 left-0 right-0 mx-auto max-w-md rounded-t-2xl border border-border bg-surface p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-muted">Pick a player</div>
                <div className="text-lg font-semibold">
                  {selectedTeamId}{" "}
                  {playoffTeams.find((t) => t.id === selectedTeamId)?.name}
                </div>
              </div>
              <button
                className="rounded-lg border border-border px-3 py-2 text-sm font-semibold text-muted"
                onClick={closePicker}
              >
                Close
              </button>
            </div>

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search player..."
              className="mt-4 w-full rounded-lg border border-border bg-bg px-3 py-3 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
            />

            <div className="mt-4 max-h-[50vh] overflow-y-auto overscroll-contain rounded-lg border border-border">

              {(playersByTeam[selectedTeamId] ?? [])
                .filter((p) => {
                  if (!query.trim()) return true;
                  const q = query.toLowerCase();
                  return (
                    p.name.toLowerCase().includes(q) ||
                    p.pos.toLowerCase().includes(q)
                  );
                })
                .map((p) => {
                  const isSelected = selections[p.teamId]?.id === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => pickPlayer(p)}
                      className={[
                        "w-full border-b border-border p-3 text-left last:border-b-0",
                        "flex items-center justify-between",
                        isSelected ? "bg-border/40" : "hover:bg-border/20",
                      ].join(" ")}
                    >
                      <div>
                        <div className="text-sm font-semibold">{p.name}</div>
                        <div className="text-xs text-muted">{p.pos}</div>
                      </div>
                      {isSelected && (
                        <span className="text-xs font-semibold text-accent">
                          Selected
                        </span>
                      )}
                    </button>
                  );
                })}
            </div>

            <p className="mt-3 text-xs text-muted">
              This is fake data for now. Next step is swapping in your API.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}

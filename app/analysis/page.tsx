const ENTRIES = [
  { entrant: "Chris", player_id: "21", player_name: "Drake Maye", team_abbr: "NE", multiplier: 4 },
  { entrant: "Chris", player_id: "60", player_name: "Hunter Henry", team_abbr: "NE", multiplier: 8 },
  { entrant: "Cody Conners", player_id: "117", player_name: "Austin Hooper", team_abbr: "NE", multiplier: 8 },
  { entrant: "Dusty", player_id: "21", player_name: "Drake Maye", team_abbr: "NE", multiplier: 2 },
  { entrant: "Dusty", player_id: "8", player_name: "TreVeyon Henderson", team_abbr: "NE", multiplier: 8 },
  { entrant: "Mach", player_id: "21", player_name: "Drake Maye", team_abbr: "NE", multiplier: 8 },
  { entrant: "Nate", player_id: "16", player_name: "Stefon Diggs", team_abbr: "NE", multiplier: 8 },
  { entrant: "Vobenomic$", player_id: "21", player_name: "Drake Maye", team_abbr: "NE", multiplier: 8 },
  { entrant: "Chris", player_id: "7", player_name: "Jaxon Smith-Njigba", team_abbr: "SEA", multiplier: 8 },
  { entrant: "Cody Conners", player_id: "7", player_name: "Jaxon Smith-Njigba", team_abbr: "SEA", multiplier: 8 },
  { entrant: "Dusty", player_id: "7", player_name: "Jaxon Smith-Njigba", team_abbr: "SEA", multiplier: 8 },
  { entrant: "Mach", player_id: "7", player_name: "Jaxon Smith-Njigba", team_abbr: "SEA", multiplier: 8 },
  { entrant: "Nate", player_id: "53", player_name: "Sam Darnold", team_abbr: "SEA", multiplier: 8 },
  { entrant: "Nate", player_id: "7", player_name: "Jaxon Smith-Njigba", team_abbr: "SEA", multiplier: 4 },
  { entrant: "Vobenomic$", player_id: "7", player_name: "Jaxon Smith-Njigba", team_abbr: "SEA", multiplier: 8 },
];

const ENTRANT_ORDER = ["Cody Conners", "Chris", "Mach", "Vobenomic$", "Dusty", "Nate"];

type PlayerPick = {
  player_id: string;
  player_name: string;
  team_abbr: string;
  multiplier: number;
};

function uniqueEntrants(entries: typeof ENTRIES) {
  return ENTRANT_ORDER.filter((name) => entries.some((entry) => entry.entrant === name));
}

function buildEntrantMap(entries: typeof ENTRIES) {
  const map = new Map<string, PlayerPick[]>();
  for (const entry of entries) {
    const list = map.get(entry.entrant) ?? [];
    list.push({
      player_id: entry.player_id,
      player_name: entry.player_name,
      team_abbr: entry.team_abbr,
      multiplier: entry.multiplier,
    });
    map.set(entry.entrant, list);
  }
  return map;
}

function buildPlayerCounts(entries: typeof ENTRIES) {
  const counts = new Map<string, number>();
  const seenByEntrant = new Map<string, Set<string>>();

  for (const entry of entries) {
    const seen = seenByEntrant.get(entry.entrant) ?? new Set<string>();
    if (!seen.has(entry.player_id)) {
      counts.set(entry.player_id, (counts.get(entry.player_id) ?? 0) + 1);
      seen.add(entry.player_id);
      seenByEntrant.set(entry.entrant, seen);
    }
  }
  return counts;
}

function overlapCount(a: Set<string>, b: Set<string>) {
  let count = 0;
  for (const id of a) {
    if (b.has(id)) count += 1;
  }
  return count;
}

function buildPlayerMatrix(entries: typeof ENTRIES) {
  const map = new Map<
    string,
    { player_id: string; player_name: string; team_abbr: string; byEntrant: Map<string, number> }
  >();
  for (const entry of entries) {
    const existing = map.get(entry.player_id) ?? {
      player_id: entry.player_id,
      player_name: entry.player_name,
      team_abbr: entry.team_abbr,
      byEntrant: new Map<string, number>(),
    };
    existing.byEntrant.set(entry.entrant, entry.multiplier);
    map.set(entry.player_id, existing);
  }
  return map;
}

function buildTeamExposure(entries: typeof ENTRIES, entrants: string[]) {
  const map = new Map<string, { entrant: string; NE: number; SEA: number }>();
  for (const entrant of entrants) {
    map.set(entrant, { entrant, NE: 0, SEA: 0 });
  }
  for (const entry of entries) {
    const record = map.get(entry.entrant);
    if (!record) continue;
    if (entry.team_abbr === "NE") record.NE += entry.multiplier;
    if (entry.team_abbr === "SEA") record.SEA += entry.multiplier;
  }
  return Array.from(map.values());
}

export default function AnalysisPage() {
  const entrants = uniqueEntrants(ENTRIES);
  const entrantMap = buildEntrantMap(ENTRIES);
  const playerCounts = buildPlayerCounts(ENTRIES);
  const entrantSets = new Map<string, Set<string>>();
  const playerMatrix = buildPlayerMatrix(ENTRIES);

  for (const entrant of entrants) {
    const picks = entrantMap.get(entrant) ?? [];
    entrantSets.set(entrant, new Set(picks.map((pick) => pick.player_id)));
  }

  const uniqueByEntrant = entrants.map((entrant) => {
    const picks = entrantMap.get(entrant) ?? [];
    const uniques = picks.filter((pick) => (playerCounts.get(pick.player_id) ?? 0) === 1);
    return { entrant, uniques };
  });

  const lowOwned = entrants
    .flatMap((entrant) => entrantMap.get(entrant) ?? [])
    .filter((pick, index, all) => {
      if ((playerCounts.get(pick.player_id) ?? 0) !== 2) return false;
      return all.findIndex((item) => item.player_id === pick.player_id) === index;
    });

  const playersSorted = Array.from(playerMatrix.values()).sort((a, b) => {
    const countA = playerCounts.get(a.player_id) ?? 0;
    const countB = playerCounts.get(b.player_id) ?? 0;
    if (countA !== countB) return countB - countA;
    return a.player_name.localeCompare(b.player_name);
  });
  const teamExposure = buildTeamExposure(ENTRIES, entrants);

  return (
    <main className="min-h-screen text-text">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-surface/80 p-5">
        <div className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.25),transparent_70%)]" />
        <div className="pointer-events-none absolute -left-10 -bottom-16 h-40 w-40 rounded-full bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.2),transparent_70%)]" />

        <p className="text-xs uppercase tracking-[0.3em] text-muted">Super Bowl Snapshot</p>
        <h1 className="mt-2 text-3xl font-semibold text-[#F8FAFC] [font-family:'Garamond']">
          Overlap and Leverage
        </h1>
        <p className="mt-2 text-sm text-muted">
          Two teams left. This view highlights multipliers and overlap so you can
          see who needs NE vs SEA to pop.
        </p>
      </div>

      <section className="mt-6 rounded-3xl border border-border bg-surface/80 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#F8FAFC] [font-family:'Garamond']">
            Team Exposure
          </h2>
          <span className="text-xs text-muted">total multiplier by team</span>
        </div>

        <div className="overflow-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="pb-3 pr-4">Entrant</th>
                <th className="pb-3 pr-4 text-right">NE</th>
                <th className="pb-3 pr-4 text-right">SEA</th>
                <th className="pb-3 pr-4 text-right">Edge</th>
              </tr>
            </thead>
            <tbody>
              {teamExposure.map((row) => {
                const edge = row.NE - row.SEA;
                return (
                  <tr key={row.entrant} className="border-t border-border/60">
                    <td className="py-3 pr-4 font-semibold">{row.entrant}</td>
                    <td className="py-3 pr-4 text-right">{row.NE}x</td>
                    <td className="py-3 pr-4 text-right">{row.SEA}x</td>
                    <td className="py-3 pr-4 text-right">
                      <span className="text-xs text-muted">
                        {edge === 0 ? "Even" : edge > 0 ? `+${edge} NE` : `${edge} SEA`}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-surface/80 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#F8FAFC] [font-family:'Garamond']">
            Overlap Heatmap
          </h2>
          <span className="text-xs text-muted">shared player counts</span>
        </div>

        <div className="overflow-auto">
          <table className="w-full min-w-[500px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="pb-3 pr-4">Entrant</th>
                {entrants.map((entrant) => (
                  <th key={entrant} className="pb-3 pr-4 text-right">
                    {entrant.split(" ")[0]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entrants.map((rowEntrant) => {
                const rowSet = entrantSets.get(rowEntrant) ?? new Set<string>();
                return (
                  <tr key={rowEntrant} className="border-t border-border/60">
                    <td className="py-3 pr-4 font-semibold">{rowEntrant}</td>
                    {entrants.map((colEntrant) => {
                      const colSet = entrantSets.get(colEntrant) ?? new Set<string>();
                      const count = overlapCount(rowSet, colSet);
                      return (
                        <td key={`${rowEntrant}-${colEntrant}`} className="py-3 pr-4 text-right">
                          <span className="inline-flex min-w-[1.5rem] items-center justify-center rounded-full bg-border/60 px-2 py-1 text-xs font-semibold">
                            {count}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-surface/80 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#F8FAFC] [font-family:'Garamond']">
            Player Overlap Matrix
          </h2>
          <span className="text-xs text-muted">multiplier by entrant</span>
        </div>

        <div className="overflow-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="pb-3 pr-4">Player</th>
                {entrants.map((entrant) => (
                  <th key={entrant} className="pb-3 pr-4 text-right">
                    {entrant.split(" ")[0]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {playersSorted.map((player) => (
                <tr key={player.player_id} className="border-t border-border/60">
                  <td className="py-3 pr-4 font-semibold">
                    {player.player_name}
                    <span className="ml-2 text-xs text-muted">{player.team_abbr}</span>
                  </td>
                  {entrants.map((entrant) => {
                    const mult = player.byEntrant.get(entrant);
                    return (
                      <td key={`${player.player_id}-${entrant}`} className="py-3 pr-4 text-right">
                        {mult ? (
                          <span className="inline-flex min-w-[2.25rem] items-center justify-center rounded-full bg-border/60 px-2 py-1 text-xs font-semibold">
                            {mult}x
                          </span>
                        ) : (
                          <span className="text-xs text-muted">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-surface/80 p-5">
        <h2 className="text-lg font-semibold text-[#F8FAFC] [font-family:'Garamond']">
          Unique Leverage
        </h2>
        <p className="mt-1 text-xs text-muted">
          Players only owned by a single entrant. These are true swing pieces.
        </p>

        <div className="mt-4 grid gap-3">
          {uniqueByEntrant.map(({ entrant, uniques }) => (
            <div
              key={entrant}
              className="rounded-2xl border border-border/70 bg-bg/50 p-4"
            >
              <div className="text-sm font-semibold">{entrant}</div>
              {uniques.length === 0 ? (
                <div className="mt-2 text-xs text-muted">No unique players.</div>
              ) : (
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  {uniques.map((pick) => (
                    <span
                      key={`${entrant}-${pick.player_id}`}
                      className="rounded-full border border-border/70 bg-surface px-3 py-1 font-semibold"
                    >
                      {pick.player_name} {pick.multiplier}x
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-surface/80 p-5">
        <h2 className="text-lg font-semibold text-[#F8FAFC] [font-family:'Garamond']">
          Low-Owned Watch
        </h2>
        <p className="mt-1 text-xs text-muted">
          Players owned by only two entrants. These are secondary levers.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          {lowOwned.map((pick) => (
            <span
              key={`low-${pick.player_id}`}
              className="rounded-full border border-border/70 bg-bg/60 px-3 py-1 font-semibold"
            >
              {pick.player_name}
            </span>
          ))}
        </div>
      </section>
    </main>
  );
}

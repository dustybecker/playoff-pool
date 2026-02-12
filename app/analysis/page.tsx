diff --git a/C:\Users\dusty\playoff-pool-main\app\analysis\page.tsx b/C:\Users\dusty\playoff-pool-main\app\analysis\page.tsx
new file mode 100644
--- /dev/null
+++ b/C:\Users\dusty\playoff-pool-main\app\analysis\page.tsx
@@ -0,0 +1,193 @@
+"use client";
+
+import { useEffect, useMemo, useState } from "react";
+
+type BreakdownRow = {
+  entrant_name: string;
+  round: number;
+  slot_id: string;
+  player_id: string;
+  player_name: string;
+  pos: string;
+  team_abbr: string | null;
+  points: number;
+};
+
+type RoundGroup = {
+  round: number;
+  rows: BreakdownRow[];
+  total: number;
+};
+
+type EntrantGroup = {
+  entrant_name: string;
+  rounds: RoundGroup[];
+  total: number;
+};
+
+function safePoints(value: number) {
+  return Number.isFinite(value) ? value : 0;
+}
+
+export default function AnalysisPage() {
+  const poolId = process.env.NEXT_PUBLIC_POOL_ID || "2026-playoffs";
+  const [rows, setRows] = useState<BreakdownRow[]>([]);
+  const [loading, setLoading] = useState(true);
+  const [error, setError] = useState<string | null>(null);
+
+  useEffect(() => {
+    let cancelled = false;
+
+    async function load() {
+      setLoading(true);
+      setError(null);
+
+      try {
+        const res = await fetch(
+          `/api/scoring-breakdown?pool_id=${encodeURIComponent(poolId)}`
+        );
+        const text = await res.text();
+
+        let json: any;
+        try {
+          json = JSON.parse(text);
+        } catch {
+          throw new Error(
+            `Scoring breakdown API did not return JSON. First 200 chars:\n${text.slice(
+              0,
+              200
+            )}`
+          );
+        }
+
+        if (!res.ok) throw new Error(json?.error || "Failed to load scoring breakdown");
+        if (!cancelled) setRows(json.rows || []);
+      } catch (e: any) {
+        if (!cancelled) setError(e?.message || "Unknown error");
+      } finally {
+        if (!cancelled) setLoading(false);
+      }
+    }
+
+    load();
+    return () => {
+      cancelled = true;
+    };
+  }, [poolId]);
+
+  const entrants = useMemo<EntrantGroup[]>(() => {
+    const byEntrant = new Map<string, Map<number, BreakdownRow[]>>();
+
+    for (const row of rows) {
+      const rounds = byEntrant.get(row.entrant_name) ?? new Map<number, BreakdownRow[]>();
+      const roundRows = rounds.get(row.round) ?? [];
+      roundRows.push(row);
+      rounds.set(row.round, roundRows);
+      byEntrant.set(row.entrant_name, rounds);
+    }
+
+    const groups: EntrantGroup[] = [];
+    for (const [entrantName, roundsMap] of byEntrant.entries()) {
+      const rounds: RoundGroup[] = Array.from(roundsMap.entries())
+        .sort((a, b) => a[0] - b[0])
+        .map(([round, roundRows]) => {
+          const total = roundRows.reduce((sum, row) => sum + safePoints(row.points), 0);
+          return { round, rows: roundRows, total };
+        });
+
+      const total = rounds.reduce((sum, round) => sum + round.total, 0);
+      groups.push({
+        entrant_name: entrantName,
+        rounds,
+        total,
+      });
+    }
+
+    return groups.sort((a, b) => b.total - a.total);
+  }, [rows]);
+
+  return (
+    <main className="pb-24">
+      <div className="mb-4">
+        <h1 className="text-xl font-semibold">Final Scoring Breakdown</h1>
+        <p className="mt-1 text-sm text-muted">
+          Entrant, round, player, and points from <span className="font-semibold">entry_round_lineups</span>.
+        </p>
+      </div>
+
+      {loading && (
+        <div className="rounded-lg border border-border bg-surface p-4 text-sm text-muted">
+          Loading scoring breakdown...
+        </div>
+      )}
+
+      {error && (
+        <div className="rounded-lg border border-danger/40 bg-surface p-4 text-sm text-danger">
+          {error}
+        </div>
+      )}
+
+      {!loading && !error && entrants.length === 0 && (
+        <div className="rounded-lg border border-border bg-surface p-4 text-sm text-muted">
+          No scoring rows found.
+        </div>
+      )}
+
+      {!loading && !error && entrants.length > 0 && (
+        <div className="space-y-5">
+          {entrants.map((entrant, entrantIndex) => (
+            <section
+              key={entrant.entrant_name}
+              className="overflow-hidden rounded-xl border border-border bg-surface"
+            >
+              <div className="flex items-center justify-between border-b border-border px-4 py-3">
+                <div className="text-sm font-semibold">
+                  {entrantIndex + 1}. {entrant.entrant_name}
+                </div>
+                <div className="text-sm font-semibold">{entrant.total.toFixed(1)}</div>
+              </div>
+
+              <div className="space-y-4 p-3">
+                {entrant.rounds.map((round) => (
+                  <div key={`${entrant.entrant_name}-round-${round.round}`}>
+                    <div className="mb-2 flex items-center justify-between text-xs text-muted">
+                      <span className="font-semibold">Round {round.round}</span>
+                      <span>{round.total.toFixed(1)} pts</span>
+                    </div>
+
+                    <div className="overflow-x-auto rounded-lg border border-border/70">
+                      <table className="w-full min-w-[560px] text-sm">
+                        <thead className="border-b border-border text-xs uppercase tracking-wide text-muted">
+                          <tr>
+                            <th className="px-3 py-2 text-left">Slot</th>
+                            <th className="px-3 py-2 text-left">Player</th>
+                            <th className="px-3 py-2 text-left">Pos</th>
+                            <th className="px-3 py-2 text-left">Team</th>
+                            <th className="px-3 py-2 text-right">Points</th>
+                          </tr>
+                        </thead>
+                        <tbody className="divide-y divide-border/60">
+                          {round.rows.map((row) => (
+                            <tr key={`${entrant.entrant_name}-${row.round}-${row.slot_id}-${row.player_id}`}>
+                              <td className="px-3 py-2">{row.slot_id}</td>
+                              <td className="px-3 py-2 font-medium">{row.player_name}</td>
+                              <td className="px-3 py-2">{row.pos}</td>
+                              <td className="px-3 py-2">{row.team_abbr ?? "-"}</td>
+                              <td className="px-3 py-2 text-right font-semibold">
+                                {safePoints(row.points).toFixed(1)}
+                              </td>
+                            </tr>
+                          ))}
+                        </tbody>
+                      </table>
+                    </div>
+                  </div>
+                ))}
+              </div>
+            </section>
+          ))}
+        </div>
+      )}
+    </main>
+  );
+}

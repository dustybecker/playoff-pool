"use client";

import { useEffect, useMemo, useState } from "react";

type Entry = {
  entrant_name: string;
  points: number;
  updated_at: string | null;
};

export default function LeaderboardPage() {
  const poolId = process.env.NEXT_PUBLIC_POOL_ID || "2026-playoffs";
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `/api/leaderboard?pool_id=${encodeURIComponent(poolId)}`
        );
        const text = await res.text();

        let json: any;
        try {
          json = JSON.parse(text);
        } catch {
          throw new Error(
            `Leaderboard API did not return JSON. First 200 chars:\n${text.slice(
              0,
              200
            )}`
          );
        }

        if (!res.ok) throw new Error(json?.error || "Failed to load leaderboard");

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

  const rows = useMemo(() => {
    // API is already sorted by points desc; keep as-is.
    return entries;
  }, [entries]);

  return (
    <main className="pb-24">
      <div className="mb-4">
        <h1 className="text-xl font-semibold">Leaderboard</h1>
        <p className="mt-1 text-sm text-muted">
          Entries submitted:{" "}
          <span className="font-semibold">{entries.length}</span>
        </p>
      </div>

      {loading && (
        <div className="rounded-lg border border-border bg-surface p-4 text-sm text-muted">
          Loading leaderboard…
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-danger/40 bg-surface p-4 text-sm text-danger">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          {rows.length === 0 ? (
            <div className="p-4 text-sm text-muted">No entries yet.</div>
          ) : (
            rows.map((e, idx) => (
              <div
                key={`${e.entrant_name}-${idx}`}
                className="flex items-center justify-between border-b border-border p-3 last:border-b-0"
              >
                <div>
                  <div className="text-sm font-semibold">
                    {idx + 1}. {e.entrant_name}
                  </div>
                  <div className="mt-1 text-xs text-muted">
                    Updated:{" "}
                    {e.updated_at ? new Date(e.updated_at).toLocaleString() : "—"}
                  </div>
                </div>

                <div className="text-sm font-semibold">
                  {Number.isFinite(e.points) ? e.points.toFixed(1) : "0.00"}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </main>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";

type Entry = {
  entrant_name: string;
  round1?: number;
  round2?: number;
  round3?: number;
  round4?: number;
  total?: number;
};

function safeNumber(value: number | undefined) {
  return Number.isFinite(value) ? value ?? 0 : 0;
}

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
    return [...entries].sort((a, b) => {
      const totalA =
        safeNumber(a.total) +
        safeNumber(a.round1) +
        safeNumber(a.round2) +
        safeNumber(a.round3) +
        safeNumber(a.round4);
      const totalB =
        safeNumber(b.total) +
        safeNumber(b.round1) +
        safeNumber(b.round2) +
        safeNumber(b.round3) +
        safeNumber(b.round4);
      return totalB - totalA;
    });
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
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm">
                <thead className="border-b border-border text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-3 py-3 text-left">Entrant</th>
                    <th className="px-3 py-3 text-right">R1</th>
                    <th className="px-3 py-3 text-right">R2</th>
                    <th className="px-3 py-3 text-right">R3</th>
                    <th className="px-3 py-3 text-right">R4</th>
                    <th className="px-3 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((entry, idx) => {
                    const round1 = safeNumber(entry.round1);
                    const round2 = safeNumber(entry.round2);
                    const round3 = safeNumber(entry.round3);
                    const round4 = safeNumber(entry.round4);
                    const total =
                      safeNumber(entry.total) || round1 + round2 + round3 + round4;

                    return (
                      <tr key={`${entry.entrant_name}-${idx}`}>
                        <td className="px-3 py-3 font-semibold">
                          {idx + 1}. {entry.entrant_name}
                        </td>
                        <td className="px-3 py-3 text-right">{round1.toFixed(1)}</td>
                        <td className="px-3 py-3 text-right">{round2.toFixed(1)}</td>
                        <td className="px-3 py-3 text-right">{round3.toFixed(1)}</td>
                        <td className="px-3 py-3 text-right">{round4.toFixed(1)}</td>
                        <td className="px-3 py-3 text-right font-semibold">
                          {total.toFixed(1)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </main>
  );
}

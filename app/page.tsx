"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-bg text-text p-4">
      {/* Pool Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Playoff Fantasy Pool</h1>
        <p className="text-muted text-sm">2026 NFL Playoffs</p>
      </div>

      {/* Lock Countdown */}
      <div className="bg-surface border border-border rounded-lg p-4 mb-6">
        <p className="text-sm text-muted">Roster locks in</p>
        <p className="text-lg font-semibold">1d 4h 22m</p>
      </div>

      {/* Primary CTA */}
      <button
        type="button"
        onClick={() => router.push("/roster")}
        className="w-full bg-accent text-black font-semibold py-3 rounded-lg mb-8"
      >
        Submit My Roster
      </button>

      {/* Leaderboard Preview */}
      <div>
        <h2 className="text-sm font-semibold mb-3 text-muted">
          Leaderboard Preview
        </h2>

        <div className="bg-surface border border-border rounded-lg divide-y divide-border">
          {[
            { name: "Mike", points: 124.6 },
            { name: "Sarah", points: 119.2 },
            { name: "You", points: 117.8 },
          ].map((entry, index) => (
            <div key={index} className="flex justify-between items-center p-3">
              <span>
                {index + 1}. {entry.name}
              </span>
              <span className="font-semibold">{entry.points}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

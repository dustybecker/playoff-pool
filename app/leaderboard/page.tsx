const entries = [
  { name: "Mike", points: 124.6, active: 3 },
  { name: "Sarah", points: 119.2, active: 2 },
  { name: "You", points: 117.8, active: 4 },
  { name: "Dave", points: 102.4, active: 1 },
];

export default function LeaderboardPage() {
  return (
    <main>
      <h1 className="text-xl font-semibold">Leaderboard</h1>
      <p className="mt-2 text-sm text-muted">
        Live points update as games finish.
      </p>

      <div className="mt-6 overflow-hidden rounded-lg border border-border bg-surface">
        <div className="divide-y divide-border">
          {entries.map((e, idx) => (
            <div key={e.name} className="flex items-center justify-between p-3">
              <div>
                <div className="font-semibold">
                  {idx + 1}. {e.name}
                </div>
                <div className="text-xs text-muted">{e.active} active</div>
              </div>
              <div className="text-right font-semibold">{e.points}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

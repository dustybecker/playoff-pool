export async function GET() {
  const API_KEY = "439161";
  const BASE = `https://www.thesportsdb.com/api/v1/json/${API_KEY}`;

  const TARGET_TEAMS = [
    "Denver Broncos",
    "Pittsburgh Steelers",
    "Houston Texans",
    "New England Patriots",
    "Los Angeles Chargers",
    "Jacksonville Jaguars",
    "Buffalo Bills"
  ];

  const TARGET_POSITIONS = ["QB", "RB", "WR", "TE"];

  async function get(url) {
    const r = await fetch(url);
    const text = await r.text();

    try {
      return JSON.parse(text);
    } catch {
      console.error("API returned non‑JSON:", text);
      return null;
    }
  }

  const leagueId = "4391";
  const teamsData = await get(`${BASE}/lookup_all_teams.php?id=${leagueId}`);

  if (!teamsData || !teamsData.teams) {
    return Response.json({ error: "Failed to fetch NFL teams" }, { status: 500 });
  }

  const selectedTeams = teamsData.teams.filter(t =>
    TARGET_TEAMS.includes(t.strTeam)
  );

  const results = [];

  for (const team of selectedTeams) {
    const playersData = await get(`${BASE}/lookup_all_players.php?id=${team.idTeam}`);

    if (!playersData || !playersData.player) continue;

    const filtered = playersData.player.filter(p =>
      TARGET_POSITIONS.includes(p.strPosition)
    );

    filtered.forEach(p => {
      results.push({
        player: p.strPlayer,
        team: team.strTeam,
        position: p.strPosition
      });
    });
  }

  return Response.json(results);
}

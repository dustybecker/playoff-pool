export type Team = {
  id: string;      // short id
  name: string;    // display name
  conference: "AFC" | "NFC";
};

export type Player = {
  id: string;
  teamId: string;
  name: string;
  pos: "QB" | "RB" | "WR" | "TE" | "K" | "DST";
};

export const playoffTeams: Team[] = [
  { id: "KC", name: "Chiefs", conference: "AFC" },
  { id: "BUF", name: "Bills", conference: "AFC" },
  { id: "BAL", name: "Ravens", conference: "AFC" },
  { id: "CIN", name: "Bengals", conference: "AFC" },
  { id: "MIA", name: "Dolphins", conference: "AFC" },
  { id: "CLE", name: "Browns", conference: "AFC" },
  { id: "HOU", name: "Texans", conference: "AFC" },

  { id: "SF", name: "49ers", conference: "NFC" },
  { id: "DAL", name: "Cowboys", conference: "NFC" },
  { id: "PHI", name: "Eagles", conference: "NFC" },
  { id: "DET", name: "Lions", conference: "NFC" },
  { id: "GB", name: "Packers", conference: "NFC" },
  { id: "TB", name: "Buccaneers", conference: "NFC" },
  { id: "LAR", name: "Rams", conference: "NFC" },
];

// Keep it simple: 6 players per team
export const playersByTeam: Record<string, Player[]> = {
  KC: [
    { id: "KC-1", teamId: "KC", name: "Patrick Mahomes", pos: "QB" },
    { id: "KC-2", teamId: "KC", name: "Isiah Pacheco", pos: "RB" },
    { id: "KC-3", teamId: "KC", name: "Travis Kelce", pos: "TE" },
    { id: "KC-4", teamId: "KC", name: "Rashee Rice", pos: "WR" },
    { id: "KC-5", teamId: "KC", name: "Harrison Butker", pos: "K" },
    { id: "KC-6", teamId: "KC", name: "Chiefs DST", pos: "DST" },
  ],
  BUF: [
    { id: "BUF-1", teamId: "BUF", name: "Josh Allen", pos: "QB" },
    { id: "BUF-2", teamId: "BUF", name: "James Cook", pos: "RB" },
    { id: "BUF-3", teamId: "BUF", name: "Stefon Diggs", pos: "WR" },
    { id: "BUF-4", teamId: "BUF", name: "Dalton Kincaid", pos: "TE" },
    { id: "BUF-5", teamId: "BUF", name: "Tyler Bass", pos: "K" },
    { id: "BUF-6", teamId: "BUF", name: "Bills DST", pos: "DST" },
  ],
  BAL: [
    { id: "BAL-1", teamId: "BAL", name: "Lamar Jackson", pos: "QB" },
    { id: "BAL-2", teamId: "BAL", name: "Derrick Henry", pos: "RB" },
    { id: "BAL-3", teamId: "BAL", name: "Zay Flowers", pos: "WR" },
    { id: "BAL-4", teamId: "BAL", name: "Mark Andrews", pos: "TE" },
    { id: "BAL-5", teamId: "BAL", name: "Justin Tucker", pos: "K" },
    { id: "BAL-6", teamId: "BAL", name: "Ravens DST", pos: "DST" },
  ],
  CIN: [
    { id: "CIN-1", teamId: "CIN", name: "Joe Burrow", pos: "QB" },
    { id: "CIN-2", teamId: "CIN", name: "Ja'Marr Chase", pos: "WR" },
    { id: "CIN-3", teamId: "CIN", name: "Tee Higgins", pos: "WR" },
    { id: "CIN-4", teamId: "CIN", name: "Chase Brown", pos: "RB" },
    { id: "CIN-5", teamId: "CIN", name: "Evan McPherson", pos: "K" },
    { id: "CIN-6", teamId: "CIN", name: "Bengals DST", pos: "DST" },
  ],
  MIA: [
    { id: "MIA-1", teamId: "MIA", name: "Tua Tagovailoa", pos: "QB" },
    { id: "MIA-2", teamId: "MIA", name: "Tyreek Hill", pos: "WR" },
    { id: "MIA-3", teamId: "MIA", name: "Jaylen Waddle", pos: "WR" },
    { id: "MIA-4", teamId: "MIA", name: "Raheem Mostert", pos: "RB" },
    { id: "MIA-5", teamId: "MIA", name: "Jason Sanders", pos: "K" },
    { id: "MIA-6", teamId: "MIA", name: "Dolphins DST", pos: "DST" },
  ],
  CLE: [
    { id: "CLE-1", teamId: "CLE", name: "Joe Flacco", pos: "QB" },
    { id: "CLE-2", teamId: "CLE", name: "Nick Chubb", pos: "RB" },
    { id: "CLE-3", teamId: "CLE", name: "Amari Cooper", pos: "WR" },
    { id: "CLE-4", teamId: "CLE", name: "David Njoku", pos: "TE" },
    { id: "CLE-5", teamId: "CLE", name: "Dustin Hopkins", pos: "K" },
    { id: "CLE-6", teamId: "CLE", name: "Browns DST", pos: "DST" },
  ],
  HOU: [
    { id: "HOU-1", teamId: "HOU", name: "C.J. Stroud", pos: "QB" },
    { id: "HOU-2", teamId: "HOU", name: "Joe Mixon", pos: "RB" },
    { id: "HOU-3", teamId: "HOU", name: "Nico Collins", pos: "WR" },
    { id: "HOU-4", teamId: "HOU", name: "Tank Dell", pos: "WR" },
    { id: "HOU-5", teamId: "HOU", name: "Ka'imi Fairbairn", pos: "K" },
    { id: "HOU-6", teamId: "HOU", name: "Texans DST", pos: "DST" },
  ],

  SF: [
    { id: "SF-1", teamId: "SF", name: "Brock Purdy", pos: "QB" },
    { id: "SF-2", teamId: "SF", name: "Christian McCaffrey", pos: "RB" },
    { id: "SF-3", teamId: "SF", name: "Deebo Samuel", pos: "WR" },
    { id: "SF-4", teamId: "SF", name: "Brandon Aiyuk", pos: "WR" },
    { id: "SF-5", teamId: "SF", name: "George Kittle", pos: "TE" },
    { id: "SF-6", teamId: "SF", name: "49ers DST", pos: "DST" },
  ],
  DAL: [
    { id: "DAL-1", teamId: "DAL", name: "Dak Prescott", pos: "QB" },
    { id: "DAL-2", teamId: "DAL", name: "CeeDee Lamb", pos: "WR" },
    { id: "DAL-3", teamId: "DAL", name: "Tony Pollard", pos: "RB" },
    { id: "DAL-4", teamId: "DAL", name: "Jake Ferguson", pos: "TE" },
    { id: "DAL-5", teamId: "DAL", name: "Brandon Aubrey", pos: "K" },
    { id: "DAL-6", teamId: "DAL", name: "Cowboys DST", pos: "DST" },
  ],
  PHI: [
    { id: "PHI-1", teamId: "PHI", name: "Jalen Hurts", pos: "QB" },
    { id: "PHI-2", teamId: "PHI", name: "A.J. Brown", pos: "WR" },
    { id: "PHI-3", teamId: "PHI", name: "DeVonta Smith", pos: "WR" },
    { id: "PHI-4", teamId: "PHI", name: "Saquon Barkley", pos: "RB" },
    { id: "PHI-5", teamId: "PHI", name: "Dallas Goedert", pos: "TE" },
    { id: "PHI-6", teamId: "PHI", name: "Eagles DST", pos: "DST" },
  ],
  DET: [
    { id: "DET-1", teamId: "DET", name: "Jared Goff", pos: "QB" },
    { id: "DET-2", teamId: "DET", name: "Amon-Ra St. Brown", pos: "WR" },
    { id: "DET-3", teamId: "DET", name: "Jahmyr Gibbs", pos: "RB" },
    { id: "DET-4", teamId: "DET", name: "Sam LaPorta", pos: "TE" },
    { id: "DET-5", teamId: "DET", name: "Jameson Williams", pos: "WR" },
    { id: "DET-6", teamId: "DET", name: "Lions DST", pos: "DST" },
  ],
  GB: [
    { id: "GB-1", teamId: "GB", name: "Jordan Love", pos: "QB" },
    { id: "GB-2", teamId: "GB", name: "Aaron Jones", pos: "RB" },
    { id: "GB-3", teamId: "GB", name: "Christian Watson", pos: "WR" },
    { id: "GB-4", teamId: "GB", name: "Jayden Reed", pos: "WR" },
    { id: "GB-5", teamId: "GB", name: "Luke Musgrave", pos: "TE" },
    { id: "GB-6", teamId: "GB", name: "Packers DST", pos: "DST" },
  ],
  TB: [
    { id: "TB-1", teamId: "TB", name: "Baker Mayfield", pos: "QB" },
    { id: "TB-2", teamId: "TB", name: "Mike Evans", pos: "WR" },
    { id: "TB-3", teamId: "TB", name: "Chris Godwin", pos: "WR" },
    { id: "TB-4", teamId: "TB", name: "Rachaad White", pos: "RB" },
    { id: "TB-5", teamId: "TB", name: "Cade Otton", pos: "TE" },
    { id: "TB-6", teamId: "TB", name: "Buccaneers DST", pos: "DST" },
  ],
  LAR: [
    { id: "LAR-1", teamId: "LAR", name: "Matthew Stafford", pos: "QB" },
    { id: "LAR-2", teamId: "LAR", name: "Kyren Williams", pos: "RB" },
    { id: "LAR-3", teamId: "LAR", name: "Cooper Kupp", pos: "WR" },
    { id: "LAR-4", teamId: "LAR", name: "Puka Nacua", pos: "WR" },
    { id: "LAR-5", teamId: "LAR", name: "Tyler Higbee", pos: "TE" },
    { id: "LAR-6", teamId: "LAR", name: "Rams DST", pos: "DST" },
  ],
};

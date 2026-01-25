import fs from "node:fs";
import { parse } from "csv-parse/sync";

// Path to the World Cup dataset
const CSV_PATH = "data/raw/worldcup/data-csv/player_appearances.csv";

function loadPlayerAppearances() {
    const csvText = fs.readFileSync(CSV_PATH, "utf8");
    return parse(csvText, {
      columns: true,
      skip_empty_lines: true,
    });
  }
  

/**
 * Get a starting XI lineup for the Missing-11 game.
 *
 * @param {Object} options
 * @param {"easy"|"hard"} options.difficulty
 * @param {string} [options.seed] - optional deterministic seed (e.g. date)
 */

const EASY_TEAMS = new Set([
    "England",
    "Italy",
    "France",
    "Spain",
    "Germany",
    "Portugal",
    "Netherlands",
    "Brazil",
    "Argentina",
  ]);
  
  const EASY_YEARS = new Set(["2010", "2014", "2018", "2022"]);

  const POSITION_TO_ROW = {
    GK: "GK",
  
    LB: "DF",
    RB: "DF",
    CB: "DF",
    LWB: "DF",
    RWB: "DF",
  
    DM: "MF",
    CM: "MF",
    AM: "MF",
  
    LW: "FW",
    RW: "FW",
    CF: "FW",
    ST: "FW",
  };

  const POSITION_SIDE_WEIGHT = {
    // Left
    LB: 1,
    LWB: 1,
    LW: 1,
  
    // Center
    CB: 2,
    DM: 2,
    CM: 2,
    AM: 2,
    CF: 2,
    ST: 2,
    GK: 2,
  
    // Right
    RB: 3,
    RWB: 3,
    RW: 3,
  };
  
  
export function getLineup({ difficulty, seed }) {
    const records = loadPlayerAppearances();

  // Starters only (starting XI candidates)
  const starters = records.filter((r) => r.starter === "1");

  // Group starters by match + team
  const groups = new Map();
  for (const r of starters) {
    const key = `${r.match_id}__${r.team_id}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(r);
  }

  // Convert to an array of candidate lineups: only groups with exactly 11 starters and a GK
  const candidates = [];
  for (const [key, players] of groups.entries()) {
    if (players.length !== 11) continue;
    const hasGK = players.some((p) => p.position_code === "GK");
    if (!hasGK) continue;

    const sample = players[0];
    candidates.push({
      key,
      tournament_id: sample.tournament_id,
      match_id: sample.match_id,
      match_name: sample.match_name,
      match_date: sample.match_date,
      team_id: sample.team_id,
      team_name: sample.team_name,
      team_code: sample.team_code,
      players,
    });
  }

  let filtered = candidates;

  if (difficulty === "easy") {
    filtered = candidates.filter((c) => {
      const year = c.match_date.slice(0, 4);
      return EASY_TEAMS.has(c.team_name) && EASY_YEARS.has(year);
    });
  }

  if (difficulty === "hard") {
    filtered = candidates.filter((c) => {
      const year = c.match_date.slice(0, 4);
      return year >= "1980" && !EASY_TEAMS.has(c.team_name);
    });
  }

    // For now, pick the first candidate so we can wire the UI.
  // We'll make this deterministic (seed/date) in the next step.
  const chosen = filtered[0];

  if (!chosen) {
    throw new Error(`No lineups available for difficulty="${difficulty}"`);
  }

  const formation = {
    GK: [],
    DF: [],
    MF: [],
    FW: [],
  };

  for (const p of chosen.players) {
    const raw = (p.position_code || "").trim().toUpperCase();
    const row = POSITION_TO_ROW[raw];
    if (row && formation[row]) {
      formation[row].push(p);
    }
  }
  


  // Sort each row deterministically (shirt number ascending)
  for (const key of Object.keys(formation)) {
    formation[key].sort((a, b) => {
      const aCode = (a.position_code || "").trim().toUpperCase();
      const bCode = (b.position_code || "").trim().toUpperCase();
  
      const aSide = POSITION_SIDE_WEIGHT[aCode] ?? 2;
      const bSide = POSITION_SIDE_WEIGHT[bCode] ?? 2;
  
      if (aSide !== bSide) return aSide - bSide;
  
      return Number(a.shirt_number) - Number(b.shirt_number);
    });
  }
  


  return {
    difficulty,
    match_id: chosen.match_id,
    match_name: chosen.match_name,
    match_date: chosen.match_date,
    team_name: chosen.team_name,
    team_code: chosen.team_code,
    formation,
    


   
  };




}

import fs from "node:fs";
import { parse } from "csv-parse/sync";

const CSV_PATH = "data/raw/worldcup/data-csv/player_appearances.csv";

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

function isKnockoutStage(stageName?: string) {
  const s = String(stageName || "").trim().toLowerCase();
  if (!s) return false;
  if (s === "group stage") return false;
  return true;
}


const EASY_YEARS = new Set(["2010", "2014", "2018", "2022"]);

const POSITION_TO_ROW: Record<string, "GK" | "DF" | "MF" | "FW"> = {

  GK: "GK",

  DEF: "DF",
  MID: "MF",
  ATT: "FW",

    // Short form (common in dataset)
    DF: "DF",
    MF: "MF",
    FW: "FW",
  
    // Single-letter (seen in some older data)
    D: "DF",
    M: "MF",
    F: "FW",
  

  LB: "DF",
  RB: "DF",
  CB: "DF",
  LWB: "DF",
  RWB: "DF",
  SW: "DF",

  DM: "MF",
  CM: "MF",
  AM: "MF",
  LM: "MF",
  RM: "MF",

  LW: "FW",
  RW: "FW",
  CF: "FW",
  ST: "FW",
  SS: "FW",
  LF: "FW",
  RF: "FW",
};



const POSITION_SIDE_WEIGHT: Record<string, number> = {
  LB: 1,
  LWB: 1,
  LW: 1,

  CB: 2,
  DM: 2,
  CM: 2,
  AM: 2,
  CF: 2,
  ST: 2,
  GK: 2,

  RB: 3,
  RWB: 3,
  RW: 3,
};

function loadPlayerAppearances(): any[] {
  const csvText = fs.readFileSync(CSV_PATH, "utf8");
  return parse(csvText, {
    columns: true,
    skip_empty_lines: true,
  });
}

export function getLineup({
  difficulty,
  puzzleId,
}: {
  difficulty: "easy" | "hard";
  puzzleId?: string;
}) {

  const records = loadPlayerAppearances();
  const starters = records.filter((r) => r.starter === "1");

  const groups = new Map<string, any[]>();
  for (const r of starters) {
    const key = `${r.match_id}__${r.team_id}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(r);
  }

  const candidates: any[] = [];
  for (const players of groups.values()) {
    if (players.length !== 11) continue;
    if (!players.some((p) => p.position_code === "GK")) continue;

    const sample = players[0];
    candidates.push({
      match_id: sample.match_id,
      match_name: sample.match_name,
      match_date: sample.match_date,
      stage_name: sample.stage_name, // ADD THIS
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
  
      return (
        year >= "2002" && // <-- change to 2002 if we want bigger pool
        !EASY_TEAMS.has(c.team_name) &&
        isKnockoutStage(c.stage_name)
      );
    });
  }
  



  // Deterministic daily selection:
// same (puzzleId + difficulty) => same lineup forever.
const effectivePuzzleId =
typeof puzzleId === "string" && puzzleId.length === 10
  ? puzzleId
  : new Date().toISOString().slice(0, 10);

if (filtered.length === 0) {
throw new Error("No lineup available");
}

// Simple stable hash (no crypto, no external deps)
const key = `${effectivePuzzleId}__${difficulty}`;
let hash = 0;
for (let i = 0; i < key.length; i++) {
hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
}

const index = hash % filtered.length;
const chosen = filtered[index];


  const formation: Record<"GK" | "DF" | "MF" | "FW", any[]> = {
    GK: [],
    DF: [],
    MF: [],
    FW: [],
  };

  for (const p of chosen.players) {
    const raw = (p.position_code || "").trim().toUpperCase();
    const row = POSITION_TO_ROW[raw];
    if (row) formation[row].push(p);
  }

  for (const key of Object.keys(formation) as Array<
    "GK" | "DF" | "MF" | "FW"
  >) {
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

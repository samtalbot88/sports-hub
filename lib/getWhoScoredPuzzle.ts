import fs from "node:fs";
import { parse } from "csv-parse/sync";

export type GoalMinute = {
    label: string;
    sortMinute: number;
    isOG: boolean;
    isPen: boolean;
  };
  
  export type WhoScoredPlayerGoalGroup = {

    player_id: string;
    family_name: string;
    given_name: string;
    team_name: string;
    team_code: string;
    minutes: GoalMinute[];
  };
  

const GOALS_CSV_PATH = "data/raw/worldcup/data-csv/goals.csv";

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

function isKnockoutStage(stageName?: string) {
  const s = String(stageName || "").trim().toLowerCase();
  if (!s) return false;
  if (s === "group stage") return false;
  return true;
}

type GoalRow = {
  key_id: string;
  goal_id: string;
  tournament_id: string;
  tournament_name: string;
  match_id: string;
  match_name: string;
  match_date: string;
  stage_name: string;
  group_name: string;
  team_id: string;
  team_name: string;
  team_code: string;
  home_team: string; // "1" | "0"
  away_team: string; // "1" | "0"
  player_id: string;
  family_name: string;
  given_name: string;
  shirt_number: string;
  player_team_id: string;
  player_team_name: string;
  player_team_code: string;
  minute_label: string; // e.g. "90+3'" or "108'"
  minute_regulation: string;
  minute_stoppage: string;
  match_period: string; // includes extra time labels
  own_goal: string; // "1" | "0"
  penalty: string; // "1" | "0"
};

function stableIndexFromKey(key: string, length: number): number {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return hash % length;
}

function loadGoals(): GoalRow[] {
  const csvText = fs.readFileSync(GOALS_CSV_PATH, "utf8");
  return parse(csvText, {
    columns: true,
    skip_empty_lines: true,
  }) as GoalRow[];
}

function getYear(dateStr: string) {
  return (dateStr || "").slice(0, 4);
}

function isExtraTimePeriod(matchPeriod: string) {
  const s = (matchPeriod || "").toLowerCase();
  return s.includes("extra time");
}

function formatMinuteLabel(row: GoalRow) {
  // Dataset already gives the right display format for our rules:
  // - extra time: 108'
  // - stoppage time: 90+3'
  // so we use minute_label verbatim.
  const raw = (row.minute_label || "").trim();
  return raw;
}



export function getWhoScoredPuzzle({
  difficulty,
  puzzleId,
}: {
  difficulty: "easy" | "hard";
  puzzleId?: string;
}) {
  const effectivePuzzleId =
    typeof puzzleId === "string" && puzzleId.length === 10
      ? puzzleId
      : new Date().toISOString().slice(0, 10);

  const rows = loadGoals();

  // 1) Group all goals by match_id
  const byMatch = new Map<string, GoalRow[]>();
  for (const r of rows) {
    if (!byMatch.has(r.match_id)) byMatch.set(r.match_id, []);
    byMatch.get(r.match_id)!.push(r);
  }

  // 2) Build match candidates, filter by difficulty, ignore 0-0 (no goals)
  const candidates: Array<{
    match_id: string;
    match_name: string;
    match_date: string;
    stage_name: string;
    goals: GoalRow[];
    home_team_name: string;
    away_team_name: string;
    home_score: number;
    away_score: number;
    isAET: boolean;
  }> = [];

  for (const goals of byMatch.values()) {
    if (goals.length === 0) continue;

    const sample = goals[0];
    const year = getYear(sample.match_date);

  // Compute match teams
// IMPORTANT: teams with 0 goals will not appear in goal rows
const rawMatchName = (sample.match_name || "").trim();

// remove any trailing extra text like " (Group ...)" if it exists
const cleanMatchName = rawMatchName.split("(")[0].trim();

// support multiple separators we might see in the dataset
const parts =
  cleanMatchName.includes(" v ")
    ? cleanMatchName.split(" v ")
    : cleanMatchName.includes(" vs ")
    ? cleanMatchName.split(" vs ")
    : cleanMatchName.includes(" v. ")
    ? cleanMatchName.split(" v. ")
    : [cleanMatchName];

const parsedHome = (parts[0] || "").trim();
const parsedAway = (parts[1] || "").trim();


const homeTeamName =
  parsedHome || goals.find((g) => g.home_team === "1")?.team_name || "";

const awayTeamName =
  parsedAway || goals.find((g) => g.away_team === "1")?.team_name || "";


    const homeScore = goals.filter((g) => g.home_team === "1").length;
    const awayScore = goals.filter((g) => g.away_team === "1").length;

    // Ignore 0-0 (shouldn’t exist because goals.length > 0, but keep explicit)
    if (homeScore + awayScore === 0) continue;

    const isAET = goals.some((g) => isExtraTimePeriod(g.match_period));

 // Difficulty filtering (match Missing 11 / Wordle rules)
if (difficulty === "easy") {
  const passesYear = year >= "2014";
  const passesTeam =
    EASY_TEAMS.has(homeTeamName) || EASY_TEAMS.has(awayTeamName);
  if (!passesYear || !passesTeam) continue;
}

if (difficulty === "hard") {
  // Hard: 2002+ , knockout only, and exclude easy teams
  if (year < "2002") continue;
  if (!isKnockoutStage(sample.stage_name)) continue;

  const hasEasyTeam =
    EASY_TEAMS.has(homeTeamName) || EASY_TEAMS.has(awayTeamName);
  if (hasEasyTeam) continue;
}


    candidates.push({
      match_id: sample.match_id,
      match_name: sample.match_name,
      match_date: sample.match_date,
      stage_name: sample.stage_name,
      goals,
      home_team_name: homeTeamName,
      away_team_name: awayTeamName,
      home_score: homeScore,
      away_score: awayScore,
      isAET,
    });
  }

  if (candidates.length === 0) {
    throw new Error("No eligible Who Scored matches found");
  }

  // 3) Deterministically pick a match for the day (puzzleId + difficulty)
  const matchKey = `${effectivePuzzleId}__${difficulty}__whoscored__match`;
  const matchIndex = stableIndexFromKey(matchKey, candidates.length);
  const chosen = candidates[matchIndex];

  // 4) Group goals by team then by player_id, sort minutes ascending
  function groupTeamGoals(teamFlag: "home_team" | "away_team"): WhoScoredPlayerGoalGroup[] {

    const goalsForTeam = chosen.goals.filter((g) => g[teamFlag] === "1");

    const byPlayer = new Map<string, WhoScoredPlayerGoalGroup>();

    for (const g of goalsForTeam) {
      const existing = byPlayer.get(g.player_id);
      const minute: GoalMinute = {
        label: formatMinuteLabel(g),
        sortMinute:
          Number(g.minute_regulation || 0) * 100 + Number(g.minute_stoppage || 0),
        isOG: g.own_goal === "1",
        isPen: g.penalty === "1",
      };
      


      if (existing) {
        existing.minutes.push(minute);
      } else {
        byPlayer.set(g.player_id, {
          player_id: g.player_id,
          family_name: g.family_name,
          given_name: g.given_name,
          team_name: g.team_name,
          team_code: g.team_code,
          minutes: [minute],
        });
      }
    }

    const grouped = Array.from(byPlayer.values());

    // Sort each player's minutes by numeric value (best-effort)
    for (const p of grouped) {
      p.minutes.sort((a, b) => {
        // try parse "90+3'" into 93, "108'" into 108
        const toNum = (s: string) => {
          const clean = s.replace("'", "").trim();
          if (clean.includes("+")) {
            const [base, add] = clean.split("+");
            return Number(base) + Number(add);
          }
          return Number(clean);
        };
        return toNum(a.label) - toNum(b.label);
      });
    }

    // Sort players by their first goal minute
    grouped.sort((a, b) => {
      const aFirst = a.minutes[0]?.label ?? "0'";
      const bFirst = b.minutes[0]?.label ?? "0'";
      const toNum = (s: string) => {
        const clean = s.replace("'", "").trim();
        if (clean.includes("+")) {
          const [base, add] = clean.split("+");
          return Number(base) + Number(add);
        }
        return Number(clean);
      };
      return toNum(aFirst) - toNum(bFirst);
    });

    return grouped;
  }

  const homeGoals = groupTeamGoals("home_team");
  const awayGoals = groupTeamGoals("away_team");

  return {
    difficulty,
    puzzleId: effectivePuzzleId,

    match_id: chosen.match_id,
    match_name: chosen.match_name,
    match_date: chosen.match_date,
    stage_name: chosen.stage_name,

    home_team_name: chosen.home_team_name,
    away_team_name: chosen.away_team_name,
    home_score: chosen.home_score,
    away_score: chosen.away_score,
    isAET: chosen.isAET,

    homeGoals,
    awayGoals,
  };
}

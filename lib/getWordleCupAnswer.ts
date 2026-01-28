import fs from "node:fs";
import { parse } from "csv-parse/sync";
import { isEligibleWordleCupSurname, normalizeWordleCupSurname } from "./wordleCupName";

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

const EASY_YEARS = new Set(["2010", "2014", "2018", "2022"]);

function loadPlayerAppearances(): any[] {
  const csvText = fs.readFileSync(CSV_PATH, "utf8");
  return parse(csvText, {
    columns: true,
    skip_empty_lines: true,
  });
}

function stableIndexFromKey(key: string, length: number): number {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return hash % length;
}

export function getWordleCupAnswer({
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

  const records = loadPlayerAppearances();
  const starters = records.filter((r) => r.starter === "1");

  // Build candidate lineups exactly like Missing 11 does (match_id + team_id groups)
  const groups = new Map<string, any[]>();
  for (const r of starters) {
    const key = `${r.match_id}__${r.team_id}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(r);
  }

  const lineups: any[] = [];
  for (const players of groups.values()) {
    if (players.length !== 11) continue;
    if (!players.some((p) => p.position_code === "GK")) continue;

    const sample = players[0];
    lineups.push({
      match_id: sample.match_id,
      match_name: sample.match_name,
      match_date: sample.match_date,
      team_name: sample.team_name,
      team_code: sample.team_code,
      players,
    });
  }

  // Apply the same easy/hard filtering rules as getLineup.ts
  let filtered = lineups;

  if (difficulty === "easy") {
    filtered = lineups.filter((c) => {
      const year = c.match_date.slice(0, 4);
      return EASY_TEAMS.has(c.team_name) && EASY_YEARS.has(year);
    });
  }

  if (difficulty === "hard") {
    filtered = lineups.filter((c) => {
      const year = c.match_date.slice(0, 4);
      return year >= "1980" && !EASY_TEAMS.has(c.team_name);
    });
  }

  if (filtered.length === 0) {
    throw new Error("No eligible lineups available for Wordle Cup");
  }

  // 1) Deterministically pick a lineup for the day (same approach as Missing 11)
  const lineupKey = `${effectivePuzzleId}__${difficulty}__wordlecup__lineup`;
  const lineupIndex = stableIndexFromKey(lineupKey, filtered.length);
  const chosenLineup = filtered[lineupIndex];

  // 2) From that lineup, build eligible player candidates (surname rules)
  const eligiblePlayers = chosenLineup.players
    .filter((p: any) => isEligibleWordleCupSurname(p.family_name))
    .map((p: any) => ({
      player_id: p.player_id,
      family_name_raw: p.family_name,
      family_name: normalizeWordleCupSurname(p.family_name),
    }));

  if (eligiblePlayers.length === 0) {
    // If a chosen lineup has zero eligible surnames, pick the next lineup deterministically
    // (walk forward until we find one with at least one eligible surname)
    for (let offset = 1; offset < filtered.length; offset++) {
      const nextLineup = filtered[(lineupIndex + offset) % filtered.length];
      const nextEligible = nextLineup.players
        .filter((p: any) => isEligibleWordleCupSurname(p.family_name))
        .map((p: any) => ({
          player_id: p.player_id,
          family_name_raw: p.family_name,
          family_name: normalizeWordleCupSurname(p.family_name),
        }));

      if (nextEligible.length > 0) {
        const playerKey = `${effectivePuzzleId}__${difficulty}__wordlecup__player`;
        const playerIndex = stableIndexFromKey(playerKey, nextEligible.length);
        const chosenPlayer = nextEligible[playerIndex];

        return {
          difficulty,
          puzzleId: effectivePuzzleId,
          answer: chosenPlayer.family_name,
          player_id: chosenPlayer.player_id,
          match_id: nextLineup.match_id,
          match_name: nextLineup.match_name,
          match_date: nextLineup.match_date,
          team_name: nextLineup.team_name,
          team_code: nextLineup.team_code,
        };
      }
    }

    throw new Error("No eligible Wordle Cup surname found in any lineup");
  }

  // 3) Deterministically pick a player from the lineup
  const playerKey = `${effectivePuzzleId}__${difficulty}__wordlecup__player`;
  const playerIndex = stableIndexFromKey(playerKey, eligiblePlayers.length);
  const chosenPlayer = eligiblePlayers[playerIndex];

  return {
    difficulty,
    puzzleId: effectivePuzzleId,
    answer: chosenPlayer.family_name, // normalized + uppercase
    player_id: chosenPlayer.player_id,
    match_id: chosenLineup.match_id,
    match_name: chosenLineup.match_name,
    match_date: chosenLineup.match_date,
    team_name: chosenLineup.team_name,
    team_code: chosenLineup.team_code,
  };
}

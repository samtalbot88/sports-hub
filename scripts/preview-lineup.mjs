import fs from "node:fs";
import { parse } from "csv-parse/sync";

const CSV_PATH = "data/raw/worldcup/data-csv/player_appearances.csv";

// Load and parse CSV
const csvText = fs.readFileSync(CSV_PATH, "utf8");
const records = parse(csvText, {
  columns: true,
  skip_empty_lines: true,
});

// Filter to starters only
const starters = records.filter((r) => r.starter === "1");

// Group by match_id + team_id
const groupKey = (r) => `${r.match_id}__${r.team_id}`;
const groups = new Map();

for (const r of starters) {
  const key = groupKey(r);
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(r);
}

// Find first group that has exactly 11 starters and includes a GK
let chosen = null;

for (const [key, players] of groups.entries()) {
  if (players.length !== 11) continue;

  const hasGK = players.some((p) => p.position_code === "GK");
  if (!hasGK) continue;

  chosen = { key, players };
  break;
}

if (!chosen) {
  console.error("No valid starting XI found.");
  process.exit(1);
}

const sample = chosen.players
  .map((p) => ({
    match: p.match_name,
    date: p.match_date,
    team: p.team_name,
    code: p.team_code,
    shirt: p.shirt_number,
    pos: p.position_code,
    family: p.family_name,
    given: p.given_name,
  }))
  // sort roughly by position for readability
  .sort((a, b) => a.pos.localeCompare(b.pos) || Number(a.shirt) - Number(b.shirt));

console.log("Sample lineup group:", chosen.key);
console.table(sample);

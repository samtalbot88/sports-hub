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



function isKnockoutStage(stageName) {
  const s = String(stageName || "").trim().toLowerCase();

  if (!s) return false;

  // Dataset uses these values (with small plural variations)
  if (s === "group stage") return false;

  // Everything else in your 2010+ counts is knockout
  // round of 16 / quarter-final(s) / semi-final(s) / third-place match / final
  return true;
}


function normalizeSurname(name) {
  return String(name || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z\- ]/g, "")
    .trim();
}

// ---------- LOAD CSV ----------
const csvText = fs.readFileSync(CSV_PATH, "utf8");

const rows = parse(csvText, {
  columns: true,
  skip_empty_lines: true,
});

console.log("CSV columns:", Object.keys(rows[0] || {}));
console.log("Sample row:", rows[0]);

// --- DEBUG: stage_name values (2010+) ---
const stageCounts = new Map();

for (const r of rows) {
  const year = String(r.match_date || "").slice(0, 4);
  if (year < "2010") continue;

  const stage = String(r.stage_name || "").trim().toLowerCase() || "(missing)";
  stageCounts.set(stage, (stageCounts.get(stage) || 0) + 1);
}

console.log("\nStage_name counts (2010+):");
for (const [k, v] of [...stageCounts.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`${k}: ${v}`);
}



// ---------- BUILD STARTING LINEUPS ----------
const starters = rows.filter((r) => r.starter === "1");

const lineupMap = new Map();
for (const r of starters) {
  const key = `${r.match_id}__${r.team_id}`;
  if (!lineupMap.has(key)) lineupMap.set(key, []);
  lineupMap.get(key).push(r);
}

const lineups = [];
for (const players of lineupMap.values()) {
  if (players.length !== 11) continue;
  if (!players.some((p) => p.position_code === "GK")) continue;

  const s = players[0];
  lineups.push({
    match_id: s.match_id,
    match_date: s.match_date,
    team_name: s.team_name,
    stage_name: s.stage_name ?? "",
    players,
  });
}

// ---------- FILTER POOLS ----------
const easyLineups = lineups.filter((l) => {
  const year = l.match_date.slice(0, 4);
  return year >= "2014" && EASY_TEAMS.has(l.team_name);
});

const hardLineups = lineups.filter((l) => {
  const year = l.match_date.slice(0, 4);
  return (
    year >= "2002" &&
    !EASY_TEAMS.has(l.team_name) &&
    isKnockoutStage(l.stage_name)

  );
});

// ---------- WORDLE CUP SURNAME POOLS ----------
function countSurnames(lineups) {
  const surnames = new Set();
  let combos = 0;

  for (const l of lineups) {
    const names = l.players
      .map((p) => normalizeSurname(p.family_name))
      .filter((n) => n.length >= 3);

    const unique = new Set(names);
    for (const n of unique) {
      surnames.add(n);
      combos++;
    }
  }

  return { unique: surnames.size, combos };
}

const easyWordle = countSurnames(easyLineups);
const hardWordle = countSurnames(hardLineups);

// ---------- OUTPUT ----------
console.log("\n=== Missing 11 ===");
console.log("Easy lineups:", easyLineups.length);
console.log("Hard lineups:", hardLineups.length);

console.log("\n=== Wordle Cup ===");
console.log("Easy unique surnames:", easyWordle.unique);
console.log("Easy lineup×surname combos:", easyWordle.combos);
console.log("Hard unique surnames:", hardWordle.unique);
console.log("Hard lineup×surname combos:", hardWordle.combos);

console.log("\nDone.");


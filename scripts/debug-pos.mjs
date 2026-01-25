import { getLineup } from "./getLineup.mjs";

const x = getLineup({ difficulty: "easy" });

// Pull the raw players by re-running getLineup but temporarily exposing them is hard,
// so instead we’ll infer from formation result and print what we have.
console.log("Team:", x.team_name, "Date:", x.match_date);

// Print formation counts
console.log({
  GK: x.formation.GK.length,
  DF: x.formation.DF.length,
  MF: x.formation.MF.length,
  FW: x.formation.FW.length,
});

// Print whatever position codes exist in the objects we grouped
const codes = new Set();
for (const row of Object.values(x.formation)) {
  for (const p of row) codes.add(p.position_code);
}
console.log("Grouped position codes:", [...codes]);

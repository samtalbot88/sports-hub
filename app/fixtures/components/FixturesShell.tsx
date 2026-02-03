"use client";

import { useEffect, useMemo, useState } from "react";

type Team = {
  name?: string | null;
  shortName?: string | null;
  tla?: string | null;
};

type Match = {
  id: number;
  utcDate: string;
  status: string; // "SCHEDULED" | "TIMED" | "IN_PLAY" | "PAUSED" | "FINISHED" etc
  group: string | null; // e.g. "GROUP_A"
  homeTeam: Team | null;
  awayTeam: Team | null;
  score: {
    fullTime: { home: number | null; away: number | null };
  };
};

type Row = {
  team: string;
  P: number;
  W: number;
  D: number;
  L: number;
  GF: number;
  GA: number;
  GD: number;
  Pts: number;
};

function displayTeam(t?: Team | null) {
  return t?.name || t?.shortName || t?.tla || "TBD";
}

function groupLabel(group: string | null) {
  if (!group) return "Knockout";
  if (group.startsWith("GROUP_")) return `Group ${group.replace("GROUP_", "")}`;
  return group;
}

function stageLabel(stage: string | null) {
  if (!stage) return "Knockout";

  const key = stage.toUpperCase().trim();

  switch (key) {
    case "ROUND_OF_16":
      return "Last 16";
    case "QUARTER_FINALS":
      return "Quarter-finals";
    case "SEMI_FINALS":
      return "Semi-finals";
    case "THIRD_PLACE":
      return "Third Place Play-off";
    case "FINAL":
      return "Final";
    default:
      return stage
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase());
  }
}


function sortGroupKey(group: string | null) {
  if (!group) return "ZZZ_KNOCKOUT";
  if (group.startsWith("GROUP_")) return `A_${group.replace("GROUP_", "")}`;
  return `B_${group}`;
}
function isGroupStageMatch(m: Match) {
  return !!m.group && m.group.startsWith("GROUP_");
}

function stageLabelFromGroup(group: string | null) {
  // football-data uses group for stage labels on knockout matches sometimes (or null)
  if (!group) return "Knockout";

  // Common values seen: "LAST_16", "QUARTER_FINALS", "SEMI_FINALS", "THIRD_PLACE", "FINAL"
  const g = group.toUpperCase();

  if (g.includes("LAST_16") || g.includes("ROUND_OF_16")) return "Round of 16";
  if (g.includes("QUARTER")) return "Quarter-finals";
  if (g.includes("SEMI")) return "Semi-finals";
  if (g.includes("THIRD")) return "Third-place play-off";
  if (g.includes("FINAL")) return "Final";

  return "Knockout";
}

function stageSortKey(label: string) {
  if (label === "Round of 16") return "A";
  if (label === "Quarter-finals") return "B";
  if (label === "Semi-finals") return "C";
  if (label === "Third-place play-off") return "D";
  if (label === "Final") return "E";
  return "Z";
}

function computeTable(matches: Match[], teams: string[]): Row[] {
  const rows: Record<string, Row> = {};
  for (const t of teams) {
    rows[t] = { team: t, P: 0, W: 0, D: 0, L: 0, GF: 0, GA: 0, GD: 0, Pts: 0 };
  }

  for (const m of matches) {
    if (m.status !== "FINISHED") continue;

    const home = displayTeam(m.homeTeam);
    const away = displayTeam(m.awayTeam);

    const hs = m.score.fullTime.home;
    const as = m.score.fullTime.away;

    if (hs == null || as == null) continue;

    if (!rows[home]) rows[home] = { team: home, P: 0, W: 0, D: 0, L: 0, GF: 0, GA: 0, GD: 0, Pts: 0 };
    if (!rows[away]) rows[away] = { team: away, P: 0, W: 0, D: 0, L: 0, GF: 0, GA: 0, GD: 0, Pts: 0 };

    rows[home].P += 1;
    rows[away].P += 1;

    rows[home].GF += hs;
    rows[home].GA += as;

    rows[away].GF += as;
    rows[away].GA += hs;

    if (hs > as) {
      rows[home].W += 1;
      rows[home].Pts += 3;
      rows[away].L += 1;
    } else if (hs < as) {
      rows[away].W += 1;
      rows[away].Pts += 3;
      rows[home].L += 1;
    } else {
      rows[home].D += 1;
      rows[away].D += 1;
      rows[home].Pts += 1;
      rows[away].Pts += 1;
    }
  }

  const out = Object.values(rows).map((r) => ({ ...r, GD: r.GF - r.GA }));

  // Sort: TBD last, then Pts desc, GD desc, GF desc, name asc
  out.sort((a, b) => {
    const aTbd = a.team === "TBD";
    const bTbd = b.team === "TBD";
    if (aTbd !== bTbd) return aTbd ? 1 : -1;

    if (b.Pts !== a.Pts) return b.Pts - a.Pts;
    if (b.GD !== a.GD) return b.GD - a.GD;
    if (b.GF !== a.GF) return b.GF - a.GF;
    return a.team.localeCompare(b.team);
  });

  return out;
}

export default function FixturesShell() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  // Accordion state per group label
  const [openFixtures, setOpenFixtures] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch("/api/fixtures")
      .then((r) => r.json())
      .then((data) => setMatches(data.matches ?? []))
      .finally(() => setLoading(false));
  }, []);

  // Default accordion: open on desktop, closed on mobile
  useEffect(() => {
    if (typeof window === "undefined") return;
    const isDesktop = window.innerWidth >= 640;

    setOpenFixtures((prev) => {
      // only set defaults once (don’t overwrite user toggles)
      if (Object.keys(prev).length > 0) return prev;

      const next: Record<string, boolean> = {};
      const groups = new Set<string>();
      for (const m of matches) groups.add(groupLabel(m.group));
      for (const g of groups) next[g] = isDesktop;
      return next;
    });
  }, [matches]);

  const grouped = useMemo(() => {
    const groupMap = new Map<string, Match[]>(); // GROUP_A, GROUP_B...
    const stageMap = new Map<string, Match[]>(); // Round of 16, Quarter-finals...
  
    for (const m of matches) {
      // Group stage
      if (m.group && m.group.startsWith("GROUP_")) {
        const arr = groupMap.get(m.group) ?? [];
        arr.push(m);
        groupMap.set(m.group, arr);
        continue;
      }
  
      // Knockout (or anything else)
      // football-data usually provides stage via "stage" — if you don't have it in your Match type,
      // we fall back to "Knockout"
      const stageName = (m as any).stage ?? "Knockout";
      const arr = stageMap.get(stageName) ?? [];
      arr.push(m);
      stageMap.set(stageName, arr);
    }
  
    // Sort matches by kickoff time inside each bucket
    for (const arr of groupMap.values()) {
      arr.sort((a, b) => +new Date(a.utcDate) - +new Date(b.utcDate));
    }
    for (const arr of stageMap.values()) {
      arr.sort((a, b) => +new Date(a.utcDate) - +new Date(b.utcDate));
    }
  
    // Sort group keys A, B, C...
    const groupEntries = Array.from(groupMap.entries()).sort((a, b) =>
      sortGroupKey(a[0]).localeCompare(sortGroupKey(b[0]))
    );
  
// Sort knockout stages in correct tournament order
const stageOrder = [
  "LAST_32",
  "LAST_16",
  "QUARTER_FINALS",
  "SEMI_FINALS",
  "THIRD_PLACE",
  "FINAL",
  "KNOCKOUT",
];

const stageEntries = Array.from(stageMap.entries()).sort((a, b) => {
  const aKey = (a[0] ?? "").toString().toUpperCase().trim();
  const bKey = (b[0] ?? "").toString().toUpperCase().trim();

  const ai = stageOrder.indexOf(aKey);
  const bi = stageOrder.indexOf(bKey);

  const aRank = ai === -1 ? 999 : ai;
  const bRank = bi === -1 ? 999 : bi;

  if (aRank !== bRank) return aRank - bRank;
  return aKey.localeCompare(bKey);
});

  
    return { groupEntries, stageEntries };
  }, [matches]);
  
  
  return (
    <div className="space-y-6">
      {/* GROUP STAGE */}
      {grouped.groupEntries.map(([groupKey, groupMatches]) => {
        const label = groupLabel(groupKey);
  
        // teams derived from fixtures (dedupe TBD properly)
        const teamSet = new Set<string>();
        for (const m of groupMatches) {
          teamSet.add(displayTeam(m.homeTeam));
          teamSet.add(displayTeam(m.awayTeam));
        }
        const teams = Array.from(teamSet).sort((a, b) => a.localeCompare(b));
  
        const table = computeTable(groupMatches, teams);
  
        return (
          <section
            key={groupKey}
           className="rounded-2xl border-2 border-white/60 bg-emerald-900/35 shadow-lg p-5 sm:p-6"
          >
            <div className="text-sm font-extrabold text-white">{label}</div>
  
            {/* TABLE */}
            <div className="mt-3 overflow-hidden rounded-xl ring-1 ring-white/10">
              <div className="bg-emerald-950/40 px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-white/60">
                Table
              </div>
  
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-emerald-950/25 text-[11px] font-bold text-white/60">
                    <tr>
                      <th className="px-3 py-2 text-left">Team</th>
                      <th className="px-2 py-2 text-right tabular-nums">P</th>
                      <th className="px-2 py-2 text-right tabular-nums">W</th>
                      <th className="px-2 py-2 text-right tabular-nums">D</th>
                      <th className="px-2 py-2 text-right tabular-nums">L</th>
                      <th className="px-2 py-2 text-right tabular-nums">GD</th>
                      <th className="px-3 py-2 text-right tabular-nums">Pts</th>
                    </tr>
                  </thead>
  
                  <tbody className="divide-y divide-white/10">
                    {table.map((r) => (
                      <tr key={r.team} className="text-white">
                        <td className="px-3 py-2 font-semibold">{r.team}</td>
                        <td className="px-2 py-2 text-right tabular-nums text-white/90">{r.P}</td>
                        <td className="px-2 py-2 text-right tabular-nums text-white/90">{r.W}</td>
                        <td className="px-2 py-2 text-right tabular-nums text-white/90">{r.D}</td>
                        <td className="px-2 py-2 text-right tabular-nums text-white/90">{r.L}</td>
                        <td className="px-2 py-2 text-right tabular-nums text-white/90">{r.GD}</td>
                        <td className="px-3 py-2 text-right tabular-nums font-extrabold text-emerald-200">
                          {r.Pts}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
  
         {/* FIXTURES (accordion) */}
         <details className="fixtures-accordion mt-4 rounded-xl ring-1 ring-white/10 overflow-hidden">

  <summary className="cursor-pointer select-none bg-emerald-950/30 px-3 py-2 flex items-center justify-between">
    <span className="text-[11px] font-extrabold uppercase tracking-wide text-white">
      Fixtures
    </span>
    <span className="fixtures-arrow text-white font-extrabold transition-transform duration-200">
  ▾
</span>


  </summary>

  <div className="p-3 space-y-2">
    {groupMatches.map((m) => {
      const date = new Date(m.utcDate);

      const usDate = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/New_York",
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(date);

      const usTime = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/New_York",
        hour: "numeric",
        minute: "2-digit",
      }).format(date);

      const home = displayTeam(m.homeTeam);
      const away = displayTeam(m.awayTeam);

      return (
        <div
          key={m.id}
          className="rounded-xl bg-emerald-900/60 p-3 ring-1 ring-white/10"
        >
          <div className="text-[11px] font-semibold text-white/60">
            {usDate} · {usTime} (Local Time){" "}
            {m.status === "FINISHED" ? "· FT" : ""}
          </div>

          <div className="mt-1 flex items-center justify-between gap-3 text-white">
            <div className="min-w-0 flex-1 font-semibold truncate">{home}</div>

            <div className="shrink-0 font-bold tabular-nums">
              {m.score.fullTime.home ?? "–"} : {m.score.fullTime.away ?? "–"}
            </div>

            <div className="min-w-0 flex-1 font-semibold truncate text-right">
              {away}
            </div>
          </div>
        </div>
      );
    })}
  </div>
</details>

<style jsx>{`
  details.fixtures-accordion[open] .fixtures-arrow {
    transform: rotate(180deg);
  }
`}</style>


            {/* IMPORTANT: keep this inside the group section */}
            {/* ... */}
          </section>
        );
      })}
  
      {/* KNOCKOUT (completely separate - NOT inside group map) */}
      {grouped.stageEntries.length ? (
        <div className="space-y-6">
          {grouped.stageEntries.map(([stageName, stageMatches]) => {
            return (
              <section
                key={stageName}
               className="rounded-2xl border-2 border-white/60 bg-emerald-900/35 shadow-lg p-5 sm:p-6"
              >
              <div className="text-sm font-extrabold text-white">
  {stageLabel(stageName)}
</div>

  
                <div className="mt-4 space-y-2">
                  <div className="text-[11px] font-extrabold uppercase tracking-wide text-white">
                    Fixtures
                  </div>
  
                  {stageMatches.map((m) => {
                    const date = new Date(m.utcDate);
  
                    const usDate = new Intl.DateTimeFormat("en-US", {
                      timeZone: "America/New_York",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }).format(date);
  
                    const usTime = new Intl.DateTimeFormat("en-US", {
                      timeZone: "America/New_York",
                      hour: "numeric",
                      minute: "2-digit",
                    }).format(date);
  
                    const home = displayTeam(m.homeTeam);
                    const away = displayTeam(m.awayTeam);
  
                    return (
                      <div
                        key={m.id}
                        className="rounded-xl bg-emerald-900/60 p-3 ring-1 ring-white/10"
                      >
                        <div className="text-[11px] font-semibold text-white/60">
                          {usDate} · {usTime} (Local Time){" "}
                          {m.status === "FINISHED" ? "· FT" : ""}
                        </div>
  
                        <div className="mt-1 flex items-center justify-between gap-3 text-white">
                          <div className="min-w-0 flex-1 font-semibold truncate">
                            {home}
                          </div>
  
                          <div className="shrink-0 font-bold tabular-nums">
                            {m.score.fullTime.home ?? "–"} : {m.score.fullTime.away ?? "–"}
                          </div>
  
                          <div className="min-w-0 flex-1 font-semibold truncate text-right">
                            {away}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      ) : null}
    </div>
  );}

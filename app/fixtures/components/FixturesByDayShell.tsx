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
  status: string; // "SCHEDULED" | "TIMED" | "IN_PLAY" | "FINISHED" etc
  stage?: string | null; // may exist depending on API response
  group: string | null;  // "GROUP_A" etc (or null for knockout)
  homeTeam: Team | null;
  awayTeam: Team | null;
  score: {
    fullTime: { home: number | null; away: number | null };
  };
};

function displayTeam(t?: Team | null) {
  return t?.name || t?.shortName || t?.tla || "TBD";
}

function groupLabel(group: string | null) {
  if (!group) return "Knockout";
  if (group.startsWith("GROUP_")) return `Group ${group.replace("GROUP_", "")}`;
  return group;
}

function stageLabel(stage?: string | null, group?: string | null) {
  // Prefer stage if present; otherwise infer from group
  const s = stage ?? (group ? "GROUP_STAGE" : "KNOCKOUT");

  switch (s) {
    case "GROUP_STAGE":
      return "Group Stage";
    case "LAST_16":
    case "ROUND_OF_16":
      return "Last 16";
    case "QUARTER_FINALS":
      return "Quarter Finals";
    case "SEMI_FINALS":
      return "Semi Finals";
    case "THIRD_PLACE":
      return "Third Place";
    case "FINAL":
      return "Final";
    case "KNOCKOUT":
      return "Knockout";
    default:
      // prettify fallback like "ROUND_OF_16" -> "Round Of 16"
      return s
        .toLowerCase()
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
  }
}

function formatUsDateTime(utcDate: string) {
  const d = new Date(utcDate);

  const date = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);

  const time = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);

  return { date, time };
}

function scoreLabel(m: Match) {
  if (m.status === "FINISHED") return "FT";
  if (m.status === "IN_PLAY") return "LIVE";
  if (m.status === "PAUSED") return "HT";
  return ""; // remove "TIMED"/"SCHEDULED" noise as requested
}

type DayGroup = {
  dayKey: string;          // YYYY-MM-DD in ET
  dayLabel: string;        // "Sat, Jun 15, 2026"
  matches: Match[];
};

export default function FixturesByDayShell() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

 // accordion open state (multiple days)
const [openDayKeys, setOpenDayKeys] = useState<Set<string>>(() => new Set());


  useEffect(() => {
    fetch("/api/fixtures")
      .then((r) => r.json())
      .then((data) => setMatches(data.matches ?? []))
      .finally(() => setLoading(false));
  }, []);

  const days = useMemo<DayGroup[]>(() => {
    const map = new Map<string, DayGroup>();

    for (const m of matches) {
      // Convert to ET day bucket
      const d = new Date(m.utcDate);
      const dayKey = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/New_York",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(d); // gives YYYY-MM-DD in en-CA

      const dayLabel = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/New_York",
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(d);

      if (!map.has(dayKey)) {
        map.set(dayKey, { dayKey, dayLabel, matches: [] });
      }
      map.get(dayKey)!.matches.push(m);
    }

    // sort matches within each day by kickoff time
    for (const g of map.values()) {
      g.matches.sort(
        (a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime()
      );
    }

    // sort days chronologically
    const out = Array.from(map.values()).sort((a, b) =>
      a.dayKey.localeCompare(b.dayKey)
    );

    // default: open the first day (or keep prior selection)
    return out;
  }, [matches]);

  useEffect(() => {
    if (days.length === 0) return;
  
    // open the first day once, but don't close anything else
    setOpenDayKeys((prev) => {
      if (prev.size > 0) return prev;
      const next = new Set(prev);
      next.add(days[0].dayKey);
      return next;
    });
  }, [days]);
  

  if (loading) {
    return <div className="text-white/70 text-sm">Loading fixtures…</div>;
  }

  if (days.length === 0) {
    return <div className="text-white/70 text-sm">No fixtures found.</div>;
  }

  return (
    <div className="space-y-4">
      {days.map((day) => {
       const isOpen = openDayKeys.has(day.dayKey);


        return (
            <section
            key={day.dayKey}
            className="rounded-2xl bg-emerald-900/35 ring-2 ring-white/30 shadow-lg overflow-hidden"

          >
          
            {/* Accordion header */}
            <button
              type="button"
              className="w-full px-4 py-3 flex items-center justify-between"
              onClick={() =>
                setOpenDayKeys((prev) => {
                  const next = new Set(prev);
                  if (next.has(day.dayKey)) next.delete(day.dayKey);
                  else next.add(day.dayKey);
                  return next;
                })
              }
              
            >
              <div className="text-left">
                <div className="text-sm font-extrabold text-white">
                  {day.dayLabel}
                </div>
                
              </div>

              <div className="flex items-center">
  <span
    className={`text-white font-extrabold transition-transform ${
      isOpen ? "rotate-180" : "rotate-0"
    }`}
    aria-hidden="true"
  >
    ▾
  </span>
</div>

            </button>

            {/* Accordion body */}
            {isOpen ? (
              <div className="px-4 pb-4 space-y-2">
                {day.matches.map((m) => {
                  const home = displayTeam(m.homeTeam);
                  const away = displayTeam(m.awayTeam);

                  const { time } = formatUsDateTime(m.utcDate);
                  const statusTag = scoreLabel(m);

                  // Helpful sublabel: Group A / Knockout / etc
                  const metaLeft = m.group ? groupLabel(m.group) : stageLabel(m.stage, m.group);

                  return (
                    <div
                      key={m.id}
                      className="rounded-xl bg-emerald-900/60 p-3 ring-1 ring-white/10"
                    >
                     <div className="text-[11px] font-semibold text-white/60">
  <div className="min-w-0 truncate">
    {metaLeft} <span className="mx-1 text-white/40">·</span>{" "}
    {time} <span className="text-white/50">(Local Time)</span>
    {statusTag ? (
      <>
        <span className="mx-1 text-white/40">·</span>
        <span className="text-white/70">{statusTag}</span>
      </>
    ) : null}
  </div>
</div>


                      <div className="mt-1 flex items-center justify-between gap-3 text-white">
                        <div className="min-w-0 flex-1 font-semibold truncate">
                          {home}
                        </div>

                        <div className="shrink-0 font-extrabold tabular-nums">
                          {m.score.fullTime.home ?? "–"} :{" "}
                          {m.score.fullTime.away ?? "–"}
                        </div>

                        <div className="min-w-0 flex-1 font-semibold truncate text-right">
                          {away}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";


import WhoScoredScoreboard from "./WhoScoredScoreboard";
import type { WhoScoredPlayerGoalGroup as PlayerGoalGroup } from "../../../lib/getWhoScoredPuzzle";


type Props = {
  puzzleId: string;
  difficulty: "easy" | "hard";
  isDev: boolean;

  matchName: string;
  matchDate: string;
  stageName: string;

  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  isAET: boolean;

  homeGoals: PlayerGoalGroup[];
  awayGoals: PlayerGoalGroup[];
};

export default function WhoScoredShell({
  puzzleId,
  difficulty,
  isDev,
  matchName,
  matchDate,
  stageName,
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  isAET,
  homeGoals,
  awayGoals,
}: Props) {
  // Temporary local state so the page renders.
  // We'll replace this with Missing-11-style persistence + guessing next.
  const storageKey = `whoscored:${difficulty}:${puzzleId}`;
  const [activePlayerId, setActivePlayerId] = useState<string | null>(null);
  const [sheetValue, setSheetValue] = useState("");
  const [sheetShake, setSheetShake] = useState(false);


  function getActiveScorer() {
    if (!activePlayerId) return null;
    const all = [...homeGoals, ...awayGoals];
    return all.find((g) => g.player_id === activePlayerId) ?? null;
  }

  function formatDisplayName(name: string) {
    if (!name) return "";
    return name[0].toUpperCase() + name.slice(1).toLowerCase();
  }
  
  

  type PersistedWhoScoredState = {
    players: Record<
      string,
      {
        // Mobile sheet state
        status: "idle" | "correct" | "revealed";
        hintUsed: boolean;
        pointsAwarded: number | null;
  
        // Desktop box state (from WhoScoredGuessBox)
        boxState?: any;
      }
    >;
  };
  
  
  const [persisted, setPersisted] = useState<PersistedWhoScoredState>({
    players: {},
  });
      
  
  
  
  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      const parsed = raw ? JSON.parse(raw) : null;
  
      const players =
        parsed && typeof parsed === "object" && typeof parsed.players === "object"
          ? parsed.players
          : {};
  
      setPersisted({ players });
    } catch {
      setPersisted({ players: {} });
    } finally {
      setIsHydrated(true);
    }
  }, [storageKey]);
  
    

  function getPlayerState(playerId: string) {
    return persisted.players?.[playerId] ?? {
      status: "idle" as const,
      hintUsed: false,
      pointsAwarded: null as number | null,
    };
  }

  function setPlayerBoxState(playerId: string, boxState: any) {
    setPersisted((prev) => ({
      ...prev,
      players: {
        ...(prev.players ?? {}),
        [playerId]: {
          ...getPlayerState(playerId),
          boxState,
        },
      },
    }));
  }
  
  
  function setPlayerState(
    playerId: string,
    next: {
      status: "idle" | "correct" | "revealed";
      hintUsed: boolean;
      pointsAwarded: number | null;
    }
  ) {
    setPersisted((prev) => ({
      ...prev,
      players: {
        ...prev.players,
        [playerId]: next,
      },
    }));
  }
  
  function markHintUsed(playerId: string) {
    const s = getPlayerState(playerId);
    if (s.hintUsed) return;
  
    setPlayerState(playerId, {
      ...s,
      hintUsed: true,
    });
  }
  
  function markRevealed(playerId: string) {
    const s = getPlayerState(playerId);
    if (s.status === "correct" || s.status === "revealed") return;
  
    setPlayerState(playerId, {
      ...s,
      status: "revealed",
      pointsAwarded: 0,
    });
  }
  
  function markCorrect(playerId: string) {
    const s = getPlayerState(playerId);
    if (s.status === "correct") return;
  
    setPlayerState(playerId, {
      ...s,
      status: "correct",
      pointsAwarded: s.hintUsed ? 1 : 2, // temporary: we’ll align scoring next
    });
  }
  
  // ---- Active flags (derived from map state) ----
  const activeState = activePlayerId ? getPlayerState(activePlayerId) : null;
  
  const activeIsSolved = activeState?.status === "correct";
  const activeIsRevealed = activeState?.status === "revealed";
  const activeIsHinted = activeState?.hintUsed === true;
  const activeIsLocked = activeIsSolved || activeIsRevealed;
  

useEffect(() => {
    if (!activePlayerId) return;
  
    const scorer = getActiveScorer();
    if (!scorer) return;
  
    // If already locked (solved/revealed), show full surname in the input
    if (activeIsLocked) {
      setSheetValue(scorer.family_name);
      return;
    }
  
    // If hint was used, force the first letter into the input
    if (activeIsHinted) {
      const trimmed = scorer.family_name.trim();
      const first = trimmed ? trimmed[0] : "";
      if (first) setSheetValue(first.toUpperCase());
      return;
    }
  
    // Otherwise start blank
    setSheetValue("");
  }, [activePlayerId, activeIsHinted, activeIsLocked]);
  


  
useEffect(() => {
    if (!isHydrated) return;
  
    try {
      localStorage.setItem(storageKey, JSON.stringify(persisted));
    } catch {
      // ignore quota/write errors
    }
  }, [storageKey, persisted, isHydrated]);
  
  
  function normalizeText(s: string) {
    return s
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .replace(/[’‘`´]/g, "'")
      .replace(/[‐-‒–—−]/g, "-")
      .replace(/\s+/g, " ");
  }
  
  function submitActiveScorer() {
    const scorer = getActiveScorer();
    if (!scorer) return;
  
    const guess = normalizeText(sheetValue);
    const correct = normalizeText(scorer.family_name);
  
    if (!guess) return;
  
    if (guess === correct) {
        markCorrect(scorer.player_id);

        // DO NOT close sheet — keep it open like Missing 11
      } else {
      
        setSheetShake(false);
        requestAnimationFrame(() => setSheetShake(true));
      
        window.setTimeout(() => {
          setSheetShake(false);
        }, 400);
      }
      
  }
  function hintActiveScorer() {
    const scorer = getActiveScorer();
    if (!scorer) return;
    if (!activePlayerId) return;
  
    if (activeIsLocked) return;      // can't hint if solved/revealed
    if (activeIsHinted) return;      // only once
  
    markHintUsed(activePlayerId);
  
    const trimmed = scorer.family_name.trim();
    const first = trimmed ? trimmed[0] : "";
    if (first) {
      setSheetValue(first.toUpperCase());
    }
  }
  
  function revealActiveScorer() {
    if (!activePlayerId) return;
    if (activeIsLocked) return; // already solved/revealed
  
    markRevealed(activePlayerId);
  }
  
  const withSolvedFlag = (goals: PlayerGoalGroup[]) =>
    goals.map((g) => ({
      ...g,
      isSolved: getPlayerState(g.player_id).status === "correct",
      isRevealed: getPlayerState(g.player_id).status === "revealed",
    }));

    const playerStatesForScoreboard: Record<string, any> = {};
for (const [playerId, p] of Object.entries(persisted.players ?? {})) {
  if (p?.boxState) playerStatesForScoreboard[playerId] = p.boxState;
}

  

  return (
    <main className="bg-emerald-800 p-6 flex flex-col gap-3 min-h-screen text-white">
      <a
        href="/"
        className="mb-2 inline-block text-sm font-semibold text-emerald-200 hover:text-white transition underline"
      >
        ← Back to Home
      </a>

      <div className="mx-auto w-full max-w-4xl">
        {/* Header card */}
        <header className="w-full rounded-2xl bg-emerald-900/90 p-4 shadow-lg ring-2 ring-white/80">
          <div className="flex flex-col gap-2">
            <div className="text-lg sm:text-xl font-semibold tracking-tight text-white">
              Who Scored?
            </div>

            <div className="text-sm font-semibold text-white/80">
              {matchDate.slice(0, 4)}
              <span className="mx-1 text-gray-400">·</span>
              {matchName}
              <span className="mx-1 text-gray-400">·</span>
              {stageName}
            </div>

            <div className="mt-2 flex items-center gap-2">
              <a
                href="/who-scored"
                className="inline-flex w-fit items-center justify-center rounded-xl border border-white/70 bg-white/10 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15 active:scale-[0.99]"
              >
                Switch
              </a>
            </div>

            {isDev ? (
  <div className="mt-3 space-y-2">
    <div className="text-sm font-semibold text-emerald-200">
      DEV MODE enabled — {difficulty.toUpperCase()} — {puzzleId}
    </div>

    {isDev && activePlayerId ? (
  <div className="mt-2 text-xs font-semibold text-white/70">
    Active scorer: {activePlayerId}
  </div>
) : null}


    <button
      type="button"
      className="inline-flex w-fit items-center justify-center rounded-xl border border-white/70 bg-white/10 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15 active:scale-[0.99]"
      onClick={() => {
        const firstHome = homeGoals[0]?.player_id;
        if (!firstHome) return;

        markCorrect(firstHome);

      }}
    >
      Dev: Mark first home scorer solved
    </button>
  </div>
) : null}

          </div>
        </header>

        {/* Scoreboard */}
        <div className="mt-4">
          <WhoScoredScoreboard
            homeTeam={homeTeam}
            awayTeam={awayTeam}
            homeScore={homeScore}
            awayScore={awayScore}
            isAET={isAET}
            homeGoals={withSolvedFlag(homeGoals)}
            awayGoals={withSolvedFlag(awayGoals)}
            onScorerTap={(playerId) => {
                setActivePlayerId(playerId);
                setSheetValue("");
                setSheetShake(false);
              }}
              playerStates={playerStatesForScoreboard}
onPlayerStateChange={(playerId, state) => setPlayerBoxState(playerId, state)}

              


          />
        </div>
      </div>
      {/* Mobile bottom sheet scaffold (Who Scored) */}
<div
  className={`fixed inset-0 z-50 sm:hidden transition-opacity duration-300 ${
    activePlayerId ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
  }`}
>
  {/* backdrop */}
  <button
    type="button"
    aria-label="Close scorer sheet"
    className="fixed inset-0 z-50 bg-black/50"
    onClick={() => setActivePlayerId(null)}
  />

  {/* sheet */}
  <div className="fixed bottom-0 left-0 right-0 z-[60] h-[70svh] rounded-t-3xl bg-white p-4 shadow-2xl">
    <div className="flex items-center justify-between">
      <div className="text-sm font-semibold text-gray-900">Scorer entry</div>
      <button
        type="button"
        className="rounded-xl bg-gray-100 px-3 py-1.5 text-sm font-semibold text-gray-900"
        onClick={() => setActivePlayerId(null)}
      >
        Close
      </button>
    </div>

    {(() => {
      const scorer = getActiveScorer();
      if (!scorer) {
        return <div className="mt-4 text-sm text-gray-600">Unknown scorer</div>;
      }

      const minutesLabel = (scorer.minutes ?? [])
        .map((m) => `${m.label}${m.isOG ? " OG" : ""}${m.isPen ? " PEN" : ""}`)
        .join(", ");

        const masked = scorer.family_name.replace(/\p{L}/gu, "-");

        function applyTypedToMask(mask: string, typed: string) {
          const chars = mask.split("");
          let ti = 0;
        
          for (let i = 0; i < chars.length; i++) {
            if (chars[i] === "-") {
              const next = typed[ti];
              if (!next) break;
              chars[i] = ti === 0 ? next.toUpperCase() : next.toLowerCase();

              ti += 1;
            }
          }
        
          return chars.join("");
        }
        
        const typedOverlay = applyTypedToMask(masked, sheetValue);
        
        const sheetDisplayName = activeIsSolved
  ? formatDisplayName(scorer.family_name)
  : typedOverlay;

        

      return (
        <>
          <div className="mt-6 flex flex-col items-center text-center gap-3">
            {/* Shirt icon */}
            <div className="relative h-24 w-24">
              <svg
                viewBox="0 0 64 64"
                className="h-full w-full scale-y-[0.85] text-emerald-900"
                aria-hidden="true"
              >
                <path
                  fill="currentColor"
                  d="M22 10c2.2 3.2 6 5.2 10 5.2S39.8 13.2 42 10l8 4.4c1.6.9 2.3 2.9 1.4 4.5l-4.2 7.5c-.6 1.1-1.9 1.7-3.1 1.4l-3.1-.7V54c0 2.2-1.8 4-4 4H27c-2.2 0-4-1.8-4-4V27.6l-3.1.7c-1.2.3-2.5-.3-3.1-1.4l-4.2-7.5c-.9-1.6-.2-3.6 1.4-4.5L22 10z"
                />
              </svg>
            </div>

            {/* Masked surname */}
            <div className="text-2xl font-extrabold tracking-[0.4em] text-gray-900">
            {sheetDisplayName}
            </div>

            {/* Minutes */}
            <div className="text-xs font-bold text-gray-600">{minutesLabel}</div>
          </div>

          {/* Placeholder input (we'll wire guessing next) */}
          <div className="mt-6">
          <div className="mt-6">
          {!activeIsLocked ? (

    <>
      <div className={`${sheetShake ? "sheet-shake" : ""}`}>
        <input
          className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-base font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          placeholder="Enter surname"
          value={sheetValue}
          onChange={(e) => {
            const next = e.target.value;
          
            // If hint was used, prevent deleting the first letter
            if (activeIsHinted) {
              const scorer = getActiveScorer();
              const first = scorer?.family_name?.trim()?.[0];
              if (first) {
                const required = first.toUpperCase();
                if (next.length < required.length) return;
                if (!next.toUpperCase().startsWith(required)) return;
              }
            }
          
            setSheetValue(next);
          }}
          
          readOnly={false}
        />
      </div>

      <button
        type="button"
        className="mt-4 w-full rounded-2xl bg-emerald-700 py-3 text-base font-bold text-white shadow active:scale-[0.99]"
        onClick={submitActiveScorer}
      >
        Submit
      </button>
      <div className="mt-3 grid grid-cols-2 gap-3">
  <button
    type="button"
    className="w-full rounded-2xl bg-gray-100 py-3 text-base font-bold text-gray-900 active:scale-[0.99]"
    onClick={hintActiveScorer}
    disabled={activeIsLocked || activeIsHinted}
  >
    Hint
  </button>

  <button
    type="button"
    className="w-full rounded-2xl bg-gray-100 py-3 text-base font-bold text-gray-900 active:scale-[0.99]"
    onClick={revealActiveScorer}

    disabled={activeIsLocked}
  >
    Reveal
  </button>
</div>

    </>
  ) : (
    <div className="mt-6 rounded-2xl bg-gray-50 px-4 py-5 text-center text-base font-bold text-gray-900">
      <span className="text-emerald-700">+1pt ✅</span>
    </div>
  )}
</div>

          </div>
        </>
      );
    })()}
  </div>

  <style jsx>{`
  .sheet-shake {
    animation: sheetShake 0.4s;
  }

  @keyframes sheetShake {
    0% { transform: translateX(0); }
    15% { transform: translateX(-3px); }
    30% { transform: translateX(3px); }
    45% { transform: translateX(-2px); }
    60% { transform: translateX(2px); }
    75% { transform: translateX(-1px); }
    100% { transform: translateX(0); }
  }
`}</style>



</div>

    </main>
  );
}

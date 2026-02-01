"use client";

import { useEffect, useState } from "react";
import HowToPlayModal from "../../components/HowToPlayModal";




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
  const [showCompletion, setShowCompletion] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const howToKey = `howto:who-scored:${difficulty}`;
  
  async function handleShare() {
    const url = `${window.location.origin}/who-scored?difficulty=${difficulty}&puzzleId=${puzzleId}`;
    const shareScore = finalScore ?? totals.score;

    const allStates = allScorerIds.map((id) => getPlayerState(id));

  

    const text = [
      `I scored ${shareScore} on World Cup Who Scored! ⚽️`,
      `Can you do better?`,
      `Play here now!`,
    ].join("\n");

    // 1) Native share
    if (navigator.share) {
      try {
        await navigator.share({
          title: "World Cup Who Scored",
          text,
          url,
        });
        return;
      } catch (err: any) {
        if (err?.name === "AbortError") return;
      }
    }

    // 2) Clipboard
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard");
      return;
    } catch {}

    // 3) iOS fallback
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.top = "0";
      ta.style.left = "0";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      alert("Copied to clipboard");
    } catch {}
  }


  function getActiveScorer() {
    if (!activePlayerId) return null;
    const all = [...homeGoals, ...awayGoals];
    return all.find((g) => g.player_id === activePlayerId) ?? null;
  }

  function formatDisplayName(name: string) {
    if (!name) return "";
    return name[0].toUpperCase() + name.slice(1).toLowerCase();
  }
  
  function toBoxState(playerId: string) {
    const p = getPlayerState(playerId);
    const scorer = [...homeGoals, ...awayGoals].find((g) => g.player_id === playerId);
  
    const surname = scorer?.family_name?.trim() ?? "";
    const first = surname ? surname[0].toUpperCase() : "";
  
    return {
      value: p.hintUsed ? first : "",
      status: p.status === "correct" ? ("correct" as const) : ("idle" as const),
      pointsAwarded: p.pointsAwarded ?? null,
      hintUsed: p.hintUsed,
      firstLetterRevealed: p.hintUsed ? first : null,
      revealed: p.status === "revealed",
    };
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
      
  useEffect(() => {
    if (typeof window === "undefined") return;
  
    // show once per device per difficulty
    const seen = localStorage.getItem(howToKey);
    if (!seen) {
      setShowHowToPlay(true);
      localStorage.setItem(howToKey, "1");
    }
  }, [howToKey]);
  
  
  
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

    const allScorerIds = [
    ...homeGoals.map((g) => g.player_id),
    ...awayGoals.map((g) => g.player_id),
  ];

  function isLockedState(s: ReturnType<typeof getPlayerState>) {
    return s.status === "correct" || s.status === "revealed";
  }

  const completion = {
    score: allScorerIds.reduce(
      (sum, id) => sum + (getPlayerState(id).pointsAwarded ?? 0),
      0
    ),
    resolvedCount: allScorerIds.filter((id) => isLockedState(getPlayerState(id))).length,
    total: allScorerIds.length,
  };
  
  const isComplete =
    completion.resolvedCount === completion.total && completion.total > 0;
  


  function setPlayerBoxState(playerId: string, boxState: any) {
    setPersisted((prev) => {
      const existing = prev.players?.[playerId] ?? {
        status: "idle" as const,
        hintUsed: false,
        pointsAwarded: null as number | null,
      };
  
      return {
        ...prev,
        players: {
          ...(prev.players ?? {}),
          [playerId]: {
            ...existing,
            boxState,
          },
        },
      };
    });
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
  
    const next = {
      ...s,
      hintUsed: true,
    };
  
    setPlayerState(playerId, next);
    setPlayerBoxState(playerId, toBoxState(playerId));
  }
  
  
  function markRevealed(playerId: string) {
    const s = getPlayerState(playerId);
    if (s.status === "correct" || s.status === "revealed") return;
  
    const next = {
      ...s,
      status: "revealed" as const,
      pointsAwarded: 0,
    };
  
    setPlayerState(playerId, next);
    setPlayerBoxState(playerId, toBoxState(playerId));
  }
  
  
  function markCorrect(playerId: string) {
    const s = getPlayerState(playerId);
    if (s.status === "correct") return;
  
    const next = {
      ...s,
      status: "correct" as const,
      pointsAwarded: s.hintUsed ? 5 : 10,
    };
  
    setPlayerState(playerId, next);
    setPlayerBoxState(playerId, toBoxState(playerId));
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

  useEffect(() => {
    if (!isHydrated) return;

    if (isComplete) {
        setFinalScore(completion.score);

      setShowCompletion(true);
    }
  }, [isHydrated, isComplete, completion.score]);

  
  
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

    const allPlayerIds = [...homeGoals, ...awayGoals].map((g) => g.player_id);

const totals = allPlayerIds.reduce(
  (acc, playerId) => {
    const s = getPlayerState(playerId);
    const pts = typeof s.pointsAwarded === "number" ? s.pointsAwarded : 0;

    acc.score += pts;
    if (s.status === "correct") acc.solved += 1;
    if (s.status === "revealed") acc.revealed += 1;

    return acc;
  },
  { score: 0, solved: 0, revealed: 0 }
);

const totalAnswers = allPlayerIds.length;
const completedAnswers = completion.resolvedCount;



    const allScorers = [...homeGoals, ...awayGoals];
    for (const g of allScorers) {
      const p = persisted.players?.[g.player_id];
    
      // Prefer real boxState if present (desktop input)
      // but if the sheet has solved/revealed/hint state, override with that
      const sheetDerived = toBoxState(g.player_id);
    
      if (p?.boxState) {
        playerStatesForScoreboard[g.player_id] = {
          ...p.boxState,
          // sheet is the source of truth for solved/revealed/points/hint
          status: sheetDerived.status,
          revealed: sheetDerived.revealed,
          pointsAwarded: sheetDerived.pointsAwarded,
          hintUsed: sheetDerived.hintUsed,
          firstLetterRevealed: sheetDerived.firstLetterRevealed,
          // keep value from boxState (what they typed) unless sheet forced a hint
          value: sheetDerived.hintUsed ? sheetDerived.value : p.boxState.value,
        };
      } else {
        playerStatesForScoreboard[g.player_id] = sheetDerived;
      }
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
  <div className="flex items-start justify-between gap-4">

  {showCompletion ? (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
    {/* background overlay */}
    <button
      type="button"
      aria-label="Close completion modal"
      className="absolute inset-0 bg-black/50"
      onClick={() => setShowCompletion(false)}
    />

    {/* modal card */}
    <div className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white p-5 shadow-xl">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-lg font-bold text-gray-900">Completed! 🎉</div>
        </div>

        <button
          type="button"
          className="rounded-xl bg-gray-100 px-3 py-1.5 text-sm font-extrabold text-gray-900 hover:bg-gray-200 transition"
          onClick={() => {
            setShowCompletion(false);

            if (isDev) {
              // OPTIONAL (dev reset): if you want, clear LS + reset state here
              // localStorage.removeItem(storageKey);
              // setPersisted({ players: {} });
              // setFinalScore(null);
            }
          }}
        >
          Close
        </button>
      </div>

      <div className="mt-6 text-center">
        <div className="text-sm font-medium text-gray-600">Today’s score</div>

        <div className="relative mt-3 inline-flex items-center justify-center rounded-3xl bg-blue-50 px-8 py-4">
          <span className="text-5xl font-semibold leading-none tracking-tight text-green-600 tabular-nums">
            {finalScore ?? completion.score}
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-2">
        <button
          type="button"
          className="w-full rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition active:scale-[0.99] hover:bg-emerald-600"
          onClick={handleShare}
        >
          Share
        </button>
      </div>

      {isDev ? (
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-900">
          Dev mode: Close can optionally reset this puzzle for replay.
        </div>
      ) : null}
    </div>
  </div>
) : null}


    {/* LEFT COLUMN */}
    <div className="flex min-w-0 flex-col gap-2">
      <div className="text-lg sm:text-xl font-semibold tracking-tight text-white">
        Who Scored?
      </div>

      <div className="text-sm font-semibold text-white/80 break-words">
        {matchDate.slice(0, 4)}
        <span className="mx-1 text-gray-400">·</span>
        {matchName}
        <span className="mx-1 text-gray-400">·</span>
        {stageName}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
  <a
    href="/who-scored"
    className="inline-flex items-center justify-center rounded-xl border border-white/70 bg-white/10 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15 active:scale-[0.99]"
  >
    Switch
  </a>

  <button
    type="button"
    onClick={() => setShowHowToPlay(true)}
    className="inline-flex items-center justify-center rounded-xl border border-white/70 bg-white/10 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15 active:scale-[0.99]"
  >
    How to play
  </button>
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

 {/* RIGHT COLUMN — SCORE (Missing 11 style) */}
{/* Right: score (Missing 11 exact style) */}
<div className="flex justify-end">
  <div className="flex h-16 w-20 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-900/90 to-emerald-700/80 ring-2 ring-white/70">
    <div className="text-sm font-bold leading-none text-white/90 uppercase tracking-wide">
      Score
    </div>

    <div className="mt-1 text-xl font-bold leading-none text-emerald-200 tabular-nums">
      {isHydrated ? totals.score : 0}
    </div>
  </div>
</div>
</div>
{!isDev && isHydrated && isComplete ? (
  <div className="mt-3 px-2 text-sm font-bold text-white">
    Completed for today — come back tomorrow for a new puzzle.
  </div>
) : null}

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
              onPlayerStateChange={(playerId, boxState) => {
                // always store the desktop boxState
                setPlayerBoxState(playerId, boxState);
              
                // ALSO sync to the canonical player state used for totals/completion
                setPersisted((prev) => {
                  const current =
                    prev.players?.[playerId] ?? {
                      status: "idle" as const,
                      hintUsed: false,
                      pointsAwarded: null as number | null,
                    };
              
                  const nextStatus =
                    boxState?.revealed === true
                      ? ("revealed" as const)
                      : boxState?.status === "correct"
                      ? ("correct" as const)
                      : ("idle" as const);
              
                  // Prefer the boxState points if present (it should be 10/5/0 now)
                  const nextPoints =
                    nextStatus === "correct"
                      ? (typeof boxState?.pointsAwarded === "number"
                          ? boxState.pointsAwarded
                          : current.pointsAwarded)
                      : nextStatus === "revealed"
                      ? 0
                      : current.pointsAwarded;
              
                  const next = {
                    ...current,
                    status: nextStatus,
                    hintUsed: boxState?.hintUsed === true ? true : current.hintUsed,
                    pointsAwarded: nextPoints,
                    boxState, // keep boxState here too so everything is in one place
                  };
              
                  // no-op if nothing actually changed
                  if (
                    current.status === next.status &&
                    current.hintUsed === next.hintUsed &&
                    current.pointsAwarded === next.pointsAwarded &&
                    current.boxState === next.boxState
                  ) {
                    return prev;
                  }
              
                  return {
                    ...prev,
                    players: {
                      ...(prev.players ?? {}),
                      [playerId]: next,
                    },
                  };
                });
              }}
              

              


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
      {activeIsSolved ? (
        <span className="text-emerald-700">
          +{activeState?.pointsAwarded ?? 10}pts ✅
        </span>
      ) : (
        <span className="text-gray-700">
          0pts 👁️
        </span>
      )}
    </div>
  )
  }
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

<HowToPlayModal
  open={showHowToPlay}
  onClose={() => setShowHowToPlay(false)}
  game="who-scored"
/>


    </main>
  );
}

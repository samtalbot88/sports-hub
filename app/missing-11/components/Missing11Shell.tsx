"use client";

import { useEffect, useRef, useState } from "react";


import Missing11Game from "./Missing11Game";

type PlayerRow = {
  player_id: string;
  family_name: string;
  shirt_number: string;
};

type Formation = {
  GK: PlayerRow[];
  DF: PlayerRow[];
  MF: PlayerRow[];
  FW: PlayerRow[];
};

type Props = {
    teamName: string;
    matchDate: string;
    matchName: string;
    formation: Formation;
    puzzleId: string;
    difficulty: "easy" | "hard";
    isDev: boolean;
  };
  
  

  export default function Missing11Shell({
    teamName,
    matchDate,
    matchName,
    formation,
    puzzleId,
    difficulty,
    isDev,
  }: Props) {

    function maskSurname(name: string) {
      // keeps spaces + hyphens, masks letters as "-"
      return name.replace(/\p{L}/gu, "-");
    }
    
    function getPlayerById(id: string | null) {
      if (!id) return null;
      const all = [...formation.GK, ...formation.DF, ...formation.MF, ...formation.FW];
      return all.find((p) => p.player_id === id) ?? null;
    }
    
  
  
  const [score, setScore] = useState(0);
  const [resolvedCount, setResolvedCount] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);
  const [activePlayerId, setActivePlayerId] = useState<string | null>(null);
  const [persistedPlayers, setPersistedPlayers] = useState<Record<string, any>>({});
  const [sheetValue, setSheetValue] = useState("");
  const [submitNonce, setSubmitNonce] = useState<number>(0);
  const [revealNonce, setRevealNonce] = useState<number>(0);
  const [hintNonce, setHintNonce] = useState<number>(0);
  const [isSheetOpening, setIsSheetOpening] = useState(false);
  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const scrollYRef = useRef(0);
  const activeState =
  activePlayerId ? persistedPlayers[activePlayerId] : null;
  const [sheetShake, setSheetShake] = useState(false);

  useEffect(() => {
    if (!activePlayerId) return;
    if (activeState?.status === "wrong") {
      setSheetShake(false);
    
      requestAnimationFrame(() => {
        setSheetShake(true);
      });
    }
    
  
    const t = window.setTimeout(() => {
      setSheetShake(false);
    }, 400);
  
    return () => window.clearTimeout(t);
  }, [activePlayerId, activeState?.status]);
  
  useEffect(() => {
    if (!submitNonce) return;
    if (!activePlayerId) return;
  
    const s = persistedPlayers[activePlayerId];
    if (s?.status !== "wrong") return;
  
    // retrigger shake every submit that results in "wrong"
    setSheetShake(false);
    requestAnimationFrame(() => setSheetShake(true));
  }, [submitNonce, activePlayerId, persistedPlayers]);
  
  

useEffect(() => {
  // Only run for the mobile sheet
  if (!isSheetVisible) return;
  if (typeof window === "undefined") return;
  if (window.innerWidth >= 640) return; // sm+

  // Save current scroll position and lock body scroll
  scrollYRef.current = window.scrollY;

  const body = document.body;
  body.style.position = "fixed";
  body.style.top = `-${scrollYRef.current}px`;
  body.style.left = "0";
  body.style.right = "0";
  body.style.width = "100%";

  return () => {
    // Unlock body scroll
    body.style.position = "";
    body.style.top = "";
    body.style.left = "";
    body.style.right = "";
    body.style.width = "";

    // Always return to top after closing (your requirement)
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  };
}, [isSheetVisible]);


  useEffect(() => {
    if (!activePlayerId) return;
  
    // start from hidden (down), then animate up next frame
    setIsSheetOpening(true);
    requestAnimationFrame(() => setIsSheetOpening(false));
  }, [activePlayerId]);


  useEffect(() => {
    if (!isHydrated) return;
  
    if (resolvedCount === 11) {
      setFinalScore(score);
      setShowCompletion(true);
    }
  }, [isHydrated, resolvedCount, score]);

  const activePersisted = activePlayerId ? persistedPlayers[activePlayerId] : null;


  useEffect(() => {
    if (!activePlayerId) return;
  
    const state = activePersisted;
    const player =
      [...formation.GK, ...formation.DF, ...formation.MF, ...formation.FW]
        .find((p) => p.player_id === activePlayerId);
  
    if (!player) return;
  
    // revealed or correct → show full name
    if (state && (state.revealed || state.status === "correct")) {
      setSheetValue(player.family_name);
      return;
    }

 
    
  
    // hint → show first letter
    if (state?.firstLetterRevealed && typeof state.firstLetterRevealed === "string") {
      setSheetValue(state.firstLetterRevealed);
      return;
    }
    
  
    // otherwise restore typed value
    setSheetValue(state?.value ?? "");
  }, [activePlayerId, activePersisted, formation]);

  
  
  
  
  const [gameKey, setGameKey] = useState(0);
  const [finalScore, setFinalScore] = useState<number | null>(null);

  const activePlayer =
  activePlayerId
    ? [...formation.GK, ...formation.DF, ...formation.MF, ...formation.FW]
        .find((p) => p.player_id === activePlayerId)
    : null;



const isRevealed = activeState?.revealed === true;
const isCorrect = activeState?.status === "correct";
const isLocked = isRevealed || isCorrect;
// Sheet name display (step 1): default to masked surname for now
// Sheet name display: show full name once correct or revealed, otherwise masked
const sheetDisplayName = activePlayer
  ? (isLocked ? activePlayer.family_name : maskSurname(activePlayer.family_name))
  : "";




  
  

  async function handleShare() {
    const url = `${window.location.origin}/missing-11?difficulty=${difficulty}&puzzleId=${puzzleId}`;
    const shareScore = finalScore ?? score;
  
    const playerIdsInOrder = [
      ...formation.GK.map((p) => p.player_id),
      ...formation.DF.map((p) => p.player_id),
      ...formation.MF.map((p) => p.player_id),
      ...formation.FW.map((p) => p.player_id),
    ];
  
    const all = playerIdsInOrder.map((id) => persistedPlayers[id]);
  
    const emojiLine = all
      .map((s: any) => {
        if (s?.revealed === true) return "🟥";
        if (s?.status === "correct" && s?.hintUsed === true) return "🟨";
        if (s?.status === "correct") return "🟩";
        return "⬜";
      })
      .join("");
  
    // Wordle-ish copy
    const text = [
      `I scored ${shareScore} on World Cup Missing 11! ⚽️`,
      `Can you do better?`,
      `Play here now!`,
    ].join("\n");
    
    
  
    // 1) Try native share first
if (navigator.share) {
  try {
    await navigator.share({
      title: "World Cup Missing 11",
      text,   // <-- NO raw URL in here
      url,    // <-- link lives here
    });

    return; // shared successfully
  } catch (err: any) {
    console.log("Native share failed:", {
      name: err?.name,
      message: err?.message,
      err,
    });

    // User cancelled share sheet (Wordle-style: do nothing)
    if (err?.name === "AbortError") return;
    // otherwise fall through to clipboard
  }
}

  
    // 2) Clipboard fallback (NO prompt)
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard"); // keep for now; we can swap to a toast next
      return;
    } catch (err) {
      // 3) Last-resort clipboard fallback that works more often on iOS
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
  }
  
  
  
  
  
  function closeSheet() {
    // slide down first
    setIsSheetOpen(false);
  
    // after animation completes, hide + clear active id
    window.setTimeout(() => {
      setIsSheetVisible(false);
      setActivePlayerId(null);
      (document.activeElement as HTMLElement | null)?.blur(); // dismiss keyboard
    window.scrollTo({ top: 0, behavior: "smooth" });        // back to top
    }, 300); // must match duration-300 below
  }
  

  
  

  return (
    <main className="bg-emerald-800 p-6 flex flex-col gap-3">
<a
  href="/"
  className="mb-2 inline-block text-sm font-semibold text-emerald-200 hover:text-white transition underline"
>
  ← Back to Home
</a>



<header className="mx-auto w-full max-w-4xl rounded-2xl bg-emerald-900/90 p-4 shadow-lg ring-2 ring-white/80">

  <div className="flex flex-col gap-3">
    {/* Row 1: title + score */}
    <div className="grid grid-cols-[1fr_auto] items-start gap-x-3">
      {/* Left: title */}
      <div className="min-w-0">
      <div className="text-lg sm:text-xl font-semibold tracking-tight text-white">

          {matchDate.slice(0, 4)}
          <span className="mx-1 text-gray-400">·</span>
          {matchName}
          <span className="mx-1 text-gray-400">·</span>
          Group Stage
          <span className="mx-1 text-gray-400">·</span>
          {teamName}
        </div>
        {/* Desktop actions */}
<div className="mt-2 hidden sm:flex items-center gap-2">
  <a
    href="/missing-11"
    className="inline-flex w-fit items-center justify-center rounded-xl border border-white/70 bg-white/10 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15 active:scale-[0.99]"

  >
    Switch
  </a>

  <button
    type="button"
    onClick={handleShare}
    className="inline-flex w-fit items-center justify-center rounded-xl border border-white/70 bg-emerald-700 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 active:scale-[0.99]"



  >
    Share
  </button>
</div>

      </div>

      {/* Right: score */}
      <div className="flex justify-end">
      <div className="flex h-16 w-20 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-900/90 to-emerald-700/80 ring-2 ring-white/70">


      <div className="text-sm font-bold leading-none text-white/90 uppercase tracking-wide">
  Score
</div>

<div className="mt-1 text-xl font-bold leading-none text-emerald-200 tabular-nums">
  {score}
</div>

        </div>
      </div>
    </div>

    {/* Row 2: actions */}
 {/* Mobile actions */}
<div className="flex items-center gap-2 sm:hidden">
  <a
    href="/missing-11"
    className="inline-flex w-fit items-center justify-center rounded-xl border border-white/70 bg-white/10 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15 active:scale-[0.99]"

  >
    Switch
  </a>

  <button
    type="button"
    onClick={handleShare}
    className="inline-flex w-fit items-center justify-center rounded-xl border border-white/70 bg-emerald-700 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 active:scale-[0.99]"

  >
    Share
  </button>
</div>

  </div>

  {!isDev && isHydrated && resolvedCount === 11 ? (
    <div className="text-xs text-gray-600">
      Completed for today — come back tomorrow for a new puzzle.
    </div>
  ) : null}
</header>

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
      <div className="text-lg font-bold">Completed! 🎉</div>

      <div className="mt-6 text-center">
        <div className="text-sm font-medium text-gray-600">Today’s score</div>

        <div className="relative mt-3 inline-flex items-center justify-center rounded-3xl bg-blue-50 px-8 py-4">
          <span className="text-5xl font-semibold leading-none tracking-tight text-green-600 tabular-nums">
            {finalScore ?? score}
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-2">
        <button
          type="button"
          className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition active:scale-[0.99] hover:bg-blue-700"
          onClick={handleShare}
        >
          Share
        </button>

        <button
          type="button"
          className="w-full rounded-2xl bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-900 transition active:scale-[0.99] hover:bg-gray-200"
          onClick={() => {
            setShowCompletion(false);

            if (isDev) {
              // reset for replay in dev mode
              setResolvedCount(0);
              setScore(0);
              setFinalScore(null);
              setGameKey((k) => k + 1);
              localStorage.removeItem(`missing11:${difficulty}:${puzzleId}`);
            }
          }}
        >
          Close
        </button>
      </div>

      {isDev ? (
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-900">
          Dev mode: Close resets this puzzle for replay.
        </div>
      ) : null}
    </div>
  </div>
) : null}

{/* Mobile bottom sheet scaffold */}
<div
  className={`fixed inset-0 z-50 sm:hidden transition-opacity duration-300 ${
    activePlayerId
      ? "opacity-100 pointer-events-auto"
      : "opacity-0 pointer-events-none"
  }`}
>

    {/* backdrop */}
    <button
      type="button"
      aria-label="Close player sheet"
      className="fixed inset-0 z-50 bg-black/50 sm:hidden"
      onClick={closeSheet}

    />

    {/* sheet */}
    <div
  className={`fixed bottom-0 left-0 right-0 z-[60] h-[70svh] rounded-t-3xl bg-white p-4 shadow-2xl sm:hidden
    transform transition-transform duration-200 ease-out
    ${isSheetOpening ? "translate-y-full" : "translate-y-0"}

  `}
>


      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-gray-900">Player entry</div>
        <button
          type="button"
          className="rounded-xl bg-gray-100 px-3 py-1.5 text-sm font-semibold text-gray-900"
          onClick={closeSheet}

        >
          Close
        </button>
      </div>

    

      {(() => {
  const p = getPlayerById(activePlayerId);
  if (!p) {
    return (
      <div className="mt-3 text-sm text-gray-600">
        Unknown player
      </div>
    );
  }

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
  
          <div className="absolute inset-0 flex items-center justify-center text-xl font-extrabold text-white tabular-nums">
            {p.shirt_number}
          </div>
        </div>
  
       {/* Masked surname */}
<div className="text-2xl font-extrabold tracking-[0.4em] text-gray-900">
  {sheetDisplayName}
</div>

      </div>
  
      {!isLocked ? (
  <>

      {/* Input */}
      <div className={`mt-6 ${sheetShake ? "sheet-shake" : ""}`}>
        <input
          className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-base font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          placeholder="Enter surname"
          value={sheetValue}
          onChange={(e) => {
            const next = e.target.value;
          
            // If hint was used, prevent deleting the first letter in the sheet UI
            if (activeState?.hintUsed === true && typeof activeState?.firstLetterRevealed === "string") {
              if (next.length < activeState.firstLetterRevealed.length) return;
            }
          
            setSheetValue(next);
          }}
          
          disabled={isLocked}
          readOnly={isLocked}
        />
      </div>
  
      {/* ✅ SUBMIT BUTTON — THIS IS THE EXACT PLACE */}
      <button
  type="button"
  className="mt-4 w-full rounded-2xl bg-emerald-700 py-3 text-base font-bold text-white shadow active:scale-[0.99]"
  onClick={() => setSubmitNonce((n) => n + 1)}
>
  Submit
</button>


      <div className="mt-3 grid grid-cols-2 gap-3">
  <button
    type="button"
    className="w-full rounded-2xl bg-gray-100 py-3 text-base font-bold text-gray-900 active:scale-[0.99]"
    onClick={() => {
      setHintNonce((n) => n + 1);
    }}
  >
    Hint
  </button>

  <button
    type="button"
    className="w-full rounded-2xl bg-gray-100 py-3 text-base font-bold text-gray-900 active:scale-[0.99]"
    onClick={() => {
      setRevealNonce((n) => n + 1);
    }}
  >
    Reveal
  </button>
</div>

</>
) : null}
{isLocked ? (
  <div className="mt-6 rounded-2xl bg-gray-50 px-4 py-5 text-center text-base font-bold text-gray-900">
    {isCorrect ? (
  <span className="text-emerald-700">
    +{activeState?.pointsAwarded ?? 0}pts ✅
  </span>
) : (
  <span className="text-gray-700">
    0pts 👁️
  </span>
)}

  </div>
) : null}


    </>
  );
  
})()}
    </div>
    <style jsx>{`
  .sheet-shake {
    animation: sheetShake 0.4s;
  }

  @keyframes sheetShake {
    0% {
      transform: translateX(0);
    }
    15% {
      transform: translateX(-3px);
    }
    30% {
      transform: translateX(3px);
    }
    45% {
      transform: translateX(-2px);
    }
    60% {
      transform: translateX(2px);
    }
    75% {
      transform: translateX(-1px);
    }
    100% {
      transform: translateX(0);
    }
  }
`}</style>

    </div>




<Missing11Game
  key={gameKey}
  teamName={teamName}
  matchName={matchName}
  formation={formation}
  puzzleId={puzzleId}
  difficulty={difficulty}
  onScoreChange={setScore}
  onResolvedOne={() => setResolvedCount((c) => c + 1)}
  onResolvedCountChange={(count) => {
    setResolvedCount(count);
    setIsHydrated(true);
  }}  
  onPersistedPlayersChange={(players) => {
    // Safety: ensure we only store the inner map { [player_id]: state }
    setPersistedPlayers(players && typeof players === "object" ? players : {});
  }}
  
  disabled={!isDev && (!isHydrated || resolvedCount === 11)}
  onMobilePlayerTap={(playerId) => setActivePlayerId(playerId)}
  submitActivePlayerId={activePlayerId}
  submitActiveValue={sheetValue}
  submitActiveNonce={submitNonce}
  revealActivePlayerId={activePlayerId}
  revealActiveNonce={revealNonce}
  hintActivePlayerId={activePlayerId}
  hintActiveNonce={hintNonce}

/>
     


    </main>
  );
}

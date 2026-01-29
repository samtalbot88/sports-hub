"use client";

import { useEffect, useRef, useState } from "react";

import { getWordleCupStorageKey, getWordleCupStreakKey } from "../../../lib/wordleCupStorage";



type LetterState = "correct" | "present" | "absent";

type Tile = {
  letter: string;
  state: LetterState;
};

type GuessRow = {
  tiles: Tile[];
};

export default function WordleCupGame({
    answer,
    puzzleId,
    difficulty,
    isDev,
    countryName,
    onCompleteChange,
  }: {
    answer: string;
    puzzleId: string;
    difficulty: "easy" | "hard";
    isDev: boolean;
    countryName: string;
    onCompleteChange?: (complete: boolean) => void;
  }) {
  
  
  
  const [guesses, setGuesses] = useState<GuessRow[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const storageKey = getWordleCupStorageKey({ difficulty, puzzleId });
  const streakKey = getWordleCupStreakKey({ difficulty });
  const [resultRecorded, setResultRecorded] = useState(false);
  const resultRecordedRef = useRef(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [revealRowIndex, setRevealRowIndex] = useState<number | null>(null);
  const [revealNonce, setRevealNonce] = useState(0);
  const [revealedCols, setRevealedCols] = useState<number[]>([]);
  const [keyboardFreeze, setKeyboardFreeze] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const committedKeyboardStatesRef = useRef<Map<string, "correct" | "present" | "absent">>(
    new Map()
    
    
  );
  






  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) {
        setIsHydrated(true);
        return;
      }
      

      const parsed = JSON.parse(raw) as {
        guesses: GuessRow[];
        currentGuess: string;
        isComplete: boolean;
        
        resultRecorded?: boolean;
      };
      

      if (Array.isArray(parsed.guesses)) setGuesses(parsed.guesses);
      if (typeof parsed.currentGuess === "string") setCurrentGuess(parsed.currentGuess);
      if (typeof parsed.isComplete === "boolean") setIsComplete(parsed.isComplete);
      if (typeof parsed.isComplete === "boolean") onCompleteChange?.(parsed.isComplete);
      if (typeof parsed.resultRecorded === "boolean") setResultRecorded(parsed.resultRecorded);
      resultRecordedRef.current = Boolean(parsed.resultRecorded);
      setIsHydrated(true);




    } catch {
        setIsHydrated(true);

      // ignore corrupted storage
    }
  }, [storageKey]);

  useEffect(() => {
    if (!isHydrated) return;

    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
            guesses,
            currentGuess,
            isComplete,
            resultRecorded,
          })
          
      );
    } catch {
      // ignore quota / write errors
    }
}, [storageKey, guesses, currentGuess, isComplete, resultRecorded, isHydrated]);



  useEffect(() => {
    try {
      const raw = localStorage.getItem(streakKey);
      if (!raw) return;

      const parsed = JSON.parse(raw) as { current: number; best: number };
      if (typeof parsed.current === "number") setCurrentStreak(parsed.current);
      if (typeof parsed.best === "number") setBestStreak(parsed.best);
    } catch {
      // ignore
    }
  }, [streakKey]);

  useEffect(() => {
    try {
      localStorage.setItem(
        streakKey,
        JSON.stringify({
          current: currentStreak,
          best: bestStreak,
        })
      );
    } catch {
      // ignore
    }
  }, [streakKey, currentStreak, bestStreak]);



  function evaluateGuess(guess: string, answer: string): Tile[] {
    const g = guess.split("");
    const a = answer.split("");
  
    // First pass: mark correct (green) and count remaining letters in answer
    const result: Tile[] = g.map((ch) => ({ letter: ch, state: "absent" }));
    const remainingCounts = new Map<string, number>();
  
    for (let i = 0; i < a.length; i++) {
      if (g[i] === a[i]) {
        result[i].state = "correct";
      } else {
        remainingCounts.set(a[i], (remainingCounts.get(a[i]) ?? 0) + 1);
      }
    }
  
    // Second pass: mark present (yellow) if letter exists elsewhere and not already used up
    for (let i = 0; i < a.length; i++) {
      if (result[i].state === "correct") continue;
  
      const ch = g[i];
      const count = remainingCounts.get(ch) ?? 0;
      if (count > 0) {
        result[i].state = "present";
        remainingCounts.set(ch, count - 1);
      }
    }
  
    return result;
  }
  

  function submitGuess() {
    if (isComplete) return;
    if (guesses.length >= 6) return;


    // must be exactly the right length
    if (currentGuess.length !== answer.length) return;

    const tiles = evaluateGuess(currentGuess, answer);
    const isWin = tiles.every((t) => t.state === "correct");
    
    setRevealRowIndex(guesses.length);
setRevealNonce((n) => n + 1);
// Reset which columns are "revealed" for the new submitted row
setRevealedCols([]);
setKeyboardFreeze(true);


// Reveal each column in sync with the flip delay
for (let i = 0; i < answer.length; i++) {
  window.setTimeout(() => {
    setRevealedCols((cols) => (cols.includes(i) ? cols : [...cols, i]));
  }, i * 140 + 180);
}
window.setTimeout(() => {
    setKeyboardFreeze(false);
  }, (answer.length - 1) * 140 + 180 + 420);
  

    setGuesses((prev) => {
      const next = [...prev, { tiles }];
      

    
     
      
    
      return next;
    });
    
    setCurrentGuess("");

    // ✅ Delay completion + modal until AFTER the full flip reveal finishes
const shouldComplete = isWin || guesses.length + 1 >= 6;

if (shouldComplete) {
  const totalFlipTimeMs = (answer.length - 1) * 140 + 180 + 420;

  window.setTimeout(() => {
    setIsComplete(true);
    onCompleteChange?.(true);
    setIsModalOpen(true);

    // Record streak result exactly once per puzzle
    if (!resultRecordedRef.current) {
      if (isWin) {
        setCurrentStreak((s) => {
          const nextStreak = s + 1;
          setBestStreak((b) => Math.max(b, nextStreak));
          return nextStreak;
        });
      } else {
        setCurrentStreak(0);
      }

      resultRecordedRef.current = true;
      setResultRecorded(true);
    }
  }, totalFlipTimeMs);
}

    
  }

  function handleKeyPress(key: string) {
    if (isComplete) return;

    if (key === "DEL") {
      setCurrentGuess((prev) => prev.slice(0, -1));
      return;
    }

    if (key === "ENTER") {
      submitGuess();
      return;
    }

    if (/^[A-Z]$/.test(key)) {
      setCurrentGuess((prev) => {
        if (prev.length >= answer.length) return prev;
        return (prev + key).toUpperCase();
      });
    }
  }
  
  function getKeyboardLetterStates() {
    const map = new Map<string, LetterState>();
  
    for (const row of guesses) {
      for (const tile of row.tiles) {
        const letter = tile.letter;
  
        // Priority: correct > present > absent
        const prev = map.get(letter);
        if (prev === "correct") continue;
  
        if (tile.state === "correct") {
          map.set(letter, "correct");
        } else if (tile.state === "present") {
          if (prev !== "present") map.set(letter, "present");
        } else if (tile.state === "absent") {
          if (!prev) map.set(letter, "absent");
        }
      }
    }
  
    return map;
  }
  
  const computedKeyboardStates = getKeyboardLetterStates();

if (!keyboardFreeze) {
  committedKeyboardStatesRef.current = computedKeyboardStates;
}

const keyboardStates = keyboardFreeze
  ? committedKeyboardStatesRef.current
  : computedKeyboardStates;


  function buildEmojiGrid() {
    
    // Use black squares for unused/empty like Wordle
    // 🟩 correct, 🟨 present, ⬛ absent
    const lines = guesses.map((row) =>
      row.tiles
        .map((t) =>
          t.state === "correct" ? "🟩" : t.state === "present" ? "🟨" : "⬛"
        )
        .join("")
    );
    return lines.join("\n");
  }

  function fallbackCopyTextToClipboard(text: string) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
  
    // Prevent scrolling to bottom on iOS
    textarea.style.position = "fixed";
    textarea.style.top = "0";
    textarea.style.left = "0";
    textarea.style.opacity = "0";
  
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
  
    try {
      document.execCommand("copy");
    } catch {
      // if copy fails, do nothing (no alerts)
    } finally {
      document.body.removeChild(textarea);
    }
  }
  
  
  async function handleShare() {
    const shareUrl = `${window.location.origin}/wordle-cup?difficulty=${difficulty}&puzzleId=${puzzleId}`;
  
    const emojiGrid = buildEmojiGrid();
    const attemptsText = `${guesses.length}/6`;
  
    const lines = [
      `Wordle Cup — ${difficulty.toUpperCase()}`,
      attemptsText,
      "",
      emojiGrid,
      "",
      `🔥 Streak: ${currentStreak}   🏆 Best: ${bestStreak}`,
      "Play here now!",
      shareUrl,
    ];
  
    const text = lines.join("\n");
  
    if (navigator.share) {
      try {
        await navigator.share({ text });
        return;
      } catch (err: any) {
        if (err?.name === "AbortError") return;
      }
    }
  
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        try {
          await navigator.clipboard.writeText(text);
          return;
        } catch {
          // fall through
        }
      }
      
      fallbackCopyTextToClipboard(text);
      
  }
  
  const didWin = guesses.length > 0 && guesses[guesses.length - 1]?.tiles?.every((t) => t.state === "correct");


  return (
    <div className="rounded-2xl border-2 border-white/80 bg-emerald-800/90 p-4 sm:p-6 shadow-lg backdrop-blur-sm space-y-4 sm:space-y-6">


     

{isDev ? (
  <div className="text-sm font-semibold text-emerald-200">
    DEV MODE: {answer}
  </div>
) : null}

{isDev ? (
  <div className="text-[12px] font-semibold text-white/70 break-all">
    storageKey: {storageKey}
  </div>
) : null}




{/* GRID */}
<div className="space-y-2 sm:space-y-3">


  {Array.from({ length: 6 }).map((_, rowIndex) => {
    const isCurrentRow = rowIndex === guesses.length;
    const submittedRow = guesses[rowIndex];

    return (
        <div key={rowIndex} className="flex justify-center gap-2 sm:gap-3 [perspective:900px]">


        {Array.from({ length: answer.length }).map((_, colIndex) => {
          const submittedTile = submittedRow?.tiles?.[colIndex];
          const currentLetter = isCurrentRow ? currentGuess[colIndex] : "";

          const letter = submittedTile?.letter ?? currentLetter ?? "";
          const isAnimatingRevealRow = submittedRow && rowIndex === revealRowIndex;
          const isLetterRevealed = !isAnimatingRevealRow || revealedCols.includes(colIndex);

          // During the flip sequence, only show the evaluated state once that column has been revealed
          const state =
            submittedTile?.state
              ? isAnimatingRevealRow
                ? revealedCols.includes(colIndex)
                  ? submittedTile.state
                  : null
                : submittedTile.state
              : null;
          

          const base =
  "h-12 w-12 sm:h-14 sm:w-14 rounded-lg border-2 flex items-center justify-center font-extrabold text-lg tabular-nums select-none transform-gpu";


          const colors =
            state === "correct"
              ? "bg-emerald-600 border-emerald-300 text-white"
              : state === "present"
              ? "bg-yellow-500 border-yellow-200 text-white"
              : state === "absent"
              ? "bg-white/20 border-white/30 text-white/90"
              : "bg-transparent border-white/40 text-white";

              return (
                <div
                  key={
                    submittedRow && rowIndex === revealRowIndex
                      ? `${colIndex}-${revealNonce}`
                      : `${colIndex}`
                  }
                  className={`${base} ${colors} ${
                    submittedRow && rowIndex === revealRowIndex ? "wordlecup-tile-flip" : ""
                  }`}
                  
                  
                  style={
                    submittedRow && rowIndex === revealRowIndex
                      ? { animationDelay: `${colIndex * 140}ms` }
                      : undefined
                  }
                >
                  {isLetterRevealed && letter ? String(letter).toUpperCase() : ""}

                </div>
              );
              
        })}
      </div>
    );
  })}
</div>


{/* KEYBOARD (UI only for now) */}
<div className="mt-6 mx-auto w-full max-w-[600px] space-y-1 sm:space-y-2">

  {[
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "DEL"],
  ].map((row, rowIdx) => (
    <div
  key={rowIdx}
  className={`flex justify-center gap-1 sm:gap-2 ${
    rowIdx === 1 ? "px-4 sm:px-8" : ""
  }`}
>


      {row.map((key) => {
        const isWide = key === "ENTER" || key === "DEL";
        const state = keyboardStates.get(key);

        const base =
        "h-12 rounded-lg border-2 flex items-center justify-center font-extrabold text-sm sm:text-base select-none transition";
      
      const width = isWide
        ? "w-[72px] sm:w-[96px]"
        : "w-[40px] sm:w-[52px]";
      




        return (
          <button
            key={key}
            type="button"
            className={`${base} ${width} ${
                state === "correct"
                  ? "bg-emerald-600 border-emerald-300 text-white"
                  : state === "present"
                  ? "bg-yellow-500 border-yellow-200 text-white"
                  : state === "absent"
? "bg-gray-500/70 border-gray-400 text-white"

                  : "bg-white/10 border-white/30 text-white"
              }`}
              
            onClick={() => handleKeyPress(key)}

          >
            {key}
          </button>
        );
      })}
    </div>
  ))}
</div>



{isModalOpen ? (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-6">

    {/* Backdrop */}
    <button
      type="button"
      className="absolute inset-0 bg-black/60"
      onClick={() => setIsModalOpen(false)}
      aria-label="Close"
    />

    {/* Modal */}
    <div className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white p-5 shadow-xl">

    <div className="flex items-start justify-between gap-4">
  <div className="min-w-0">
  <div className="text-lg font-bold text-gray-900">

  {didWin ? "You got it!" : "Unlucky!"}
</div>

<div className="mt-1 text-sm font-semibold text-gray-600">
  Answer:{" "}
  <span className="text-gray-900 font-extrabold">
    {answer} ({countryName})
  </span>
</div>

<div className="mt-2 text-sm font-semibold text-gray-600">
  Attempts: {guesses.length}/6
</div>


  </div>

  <button
  type="button"
  className="rounded-xl bg-gray-100 px-3 py-1.5 text-sm font-extrabold text-gray-900 hover:bg-gray-200 transition"
  onClick={() => setIsModalOpen(false)}
>
  Close
</button>

</div>

<div className="mt-6 grid grid-cols-2 gap-3">
  <div className="rounded-2xl bg-gray-100 p-4 text-center">
    <div className="text-2xl font-bold text-gray-900 tabular-nums">
      {currentStreak}
    </div>
    <div className="mt-1 text-xs font-bold uppercase tracking-wide text-gray-600">
      Current streak
    </div>
  </div>

  <div className="rounded-2xl bg-gray-100 p-4 text-center">
    <div className="text-2xl font-bold text-gray-900 tabular-nums">
      {bestStreak}
    </div>
    <div className="mt-1 text-xs font-bold uppercase tracking-wide text-gray-600">
      Best streak
    </div>
  </div>
</div>




<div className="mt-6">
<button
  type="button"
  className="w-full rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition active:scale-[0.99] hover:bg-emerald-600"
  onClick={handleShare}
>
  Share
</button>

</div>

    </div>
  </div>
) : null}

    </div>
  );
<style jsx>{`
  .tile-flip {
    animation: tileFlip 600ms ease both;
    will-change: transform;
  }

  @keyframes tileFlip {
    0% {
      transform: perspective(800px) rotateX(0deg);
    }
    49% {
      transform: perspective(800px) rotateX(90deg);
    }
    50% {
      transform: perspective(800px) rotateX(90deg);
    }
    100% {
      transform: perspective(800px) rotateX(0deg);
    }
  }
`}</style>

  
}

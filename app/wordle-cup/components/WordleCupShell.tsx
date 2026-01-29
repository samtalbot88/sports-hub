"use client";

import { useState } from "react";


type Difficulty = "easy" | "hard";
import WordleCupGame from "./WordleCupGame";


export default function WordleCupShell({
  answer,
  puzzleId,
  difficulty,
  isDev,
  matchName,
  matchDate,
  teamName,

}: {
  answer: string;
  puzzleId: string;
  difficulty: Difficulty;
  isDev: boolean;
  matchName: string;
  matchDate: string;
  teamName: string;
}) {

  const [isComplete, setIsComplete] = useState(false);

  return (
    <main className="bg-emerald-800 p-6 flex flex-col gap-3 min-h-screen text-white">
      <a
        href="/"
        className="mb-2 inline-block text-sm font-semibold text-emerald-200 hover:text-white transition underline"
      >
        ← Back to Home
      </a>
  
      <div className="mx-auto w-full max-w-4xl">
        {/* Header card (like Missing 11) */}
        <header className="w-full rounded-2xl bg-emerald-900/90 p-4 shadow-lg ring-2 ring-white/80">
          <div className="flex flex-col gap-2">
            <div className="text-lg sm:text-xl font-semibold tracking-tight text-white">
              Wordle Cup
            </div>
  
            <div className="text-sm font-semibold text-white/80">
  Guess the player from the {matchDate.slice(0, 4)} World Cup
</div>

<div className="mt-2 flex items-center gap-2">
  <a
   href={`/wordle-cup?puzzleId=${puzzleId}`}

    className="inline-flex w-fit items-center justify-center rounded-xl border border-white/70 bg-white/10 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15 active:scale-[0.99]"
  >
    Switch
  </a>
</div>

  
{!isDev && isComplete ? (
  <div className="mt-3 px-2 text-sm font-bold text-white">
    Completed for today — come back tomorrow for a new puzzle.
  </div>
) : null}

{isDev ? (
  <div className="mt-3 text-sm font-semibold text-emerald-200">
    DEV MODE: Answer is {answer}
  </div>
) : null}

          </div>
        </header>
  
        {/* Game (NOT inside a bordered card) */}
        <div className="mt-4">
        <WordleCupGame
  answer={answer}
  puzzleId={puzzleId}
  difficulty={difficulty}
  isDev={isDev}
  onCompleteChange={setIsComplete}
/>


        </div>
      </div>
    </main>
  );
  
}

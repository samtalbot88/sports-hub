

import { getLineup } from "../../lib/getLineup";
import Missing11Shell from "./components/Missing11Shell";




import Link from "next/link";

function maskSurname(name: string) {
  return name.replace(/[A-Za-zÀ-ÖØ-öø-ÿ]/g, "-");
}


type Difficulty = "easy" | "hard";

export default async function Missing11Page({
  searchParams,
}: {
  searchParams?: {
    difficulty?: string;
    puzzleId?: string;
    dev?: string;
  };
  
  
}) {
  const sp: any = (await (searchParams as any)) ?? {};


  const raw = sp?.difficulty;
  const value = Array.isArray(raw) ? raw[0] : raw;
  const rawPuzzleId = sp?.puzzleId;
const puzzleIdValue = Array.isArray(rawPuzzleId)
  ? rawPuzzleId[0]
  : rawPuzzleId;


  const difficulty =
    value === "easy" || value === "hard" ? (value as Difficulty) : null;
    const puzzleId =
  typeof puzzleIdValue === "string" && puzzleIdValue.length === 10
    ? puzzleIdValue
    : new Date().toISOString().slice(0, 10);

const rawDev = sp?.dev;
const devValue = Array.isArray(rawDev) ? rawDev[0] : rawDev;
const isDev = devValue === "true";




if (!difficulty) {
  return (
    <main className="min-h-screen bg-emerald-900 text-white p-6">
      <div className="mx-auto w-full max-w-4xl space-y-8">

        {/* Header card */}
        <header className="relative overflow-hidden rounded-2xl border-2 border-white/40 bg-emerald-800/40 p-6 backdrop-blur-sm">
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0">
              <h1 className="text-2xl font-extrabold text-white">Missing 11</h1>
              <p className="mt-2 text-sm font-semibold text-white/80">
                Choose your difficulty below to solve today’s lineup
              </p>
            </div>

            {/* right-aligned shirt icon (same style as PlayerBox) */}
            <div className="shrink-0">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-950/50 ring-1 ring-white/20 shadow-lg backdrop-blur-[2px]">
                <svg
                  viewBox="0 0 64 64"
                  className="h-12 w-12 text-white/90"
                  aria-hidden="true"
                >
                  <path
                    fill="currentColor"
                    d="M22 10c2.2 3.2 6 5.2 10 5.2S39.8 13.2 42 10l8 4.4c1.6.9 2.3 2.9 1.4 4.5l-4.2 7.5c-.6 1.1-1.9 1.7-3.1 1.4l-3.1-.7V54c0 2.2-1.8 4-4 4H27c-2.2 0-4-1.8-4-4V27.6l-3.1.7c-1.2.3-2.5-.3-3.1-1.4l-4.2-7.5c-.9-1.6-.2-3.6 1.4-4.5L22 10z"
                  />
                </svg>

                {/* optional “11” number overlay, like the player boxes */}
                <div className="absolute inset-0 flex items-center justify-center text-[12px] font-extrabold text-emerald-950 tabular-nums">
                  11
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Difficulty cards */}
        <section className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/missing-11?difficulty=easy"
            className="rounded-2xl border-2 border-white/40 bg-emerald-800/80 p-6 backdrop-blur-sm transition hover:bg-emerald-700"
          >
            <div className="text-lg font-extrabold text-white">Easy</div>
            <p className="mt-2 text-sm font-semibold text-white/80">
              Big teams • Modern World Cups (2010–2022)
            </p>
            <span className="mt-3 inline-block text-xs font-bold uppercase tracking-wide text-white/60">
              Play Now!
            </span>
          </Link>

          <Link
            href="/missing-11?difficulty=hard"
            className="rounded-2xl border-2 border-white/40 bg-emerald-800/40 p-6 backdrop-blur-sm transition hover:bg-emerald-700/60"
          >
            <div className="text-lg font-extrabold text-white">Hard</div>
            <p className="mt-2 text-sm font-semibold text-white/80">
              Other teams • 1980 onwards
            </p>
            <span className="mt-3 inline-block text-xs font-bold uppercase tracking-wide text-white/60">
              Play Now!
            </span>
          </Link>
        </section>

        <Link href="/" className="inline-flex text-sm font-semibold text-white/80 hover:text-white">
          ← Back to Home
        </Link>
      </div>
    </main>
  );
}


  

  const lineup = getLineup({
    difficulty,
    puzzleId,
  });

 
  
  
  

return (
  <Missing11Shell
    teamName={lineup.team_name}
    matchDate={lineup.match_date}
    matchName={lineup.match_name}
    formation={lineup.formation}
    puzzleId={puzzleId}
    difficulty={difficulty}
    isDev={isDev}


  />
);

}

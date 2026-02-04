

import { getWordleCupAnswer } from "../../lib/getWordleCupAnswer";
import WordleCupShell from "./components/WordleCupShell";






import Link from "next/link";

function maskSurname(name: string) {
  return name.replace(/[A-Za-zÀ-ÖØ-öø-ÿ]/g, "-");
}


type Difficulty = "easy" | "hard";

export default async function WordleCupPage({

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

  const rawDev = sp?.dev;
const devValue = Array.isArray(rawDev) ? rawDev[0] : rawDev;
const isDev = devValue === "true";

  const difficulty =
    value === "easy" || value === "hard" ? (value as Difficulty) : null;
    const today = new Date().toISOString().slice(0, 10);

const puzzleId =
  typeof puzzleIdValue === "string" &&
  puzzleIdValue.length === 10 &&
  (isDev || puzzleIdValue <= today) // block future dates unless dev=true
    ? puzzleIdValue
    : today;







if (!difficulty) {
  return (
    <main className="min-h-screen bg-emerald-900 text-white p-6">
      <a
  href="/"
  className="mb-6 inline-block text-sm font-semibold text-emerald-200 hover:text-white transition underline"
>
  ← Back to Home
</a>

      <div className="mx-auto w-full max-w-4xl space-y-8">

        {/* Header card */}
        <header className="relative overflow-hidden rounded-2xl border-2 border-white/40 bg-emerald-800/40 p-6 backdrop-blur-sm">
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0">
            <h1 className="text-2xl font-extrabold text-white">Wordle Cup</h1>

              <p className="mt-2 text-sm font-semibold text-white/80">
              Choose your difficulty below to solve today’s Wordle Cup challenge

              </p>
            </div>

            {/* right-aligned shirt icon (same style as PlayerBox) */}
            <div className="shrink-0">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-950/50 ring-1 ring-white/20 shadow-lg backdrop-blur-[2px]">
              <svg viewBox="0 0 64 64" className="h-12 w-12" aria-hidden="true">
  {/* Row 1 */}
  <rect x="10" y="12" width="14" height="14" rx="3" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
  <rect x="26" y="12" width="14" height="14" rx="3" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
  <rect x="42" y="12" width="14" height="14" rx="3" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />

  {/* Row 2 */}
  <rect x="10" y="28" width="14" height="14" rx="3" fill="rgba(16,185,129,0.55)" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
  <rect x="26" y="28" width="14" height="14" rx="3" fill="rgba(234,179,8,0.65)" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
  <rect x="42" y="28" width="14" height="14" rx="3" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />

  {/* Row 3 */}
  <rect x="10" y="44" width="14" height="14" rx="3" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
  <rect x="26" y="44" width="14" height="14" rx="3" fill="rgba(16,185,129,0.55)" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
  <rect x="42" y="44" width="14" height="14" rx="3" fill="rgba(234,179,8,0.65)" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
</svg>



               
              </div>
            </div>
          </div>
        </header>

        {/* Difficulty cards */}
        <section className="grid gap-4 sm:grid-cols-2">
        <Link
 href={`/wordle-cup?difficulty=easy&puzzleId=${puzzleId}`}


  className="rounded-2xl border-2 border-white/80 bg-emerald-800/90 p-6 shadow-lg backdrop-blur-sm transition hover:bg-emerald-700"
>
  <div className="text-lg font-extrabold text-white">
    Easy
  </div>

  <p className="mt-2 text-m font-semibold text-white/90">
    Players from major teams • Modern World Cups (2014–2022)
  </p>

  <span className="mt-3 inline-block text-s font-semibold text-emerald-200">
    Play Now!
  </span>
</Link>


<Link
 href={`/wordle-cup?difficulty=hard&puzzleId=${puzzleId}`}


  className="rounded-2xl border-2 border-white/80 bg-emerald-800/90 p-6 shadow-lg backdrop-blur-sm transition hover:bg-emerald-700"
>
  <div className="text-lg font-extrabold text-white">
    Hard
  </div>

  <p className="mt-2 text-m font-semibold text-white/90">
    Players from all other teams • 2010 onwards
  </p>

  <span className="mt-3 inline-block text-s font-semibold text-emerald-200">
    Play Now! 
  </span>
</Link>

        </section>

       
      </div>
    </main>
  );
}


  

const answerData = getWordleCupAnswer({
    difficulty,
    puzzleId,
  });
  

 
  
  
  

  return (
    <WordleCupShell
      answer={answerData.answer}
      puzzleId={answerData.puzzleId}
      difficulty={difficulty}
      isDev={isDev}
      matchName={answerData.match_name}
      matchDate={answerData.match_date}
      teamName={answerData.team_name}
    />
  );
  
  

}

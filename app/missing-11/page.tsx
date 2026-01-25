

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
      <main className="min-h-screen p-6 flex flex-col gap-6">
        <header>
          <h1 className="text-2xl font-bold">Missing 11</h1>
          <p className="mt-2 text-gray-600">
            Choose your difficulty to start today’s lineup.
          </p>
        </header>

        <section className="flex flex-col gap-3">
        <Link className="rounded-xl border p-4 text-left block" href="/missing-11?difficulty=easy">
          <div className="font-semibold">Easy</div>
          <div className="mt-1 text-sm text-gray-600">
           Big teams • Modern World Cups (2010–2022)
          </div>
        </Link>


        <Link className="rounded-xl border p-4 text-left block" href="/missing-11?difficulty=hard">
          <div className="font-semibold">Hard</div>
          <div className="mt-1 text-sm text-gray-600">
            Other teams • 1980 onwards
          </div>
        </Link>

        </section>

        <a href="/" className="text-blue-600 underline">
          ← Back to World Cup Hub
        </a>
      </main>
    );
  }

  

  const lineup = getLineup({
    difficulty,
    puzzleId,
  });

  console.log(
    "RAW LINEUP FROM getLineup():",
    JSON.stringify(lineup, null, 2)
  );
  
  
  

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

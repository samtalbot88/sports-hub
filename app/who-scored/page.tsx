import Link from "next/link";

import { getWhoScoredPuzzle } from "../../lib/getWhoScoredPuzzle";
import WhoScoredShell from "./components/WhoScoredShell";

type Difficulty = "easy" | "hard";

export default async function WhoScoredPage({
  searchParams,
}: {
  searchParams?: {
    difficulty?: string;
    puzzleId?: string;
    dev?: string;
  };
}) {
  const sp: any = (await (searchParams as any)) ?? {};

  const rawDifficulty = sp?.difficulty;
  const difficultyValue = Array.isArray(rawDifficulty) ? rawDifficulty[0] : rawDifficulty;

  const rawPuzzleId = sp?.puzzleId;
  const puzzleIdValue = Array.isArray(rawPuzzleId) ? rawPuzzleId[0] : rawPuzzleId;

  const rawDev = sp?.dev;
  const devValue = Array.isArray(rawDev) ? rawDev[0] : rawDev;
  const isDev = devValue === "true";

  const difficulty =
    difficultyValue === "easy" || difficultyValue === "hard"
      ? (difficultyValue as Difficulty)
      : null;

  const today = new Date().toISOString().slice(0, 10);

  // ✅ Lock puzzleId to today unless dev=true (prevents future puzzle URL edits)
  const puzzleId =
    typeof puzzleIdValue === "string" &&
    puzzleIdValue.length === 10 &&
    (isDev || puzzleIdValue <= today)
      ? puzzleIdValue
      : today;

  // -------------------------
  // Difficulty picker
  // -------------------------
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
          <header className="relative overflow-hidden rounded-2xl border-2 border-white/40 bg-emerald-800/40 p-6 backdrop-blur-sm">
            <div className="flex items-start justify-between gap-6">
              <div className="min-w-0">
                <h1 className="text-2xl font-extrabold text-white">Who Scored?</h1>
                <p className="mt-2 text-sm font-semibold text-white/80">
                  Choose your difficulty to guess today’s goalscorers
                </p>
              </div>

              <div className="shrink-0">
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-950/50 ring-1 ring-white/20 shadow-lg backdrop-blur-[2px]">
                  <span className="text-2xl">⚽️</span>
                </div>
              </div>
            </div>
          </header>

          <section className="grid gap-4 sm:grid-cols-2">
            <Link
              href={`/who-scored?difficulty=easy&puzzleId=${puzzleId}`}
              className="rounded-2xl border-2 border-white/80 bg-emerald-800/90 p-6 shadow-lg backdrop-blur-sm transition hover:bg-emerald-700"
            >
              <div className="text-lg font-extrabold text-white">Easy</div>
              <p className="mt-2 text-m font-semibold text-white/90">
                Major Teams • Modern World Cups (2014–2022)
              </p>
              <span className="mt-3 inline-block text-s font-semibold text-emerald-200">
                Play Now!
              </span>
            </Link>

            <Link
              href={`/who-scored?difficulty=hard&puzzleId=${puzzleId}`}
              className="rounded-2xl border-2 border-white/80 bg-emerald-800/90 p-6 shadow-lg backdrop-blur-sm transition hover:bg-emerald-700"
            >
              <div className="text-lg font-extrabold text-white">Hard</div>
              <p className="mt-2 text-m font-semibold text-white/90">
                Other Teams • 2002 onwards
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

  // -------------------------
  // Game page
  // -------------------------
  const puzzle = getWhoScoredPuzzle({ difficulty, puzzleId });

  return (
    <WhoScoredShell
      puzzleId={puzzle.puzzleId}
      difficulty={difficulty}
      isDev={isDev}
      matchName={puzzle.match_name}
      matchDate={puzzle.match_date}
      stageName={puzzle.stage_name}
      homeTeam={puzzle.home_team_name}
      awayTeam={puzzle.away_team_name}
      homeScore={puzzle.home_score}
      awayScore={puzzle.away_score}
      isAET={puzzle.isAET}
      homeGoals={puzzle.homeGoals}
      awayGoals={puzzle.awayGoals}
    />
  );
}

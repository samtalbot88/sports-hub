import Link from "next/link";

export default function FixturesPage() {
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
              <h1 className="text-2xl font-extrabold text-white">
                World Cup Fixtures
              </h1>
              <p className="mt-2 text-sm font-semibold text-white/80">
                Choose how you want to view the tournament schedule
              </p>
            </div>

            {/* right-aligned calendar-ish icon card (same style as Missing11 header icon) */}
            <div className="shrink-0">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-950/50 ring-1 ring-white/20 shadow-lg backdrop-blur-[2px]">
                {/* Simple calendar icon */}
                <svg
                  viewBox="0 0 24 24"
                  className="h-10 w-10 text-white/90"
                  aria-hidden="true"
                  fill="currentColor"
                >
                  <path d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1.5A2.5 2.5 0 0 1 22 6.5v13A2.5 2.5 0 0 1 19.5 22h-15A2.5 2.5 0 0 1 2 19.5v-13A2.5 2.5 0 0 1 4.5 4H6V3a1 1 0 0 1 1-1zm12.5 8h-15a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h15a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5z" />
                </svg>

                {/* optional overlay like Missing11 "11" */}
                <div className="absolute inset-0 flex items-center justify-center text-[12px] font-extrabold text-emerald-950 tabular-nums">
                  WC
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Picker cards */}
        <section className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/fixtures/groups"
            className="rounded-2xl border-2 border-white/80 bg-emerald-800/90 p-6 shadow-lg backdrop-blur-sm transition hover:bg-emerald-700"
          >
            <div className="text-lg font-extrabold text-white">
              Groups + Knockout
            </div>

            <p className="mt-2 text-m font-semibold text-white/90">
              Group tables with fixtures per group, plus knockout rounds
            </p>

            <span className="mt-3 inline-block text-s font-semibold text-emerald-200">
              View Now!
            </span>
          </Link>

          <Link
            href="/fixtures/by-day"
            className="rounded-2xl border-2 border-white/80 bg-emerald-800/90 p-6 shadow-lg backdrop-blur-sm transition hover:bg-emerald-700"
          >
            <div className="text-lg font-extrabold text-white">
              Fixtures by Day
            </div>

            <p className="mt-2 text-m font-semibold text-white/90">
              A simple day-by-day schedule with collapsible date sections
            </p>

            <span className="mt-3 inline-block text-s font-semibold text-emerald-200">
              View Now!
            </span>
          </Link>
        </section>
      </div>
    </main>
  );
}

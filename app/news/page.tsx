import NewsShell from "../components/NewsShell";


export default function NewsPage() {
  return (
    <main className="bg-emerald-800 min-h-screen p-6 text-white">
      <a
        href="/"
        className="mb-6 inline-block text-sm font-semibold text-emerald-200 hover:text-white transition underline"
      >
        ← Back to Home
      </a>

      <div className="mx-auto max-w-4xl space-y-4">
        <header className="rounded-2xl border-2 border-white/40 bg-emerald-800/40 p-6 backdrop-blur-sm">
        <div className="mb-6 flex items-center justify-between">
  <h1 className="text-xl font-extrabold text-white">
    World Cup News
  </h1>

  <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-950/50 ring-1 ring-white/20 shadow-lg backdrop-blur-[2px]">
    {/* Newspaper Icon */}
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6 text-white/90"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <line x1="7" y1="8" x2="17" y2="8" />
      <line x1="7" y1="12" x2="17" y2="12" />
      <line x1="7" y1="16" x2="13" y2="16" />
    </svg>
  </div>
</div>

          <p className="mt-2 text-sm font-semibold text-white/80">
            Latest headlines for World Cup 2026.
          </p>
        </header>

        <NewsShell />
      </div>
    </main>
  );
}

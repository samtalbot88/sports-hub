import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-emerald-900 text-white">

      {/* HERO */}
      <section className="relative w-full h-[40vh] sm:h-[60vh] overflow-hidden">
  {/* Mobile hero */}
  <img
    src="/hero-world-cup.png"
    alt="World Cup football stadium"
    className="absolute inset-0 h-full w-full object-cover sm:hidden"
  />

  {/* Desktop hero (21:9) */}
  <img
    src="/hero-world-cup-desktop.png"
    alt="World Cup football stadium"
    className="absolute inset-0 h-full w-full object-cover hidden sm:block"
  />



 
</section>


      {/* CONTENT */}
      <div className="mx-auto max-w-6xl px-6 py-12 space-y-14">

        {/* GAMES */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Games</h2>

          <div className="grid gap-4 sm:grid-cols-3">

            {/* LIVE GAME */}
            <Link
  href="/missing-11"
  className="rounded-2xl border-2 border-white/80 bg-emerald-800/90 p-6 shadow-lg backdrop-blur-sm transition hover:bg-emerald-700"
>
  <div className="text-lg font-extrabold text-white">
    Missing 11
  </div>

  <p className="mt-2 text-sm font-semibold text-white/90">
    Guess the full starting 11 from iconic World Cup matches.
  </p>

  <span className="mt-3 inline-block text-xs font-bold uppercase tracking-wide text-emerald-200">
    ● Live
  </span>
</Link>


            {/* COMING SOON */}
            <div className="rounded-2xl border-2 border-white/40 bg-emerald-800/40 p-6 backdrop-blur-sm">
            <div className="text-lg font-extrabold text-white">
  Wordle Cup
</div>

<p className="mt-2 text-sm font-semibold text-white/80">
  Solve the World Cup word challenge to reveal the player.
</p>

<span className="mt-3 inline-block text-xs font-bold uppercase tracking-wide text-white/60">
  Coming soon
</span>

            </div>

            <div className="rounded-2xl border-2 border-white/40 bg-emerald-800/40 p-6 backdrop-blur-sm">

            <div className="text-lg font-extrabold text-white">
  Who Am I?
</div>

<p className="mt-2 text-sm font-semibold text-white/80">
  Guess the player from clues based on their World Cup performances.
</p>

<span className="mt-3 inline-block text-xs font-bold uppercase tracking-wide text-white/60">
  Coming soon
</span>

            </div>
          </div>
        </section>

       {/* NEWS */}
<section>
  <h2 className="text-2xl font-bold mb-6">News</h2>

  <div className="rounded-2xl border-2 border-white/40 bg-emerald-800/40 p-6 backdrop-blur-sm">
    <div className="text-lg font-extrabold text-white">
      World Cup News
    </div>

    <p className="mt-2 text-sm font-semibold text-white/80">
      World Cup news, trivia and interactive content.
    </p>

    <span className="mt-3 inline-block text-xs font-bold uppercase tracking-wide text-white/60">
      Coming soon
    </span>
  </div>
</section>


        {/* FOOTER */}
        <footer className="border-t border-white/10 pt-8 text-sm text-white/60">
          <p>
            World Cup games, football trivia, interactive sports challenges,
            historic lineups, classic matches and fan content.
          </p>

          <p className="mt-2">
            Built for football fans worldwide.
          </p>
        </footer>

      </div>
    </main>
  );
}

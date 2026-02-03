"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";



export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"games" | "news" | "fixtures">("games");


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

  {/* Desktop hero */}
  <img
    src="/hero-world-cup-desktop.png"
    alt="World Cup football stadium"
    className="absolute inset-0 h-full w-full object-cover hidden sm:block"
  />

  {/* dark overlay — desktop only */}
<div className="absolute inset-0 hidden sm:block bg-black/25" />


  {/* TEXT OVERLAY — DESKTOP ONLY */}
<div className="absolute inset-0 hidden sm:flex items-start">
  <div className="mx-auto w-full max-w-6xl px-6 pt-16">
    <h1 className="max-w-xl text-left text-4xl font-extrabold leading-tight text-white drop-shadow-lg">
      World Cup games & content
      <br />
      for fans worldwide
    </h1>
  </div>
</div>


</section>



      {/* CONTENT */}
      <div className="mx-auto max-w-6xl px-6 pt-6 pb-12 space-y-10">


{/* TABS */}
<div className="flex gap-10 mb-10">
  <button
    type="button"
    onClick={() => setActiveTab("games")}
    className={`relative text-2xl font-bold transition ${
      activeTab === "games"
        ? "text-white"
        : "text-white/60 hover:text-white"
    }`}
  >
    Games
    {activeTab === "games" && (
      <span className="absolute left-0 bottom-0 h-[3px] w-full rounded-full bg-white translate-y-full" />

    )}
  </button>

  <button
    type="button"
    onClick={() => setActiveTab("news")}
    className={`relative text-2xl font-bold transition ${
      activeTab === "news"
        ? "text-white"
        : "text-white/60 hover:text-white"
    }`}
  >
    News
    {activeTab === "news" && (
      <span className="absolute left-0 bottom-0 h-[3px] w-full rounded-full bg-white translate-y-full" />

    )}
  </button>

  <button
  type="button"
  onClick={() => setActiveTab("fixtures")}
  className={`relative text-2xl font-bold transition ${
    activeTab === "fixtures"
      ? "text-white"
      : "text-white/60 hover:text-white"
  }`}
  
>
  Fixtures
  {activeTab === "fixtures" && (
      <span className="absolute left-0 bottom-0 h-[3px] w-full rounded-full bg-white translate-y-full" />

    )}
</button>

</div>



     {/* GAMES */}
{activeTab === "games" ? (
<section>

          

          <div className="grid gap-4 sm:grid-cols-3">

            {/* LIVE GAME */}
            <Link
  href="/missing-11"
  className="rounded-2xl border-2 border-white/80 bg-emerald-800/90 p-6 shadow-lg backdrop-blur-sm transition hover:bg-emerald-700"

>
<div className="flex items-center justify-between">
  <div className="text-lg font-extrabold text-white">
    Missing 11
  </div>

  <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-950/50 ring-1 ring-white/20 shadow-lg backdrop-blur-[2px]">
    <svg viewBox="0 0 64 64" className="h-8 w-8 text-white/90" aria-hidden="true">
      <path
        fill="currentColor"
        d="M22 10c2.2 3.2 6 5.2 10 5.2S39.8 13.2 42 10l8 4.4c1.6.9 2.3 2.9 1.4 4.5l-4.2 7.5c-.6 1.1-1.9 1.7-3.1 1.4l-3.1-.7V54c0 2.2-1.8 4-4 4H27c-2.2 0-4-1.8-4-4V27.6l-3.1.7c-1.2.3-2.5-.3-3.1-1.4l-4.2-7.5c-.9-1.6-.2-3.6 1.4-4.5L22 10z"
      />
    </svg>

    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-extrabold text-emerald-950 tabular-nums">
      11
    </div>
  </div>
</div>


  <p className="mt-2 text-sm font-semibold text-white/90">
    Guess the full starting 11 from iconic World Cup matches.
  </p>

  <span className="mt-3 inline-block text-xs font-bold uppercase tracking-wide text-emerald-200">
    ● Live
  </span>
</Link>


<Link
  href="/wordle-cup"
  className="rounded-2xl border-2 border-white/80 bg-emerald-800/90 p-6 shadow-lg backdrop-blur-sm transition hover:bg-emerald-700"
>

<div className="flex items-center justify-between">
  <div className="text-lg font-extrabold text-white">
    Wordle Cup
  </div>

  <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-950/50 ring-1 ring-white/20 shadow-lg backdrop-blur-[2px]">
    <svg viewBox="0 0 64 64" className="h-8 w-8" aria-hidden="true">
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


  <p className="mt-2 text-sm font-semibold text-white/80">
    Solve the World Cup word challenge to reveal the player.
  </p>

  <span className="mt-3 inline-block text-xs font-bold uppercase tracking-wide text-emerald-200">
  ● Live
</span>

</Link>


<Link
  href="/who-scored"
  className="rounded-2xl border-2 border-white/80 bg-emerald-800/90 p-6 shadow-lg backdrop-blur-sm transition hover:bg-emerald-700"
>
  <div className="flex items-center justify-between">
    <div className="text-lg font-extrabold text-white">
      Who Scored?
    </div>

    <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-950/50 ring-1 ring-white/20 shadow-lg backdrop-blur-[2px]">
      <span className="text-xl" aria-hidden="true">⚽️</span>
    </div>
  </div>

  <p className="mt-2 text-sm font-semibold text-white/80">
    Guess the goalscorers from an iconic World Cup fixture.
  </p>

  <span className="mt-3 inline-block text-xs font-bold uppercase tracking-wide text-emerald-200">
    ● Live
  </span>
</Link>

          </div>
          </section>
) : null}


      
{/* NEWS */}
{activeTab === "news" ? (
<section>



  <div className="rounded-2xl border-2 border-white/80 bg-emerald-800/90 p-6 shadow-lg backdrop-blur-sm transition hover:bg-emerald-700">

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
) : null}

{activeTab === "fixtures" ? (
  <section>
  <a
    href="/fixtures"
    className="block rounded-2xl border-2 border-white/80 bg-emerald-800/90 p-6 shadow-lg backdrop-blur-sm transition hover:bg-emerald-700 active:scale-[0.99]"
  >
    <div className="text-lg font-extrabold text-white">
      World Cup Fixtures
    </div>

    <p className="mt-2 text-sm font-semibold text-white/80">
      Match schedules, kick-off times and upcoming World Cup fixtures.
    </p>
  </a>
</section>

) : null}




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

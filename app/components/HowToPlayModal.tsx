"use client";

import { useEffect, useMemo, useRef } from "react";

type GameKey = "missing-11" | "who-scored" | "wordle-cup";

type Section = {
  title: string;
  bullets: string[];
};

type Copy = {
  desktopTitle: string;
  desktopSections: Section[];
  mobileTitle: string;
  mobileSections: Section[];
};

type Props = {
  open: boolean;
  onClose: () => void;
  game: GameKey;
};

function getCopy(game: GameKey): Copy {
  if (game === "who-scored") {
    return {
      desktopTitle: "How to play",
      desktopSections: [
        {
          title: "Guess the goal scorers",
          bullets: [
            "Tap the player's shirt to guess the scorer",
            "Hint (?) reveals the first letter (once),",
            "Reveal (👁️) shows the answer for 0 points.",
          ],
        },
        {
          title: "Scoring",
          bullets: ["10 points correct", "5 points with a hint", "0 points if revealed"],
        },
        {
          title: "Finish",
          bullets: ["Solve all scorers to complete today’s puzzle and share your score."],
        },
      ],
      mobileTitle: "How to play",
      mobileSections: [
        {
          title: "Tap the player's shirt guess the scorer",
          bullets: [
            "Enter the player’s surname.",
            "Tap Submit to check your answer.",
            "Hint for first letter, Reveal for 0 points.",
          ],
        },
        {
          title: "Scoring",
          bullets: ["10 correct · 5 with hint · 0 revealed"],
        },
        {
          title: "Finish",
          bullets: ["Solve everyone to finish and share your score."],
        },
      ],
    };
  }

  if (game === "wordle-cup") {
    return {
      desktopTitle: "How to play",
      desktopSections: [
        {
          title: "Guess the player",
          bullets: [
            "You have limited guesses to find today’s player.",
            "Each guess gives feedback to help you narrow it down.",
            "Keep going until you solve it (or run out of tries).",
          ],
        },
        {
          title: "Finish",
          bullets: ["Solve today’s Wordle Cup and share how you did."],
        },
      ],
      mobileTitle: "How to play",
      mobileSections: [
        {
          title: "Guess the player",
          bullets: [
            "Enter a guess and submit.",
            "Use the feedback to refine your next guess.",
            "Solve it to complete today’s puzzle.",
          ],
        },
        {
          title: "Finish",
          bullets: ["Share your result when you’re done."],
        },
      ],
    };
  }

  // missing-11
  return {
    desktopTitle: "How to play",
    desktopSections: [
      {
        title: "Name the starting XI",
        bullets: [
          "Each shirt represents one starter.",
          "Type the player’s surname and press Enter.",
          "Hint (?) reveals the first letter (once).",
          "Reveal (👁️) shows the answer for 0 points.",
        ],
      },
      {
        title: "Scoring",
        bullets: ["10 points correct", "5 points with a hint", "0 points if revealed"],
      },
      {
        title: "Finish",
        bullets: ["Solve all 11 players to complete today’s puzzle and share your score."],
      },
    ],
    mobileTitle: "How to play",
    mobileSections: [
      {
        title: "Tap the shirt icon to guess the player",
        bullets: [
          "Enter the player’s surname.",
          "Tap Submit to check your answer.",
          "Hint for first letter, Reveal for 0 points.",
        ],
      },
      {
        title: "Scoring",
        bullets: ["10 correct · 5 with hint · 0 revealed"],
      },
      {
        title: "Finish",
        bullets: ["Solve all 11 to finish and share your score."],
      },
    ],
  };
}

function SectionBlock({ title, bullets }: Section) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
      <div className="text-sm font-extrabold text-gray-900">{title}</div>
      <ul className="mt-2 space-y-1.5 text-sm text-gray-700">
        {bullets.map((b) => (
          <li key={b} className="flex gap-2">
            <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600" />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function HowToPlayModal({ open, onClose, game }: Props) {
  const scrollYRef = useRef(0);
  const copy = useMemo(() => getCopy(game), [game]);

  // Mobile scroll lock + return-to-top on close
  useEffect(() => {
    if (!open) return;
    if (typeof window === "undefined") return;

    // Only for mobile (<sm)
    if (window.innerWidth >= 640) return;

    scrollYRef.current = window.scrollY;

    const body = document.body;
    body.style.position = "fixed";
    body.style.top = `-${scrollYRef.current}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";

    return () => {
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";

      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close how to play"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Desktop modal */}
      <div className="hidden sm:flex items-center justify-center p-6">
        <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
          {/* top strip */}
          <div className="bg-gradient-to-br from-emerald-900/90 to-emerald-700/80 p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-lg font-extrabold text-white">{copy.desktopTitle}</div>
                <div className="mt-1 text-xs font-semibold text-white/80">
                  Quick rules · scoring · goal
                </div>
              </div>

              <button
                type="button"
                className="rounded-xl bg-white/10 px-3 py-1.5 text-sm font-extrabold text-white ring-1 ring-white/30 hover:bg-white/15 transition"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>

          <div className="p-5">
            <div className="space-y-3">
              {copy.desktopSections.map((s) => (
                <SectionBlock key={s.title} title={s.title} bullets={s.bullets} />
              ))}
            </div>

            {/* Got it */}
            <div className="mt-5 flex justify-center">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-2xl bg-emerald-700 px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 active:scale-[0.99]"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sheet */}
      <div className="sm:hidden">
        <div className="fixed bottom-0 left-0 right-0 z-[60] h-[72svh] rounded-t-3xl bg-white shadow-2xl overflow-hidden">
          {/* header */}
          <div className="bg-gradient-to-br from-emerald-900/90 to-emerald-700/80 px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-extrabold text-white">{copy.mobileTitle}</div>
              <button
                type="button"
                className="rounded-xl bg-white/10 px-3 py-1.5 text-sm font-semibold text-white ring-1 ring-white/30"
                onClick={onClose}
              >
                Close
              </button>
            </div>
            <div className="mt-1 text-[11px] font-semibold text-white/80">
              Quick rules · scoring · goal
            </div>
          </div>

          {/* content */}
          <div className="h-[calc(72svh-72px)] overflow-auto px-4 py-4">
            <div className="space-y-3">
              {copy.mobileSections.map((s) => (
                <SectionBlock key={s.title} title={s.title} bullets={s.bullets} />
              ))}
            </div>

            {/* Got it */}
            <div className="mt-6 flex justify-center pb-6">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-2xl bg-emerald-700 px-10 py-3 text-base font-bold text-white shadow active:scale-[0.99]"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

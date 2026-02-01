"use client";

import { useEffect, useMemo, useRef } from "react";

type GameKey = "missing-11" | "who-scored";

type Props = {
  open: boolean;
  onClose: () => void;
  game: GameKey;

  // optional: show different copy for desktop vs mobile
  // we auto-render both layouts and Tailwind handles visibility
};

type Section = {
  title: string;
  bullets: string[];
};

function getCopy(game: GameKey) {
  if (game === "who-scored") {
    return {
      desktopTitle: "How to play",
      desktopSections: [
        {
          title: "Guess the goal scorers",
          bullets: [
            "Each shirt represents a player who scored.",
            "Type the player's surname and press Enter.",
            "Hint (?) reveals the first letter (once).",
            "Reveal (👁️) shows the answer for 0 points.",
          ],
        },
        {
          title: "Scoring",
          bullets: [
            "10 points for a correct guess.",
            "5 points if you used a hint.",
            "0 points if you reveal the answer.",
          ],
        },
        {
          title: "Goal",
          bullets: ["Solve all scorers to complete today’s puzzle and share your score."],
        },
      ] as Section[],
      mobileTitle: "How to play",
      mobileSections: [
        {
          title: "Tap a shirt to open entry",
          bullets: [
            "Enter the player's surname.",
            "Dashes fill in as you type.",
            "Tap Submit to check your answer.",
            "Hint for first letter, Reveal for answer",
          ],
        },
        {
          title: "Scoring",
          bullets: ["10 if correct · 5 with a hint · 0 if revealed"],
        },
        {
          title: "Goal",
          bullets: ["Solve all scorers to finish and share your score."],
        },
      ] as Section[],
    };
  }

  // missing-11
  return {
    desktopTitle: "How to play",
    desktopSections: [
      {
        title: "Name the starting XI",
        bullets: [
          "Each shirt represents one player.",
          "Type the player’s surname and press Enter.",
          "Hint (?) reveals the first letter (once).",
          "Reveal (👁️) shows the answer for 0 points.",
        ],
      },
      {
        title: "Scoring",
        bullets: [
          "10 points for a correct guess.",
          "5 points if you used a hint.",
          "0 points if you reveal the answer.",
        ],
      },
      {
        title: "Goal",
        bullets: ["Solve all 11 players to complete today’s puzzle and share your score."],
      },
    ] as Section[],
    mobileTitle: "How to play",
    mobileSections: [
      {
        title: "Tap a shirt to open entry",
        bullets: [
          "Enter the player’s surname.",
          "Name fills in as you type.",
          "Tap Submit to lock in your guess.",
        ],
      },
      {
        title: "Scoring",
        bullets: ["10 correct · 5 with hint · 0 revealed"],
      },
      {
        title: "Goal",
        bullets: ["Solve all 11 players to finish and share your score."],
      },
    ] as Section[],
  };
}

export default function HowToPlayModal({ open, onClose, game }: Props) {
  const scrollYRef = useRef(0);

  const copy = useMemo(() => getCopy(game), [game]);

  // ✅ Mobile sheet behavior: lock scroll + return to top on close
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

      // Match your existing behavior: land back at top after closing
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

      {/* ✅ Desktop modal */}
      <div className="hidden sm:flex items-center justify-center p-6">
        <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-5 shadow-xl">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-lg font-extrabold text-gray-900">
                {copy.desktopTitle}
              </div>
            </div>

            <button
              type="button"
              className="rounded-xl bg-gray-100 px-3 py-1.5 text-sm font-extrabold text-gray-900 hover:bg-gray-200 transition"
              onClick={onClose}
            >
              Close
            </button>
          </div>

          <div className="mt-4 space-y-4">
            {copy.desktopSections.map((s) => (
              <div key={s.title}>
                <div className="text-sm font-bold text-gray-900">{s.title}</div>
                <ul className="mt-1 list-disc pl-5 text-sm text-gray-700 space-y-1">
                  {s.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ✅ Mobile sheet */}
      <div className="sm:hidden">
        <div className="fixed bottom-0 left-0 right-0 z-[60] h-[70svh] rounded-t-3xl bg-white p-4 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="text-sm font-extrabold text-gray-900">{copy.mobileTitle}</div>
            <button
              type="button"
              className="rounded-xl bg-gray-100 px-3 py-1.5 text-sm font-semibold text-gray-900"
              onClick={onClose}
            >
              Close
            </button>
          </div>

          <div className="mt-4 space-y-4 overflow-auto pr-1 h-[calc(70svh-64px)]">
            {copy.mobileSections.map((s) => (
              <div key={s.title}>
                <div className="text-sm font-bold text-gray-900">{s.title}</div>
                <ul className="mt-1 list-disc pl-5 text-sm text-gray-700 space-y-1">
                  {s.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

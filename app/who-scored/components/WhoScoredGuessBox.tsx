"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";




type PlayerBoxPersistedState = {
  value: string;
  status: "idle" | "correct" | "wrong";
  pointsAwarded: number | null;
  hintUsed: boolean;
  firstLetterRevealed: string | null;
  revealed: boolean;
};

export type PlayerBoxHandle = {
  setValue: (next: string) => void;
  submit: () => void;
  hint: () => void;
  reveal: () => void;
};


type PlayerBoxProps = {
  shirtNumber: string;
  maskedName: string;
  answer: string;
  onResolved?: (points: number) => void;
  disabled?: boolean;

  // LocalStorage persistence (optional)
  persistedState?: PlayerBoxPersistedState;
  onStateChange?: (state: PlayerBoxPersistedState) => void;
};

  

  function normalizeText(s: string) {
    return s
      .trim()
      .toLowerCase()
      // remove accents/diacritics (é -> e)
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      // unify apostrophes and hyphens
      .replace(/[’‘`´]/g, "'")
      .replace(/[‐-‒–—−]/g, "-")
      // collapse multiple spaces into one
      .replace(/\s+/g, " ");
  }
  



  const WhoScoredGuessBox = forwardRef<PlayerBoxHandle, PlayerBoxProps>(function WhoScoredGuessBox(

    {
      shirtNumber,
      maskedName,
      answer,
      onResolved,
      disabled,
      persistedState,
      onStateChange,
    },
    ref
  ) {
    
    const [hasMounted, setHasMounted] = useState(false);

useEffect(() => {
  setHasMounted(true);
}, []);

  
const [isEditing, setIsEditing] = useState(false);

useEffect(() => {
  // sm breakpoint in Tailwind is 640px
  setIsEditing(window.innerWidth >= 640);
}, []);

const isHydratingRef = useRef(false);

      
  const [shake, setShake] = useState(false);
  const [value, setValue] = useState(persistedState?.value ?? "");
  const valueRef = useRef(value);

useEffect(() => {
  valueRef.current = value;
}, [value]);

const [status, setStatus] = useState<"idle" | "correct" | "wrong">(
  persistedState?.status ?? "idle"
);
const [pointsAwarded, setPointsAwarded] = useState<number | null>(
  persistedState?.pointsAwarded ?? null
);
const [hintUsed, setHintUsed] = useState(persistedState?.hintUsed ?? false);
const [firstLetterRevealed, setFirstLetterRevealed] = useState<string | null>(
  persistedState?.firstLetterRevealed ?? null
);
const [revealed, setRevealed] = useState(persistedState?.revealed ?? false);
const lastSentRef = useRef<string>("");
const hasMountedRef = useRef(false);
const lastHydrateRef = useRef<string>("");

useEffect(() => {
    if (!persistedState) return;
  
    const serialized = JSON.stringify(persistedState);
    if (serialized === lastHydrateRef.current) return;
  
    lastHydrateRef.current = serialized;
  
    isHydratingRef.current = true;
  
    setValue(persistedState.value ?? "");
    setStatus(persistedState.status ?? "idle");
    setPointsAwarded(persistedState.pointsAwarded ?? null);
    setHintUsed(persistedState.hintUsed ?? false);
    setFirstLetterRevealed(persistedState.firstLetterRevealed ?? null);
    setRevealed(persistedState.revealed ?? false);
  
    // allow downstream onStateChange on subsequent *user* edits
    queueMicrotask(() => {
      isHydratingRef.current = false;
    });
  }, [persistedState]);
  




  useEffect(() => {
    if (!onStateChange) return;
    if (isHydratingRef.current) return; // ✅ prevents infinite loop
  
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
  
    const payload = {
      value,
      status,
      pointsAwarded,
      hintUsed,
      firstLetterRevealed,
      revealed,
    };
  
    const serialized = JSON.stringify(payload);
    if (serialized === lastSentRef.current) return;
  
    lastSentRef.current = serialized;
    onStateChange(payload);
  }, [value, status, pointsAwarded, hintUsed, firstLetterRevealed, revealed, onStateChange]);
  




useImperativeHandle(ref, () => ({
  setValue(next: string) {
    if (hintUsed && firstLetterRevealed) {
      if (next.length < firstLetterRevealed.length) return;
    }
  
    valueRef.current = next;   // ✅ immediate
    setValue(next);
    setIsEditing(true);
  
    if (status === "wrong") {
      setStatus("idle");
    }
  },
  
  

  submit() {
    if (disabled) return;
    if (status === "correct" || revealed) return;
  
    const guess = normalizeText(valueRef.current);
    const correct = normalizeText(answer);
  
    if (!guess) return;
  
    if (guess === correct) {
      setStatus("correct");
      setIsEditing(false);
  
      if (pointsAwarded === null) {
        const pts = hintUsed ? 5 : 10;
        setPointsAwarded(pts);
        onResolved?.(pts);
      }
    } else {
      setStatus("wrong");
      setShake(true);
      setIsEditing(false); // ✅ ADD THIS LINE
      setTimeout(() => setShake(false), 400);
    }
    
  },
  

  hint() {
    if (status === "correct") return;
    if (hintUsed) return;

    const trimmed = answer.trim();
    const first = trimmed ? trimmed[0] : "";
    if (!first) return;

    setHintUsed(true);
    setFirstLetterRevealed(first.toUpperCase());
    setValue(first.toUpperCase());
  },

  reveal: () => {
    if (status === "correct" || revealed) return;
  
    setRevealed(true);
  
    if (pointsAwarded === null) {
      const pts = 0;
      setPointsAwarded(pts);
    }
  
    setStatus("idle");
    setIsEditing(false);
  },
  
}));




return (
    <div className="flex flex-col items-center">
      {/* Shirt box (fixed height) */}
      <div
        className={`w-10 h-12 sm:w-30 sm:min-h-34 rounded-2xl bg-emerald-950/50 ring-1 ring-white/20 shadow-lg backdrop-blur-[2px]
  flex flex-col items-center justify-start pt-2 text-xs text-white
          ${status === "correct" ? "ring-2 ring-emerald-400" : ""}
          ${status === "wrong" ? "ring-2 ring-red-400" : ""}
        `}
        onClick={() => {
          if (disabled) return;
          if (status === "correct" || revealed) return;
  
          setStatus("idle");
          setShake(false);
          setValue(firstLetterRevealed ? firstLetterRevealed : "");
          setIsEditing(true);
        }}
      >
        <div className="relative flex items-center justify-center -mt-2">
          <svg
            viewBox="0 0 64 64"
            className="h-10 w-10 sm:h-16 sm:w-16 sm:scale-x-130 text-white/90"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              d="M22 10c2.2 3.2 6 5.2 10 5.2S39.8 13.2 42 10l8 4.4c1.6.9 2.3 2.9 1.4 4.5l-4.2 7.5c-.6 1.1-1.9 1.7-3.1 1.4l-3.1-.7V54c0 2.2-1.8 4-4 4H27c-2.2 0-4-1.8-4-4V27.6l-3.1.7c-1.2.3-2.5-.3-3.1-1.4l-4.2-7.5c-.9-1.6-.2-3.6 1.4-4.5L22 10z"
            />
          </svg>
  
          <div className="absolute inset-0 flex items-center justify-center text-[10px] sm:text-[15px] font-bold text-emerald-950 tabular-nums">
            {shirtNumber}
          </div>
  
          <div className="sr-only">#{shirtNumber}</div>
        </div>
  
        {/* Desktop: stacked icon buttons */}
        <div
          className="hidden sm:flex absolute top-2 right-2 flex-col gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            aria-label="Hint"
            className="h-5 w-5 rounded-md bg-white/10 ring-2 ring-white/70 backdrop-blur-sm text-white hover:bg-white/15 active:scale-[0.98]"
            onClick={() => {
              if (status === "correct") return;
              if (hintUsed) return;
  
              const trimmed = answer.trim();
              const first = trimmed ? trimmed[0] : "";
              if (!first) return;
  
              setHintUsed(true);
              setFirstLetterRevealed(first.toUpperCase());
              setValue(first.toUpperCase());
            }}
          >
            ?
          </button>
  
          <button
            type="button"
            aria-label="Reveal"
            className="h-5 w-5 rounded-md bg-white/10 ring-2 ring-white/70 backdrop-blur-sm text-white hover:bg-white/15 active:scale-[0.98]"
            onClick={() => {
              if (status === "correct" || revealed) return;
  
              setRevealed(true);
              if (pointsAwarded === null) {
                const pts = 0;
                setPointsAwarded(pts);
                onResolved?.(pts);
              }
  
              setStatus("idle");
              setIsEditing(false);
            }}
          >
            👁️
          </button>
        </div>
  
        {/* Desktop-only name */}
        <div
          className={`hidden sm:block mt-1 w-full px-1 text-center leading-tight ${
            status === "correct"
              ? "text-emerald-200"
              : revealed
              ? "text-white/70"
              : "text-white"
          }`}
        >
          <div
            className={
              status === "correct"
                ? "text-[18px] font-extrabold tracking-tight text-emerald-200"
                : revealed
                ? "text-[18px] font-bold tracking-tight text-white/70"
                : "text-[11px] font-bold tracking-[0.25em]"
            }
          >
            {status === "correct" ? (
              <div className="flex flex-col items-center gap-1.5">
                <div>{answer}</div>
              </div>
            ) : revealed ? (
              <div>{answer}</div>
            ) : (
              <span className="inline-flex gap-0.75">
                {maskedName.split("").map((char, i) =>
                  char === "-" ? (
                    <span
                      key={i}
                      className="inline-block h-[3px] w-1.5 rounded-sm bg-white"
                    />
                  ) : (
                    <span key={i}>{char}</span>
                  )
                )}
              </span>
            )}
          </div>
        </div>
  
        {/* Desktop points row */}
        <div
          className={`hidden sm:block mt-1 text-[10px] font-semibold leading-none text-emerald-200 transition-all duration-300 ease-out ${
            (status === "correct" && typeof pointsAwarded === "number") || revealed
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-2 pointer-events-none"
          }`}
        >
          {status === "correct" && typeof pointsAwarded === "number" ? (
            <span className="inline-flex items-center gap-1">
              +{pointsAwarded}pts <span aria-hidden="true">✅</span>
            </span>
          ) : null}
  
          {revealed && status !== "correct" ? (
            <span className="inline-flex items-center gap-1">
              0pts <span aria-hidden="true">👁️</span>
            </span>
          ) : null}
        </div>
  
        {/* Input */}
        <div
          className={`${
            status === "correct" || revealed || disabled
              ? "hidden"
              : hasMounted
              ? isEditing
                ? ""
                : "hidden sm:block"
              : "hidden sm:block"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={`${shake ? "shake" : ""} mt-1 sm:mt-2 px-2 block`}>
            <input
              className="mt-1 w-full rounded-md bg-white/10 px-2 py-1 text-xs text-white placeholder:text-white/60 ring-2 ring-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/90"
              placeholder="Enter Player"
              value={value}
              onChange={(e) => {
                const next = e.target.value;
  
                if (hintUsed && firstLetterRevealed) {
                  if (next.length < firstLetterRevealed.length) return;
                }
  
                setValue(next);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const guess = normalizeText(value);
                  const correct = normalizeText(answer);
  
                  if (!guess) return;
  
                  if (guess === correct) {
                    setStatus("correct");
                    setIsEditing(false);
  
                    if (pointsAwarded === null) {
                      const pts = hintUsed ? 5 : 10;
                      setPointsAwarded(pts);
                      onResolved?.(pts);
                    }
                  } else {
                    setStatus("wrong");
                    setShake(true);
                    setTimeout(() => setShake(false), 400);
                  }
                }
              }}
              autoFocus
            />
          </div>
        </div>
      </div>
  
      {/* ✅ Mobile-only: name + points OUTSIDE the fixed-height shirt box */}
      {(status === "correct" || revealed) ? (
        <div className="sm:hidden mt-1 text-[11px] font-bold text-white/90 leading-tight text-center max-w-[6.5rem] truncate">
          {answer}
        </div>
      ) : null}
  
      <div
        className={`sm:hidden mt-1 text-[10px] font-semibold leading-none text-emerald-200 transition-all duration-300 ease-out ${
          (status === "correct" && typeof pointsAwarded === "number") || revealed
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-2 pointer-events-none"
        }`}
      >
        {status === "correct" && typeof pointsAwarded === "number" ? (
          <span className="inline-flex items-center gap-1">
            +{pointsAwarded}pts <span aria-hidden="true">✅</span>
          </span>
        ) : null}
  
        {revealed && status !== "correct" ? (
          <span className="inline-flex items-center gap-1">
            0pts <span aria-hidden="true">👁️</span>
          </span>
        ) : null}
      </div>
  
      <style jsx>{`
        .shake {
          animation: shake 0.4s;
        }
        @keyframes shake {
          0% {
            transform: translateX(0);
          }
          15% {
            transform: translateX(-3px);
          }
          30% {
            transform: translateX(3px);
          }
          45% {
            transform: translateX(-2px);
          }
          60% {
            transform: translateX(2px);
          }
          75% {
            transform: translateX(-1px);
          }
          100% {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
  

});
export default WhoScoredGuessBox;



    
      
"use client";

import { useEffect, useRef, useState } from "react";

import PlayerBox, { type PlayerBoxHandle } from "./PlayerBox";


type PersistedGameState = {
  players: Record<string, any>;
};

function getStorageKey(teamName: string, matchName: string) {
  return `missing11:${teamName}:${matchName}`;
}


// This is the minimum shape we need to render players.
// It matches what you're already using in page.tsx.
type PlayerRow = {
  player_id: string;
  family_name: string;
  shirt_number: string;
};

// Formation shape coming from getLineup()
type Formation = {
  GK: PlayerRow[];
  DF: PlayerRow[];
  MF: PlayerRow[];
  FW: PlayerRow[];
};

type Props = {
  teamName: string;
  matchName: string;
  formation: Formation;
  puzzleId: string;
  difficulty: "easy" | "hard";
  onScoreChange?: (score: number) => void;
  onResolvedCountChange?: (count: number) => void;
  onPersistedPlayersChange?: (players: Record<string, any>) => void;
  onResolvedOne?: () => void; // NEW
  onMobilePlayerTap?: (playerId: string | null) => void;
  
  submitActivePlayerId?: string | null;
submitActiveValue?: string;
submitActiveNonce?: number;
revealActivePlayerId?: string | null;
revealActiveNonce?: number;
hintActivePlayerId?: string | null;
hintActiveNonce?: number;
  disabled?: boolean;
};



function maskSurname(name: string) {
  // keeps spaces + hyphens, masks letters as "-"
  return name.replace(/\p{L}/gu, "-");
}

export default function Missing11Game({
  teamName,
  matchName,
  formation,
  puzzleId,
  difficulty,
  onScoreChange,
  onResolvedOne,
  onResolvedCountChange,
  onPersistedPlayersChange,
  disabled,
  onMobilePlayerTap,
  submitActivePlayerId,
  submitActiveValue,
  submitActiveNonce,
  revealActivePlayerId,
  revealActiveNonce,
  hintActivePlayerId,
  hintActiveNonce,
}: Props) {
  useEffect(() => {
    const all = [...formation.GK, ...formation.DF, ...formation.MF, ...formation.FW];

    console.log("FORMATION CHECK", {
      GK: formation.GK.map((p) => `${p.player_id} ${p.family_name}`),
      DF: formation.DF.map((p) => `${p.player_id} ${p.family_name}`),
      MF: formation.MF.map((p) => `${p.player_id} ${p.family_name}`),
      FW: formation.FW.map((p) => `${p.player_id} ${p.family_name}`),
      total: all.length,
      uniqueIds: new Set(all.map((p) => p.player_id)).size,
    });
  }, [formation]);


  const [score, setScore] = useState(0);
  useEffect(() => {
    onScoreChange?.(score);
  }, [score, onScoreChange]);

  const playerRefs = useRef<Record<string, PlayerBoxHandle | null>>({});
  const lastRevealNonceRef = useRef<number>(0);
  const lastSubmitNonceRef = useRef<number>(0);
  const lastHintNonceRef = useRef<number>(0);


  useEffect(() => {
    if (!submitActiveNonce) return;
    if (!submitActivePlayerId) return;
  
    // ✅ only handle each nonce once
    if (submitActiveNonce === lastSubmitNonceRef.current) return;
    lastSubmitNonceRef.current = submitActiveNonce;
  
    const ref = playerRefs.current[submitActivePlayerId];
    if (!ref) return;
  
    if (typeof submitActiveValue === "string") {
      ref.setValue(submitActiveValue);
    }
  
    ref.submit();
  }, [submitActiveNonce, submitActivePlayerId, submitActiveValue]);
  

  useEffect(() => {
    if (!revealActiveNonce) return;
    if (!revealActivePlayerId) return;
  
    // ✅ only handle each nonce once
    if (revealActiveNonce === lastRevealNonceRef.current) return;
    lastRevealNonceRef.current = revealActiveNonce;
  
    console.log("REVEAL EFFECT", { revealActiveNonce, revealActivePlayerId });
  
    const ref = playerRefs.current[revealActivePlayerId];
    console.log("REVEAL REF", ref);
  
    if (!ref) return;
  
    ref.reveal();
  }, [revealActiveNonce, revealActivePlayerId]);
  
  useEffect(() => {
    if (!hintActiveNonce) return;
    if (!hintActivePlayerId) return;
  
    // ✅ only handle each nonce once
    if (hintActiveNonce === lastHintNonceRef.current) return;
    lastHintNonceRef.current = hintActiveNonce;
  
    const ref = playerRefs.current[hintActivePlayerId];
    if (!ref) return;
  
    ref.hint();
  }, [hintActiveNonce, hintActivePlayerId]);
  
  
  
  
  


  const storageKey = `missing11:${difficulty}:${puzzleId}`;


  const [persistedPlayers, setPersistedPlayers] = useState<Record<string, any>>({});
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      const parsed = raw ? JSON.parse(raw) : null;
      setPersistedPlayers(parsed?.players ?? {});
    } catch {
      setPersistedPlayers({});
    }
  }, [storageKey]);

  useEffect(() => {
    const total = Object.values(persistedPlayers).reduce((sum: number, s: any) => {
      const pts = typeof s?.pointsAwarded === "number" ? s.pointsAwarded : 0;
      return sum + pts;
    }, 0);
  
    setScore(total);
  }, [persistedPlayers]);

  useEffect(() => {
    const resolved = Object.values(persistedPlayers).reduce(
      (count: number, s: any) => {
        const isResolved =
          s?.revealed === true || s?.status === "correct";
        return count + (isResolved ? 1 : 0);
      },
      0
    );
  
    onResolvedCountChange?.(resolved);
  }, [persistedPlayers, onResolvedCountChange]);
  
  useEffect(() => {
    onPersistedPlayersChange?.(persistedPlayers);
  }, [persistedPlayers, onPersistedPlayersChange]);  
  


function updatePlayerState(playerId: string, state: any) {
  console.log("WRITE", playerId, state);
  setPersistedPlayers((prev) => {
    const next = { ...prev, [playerId]: state };

    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ players: next })
      );
    } catch {}

    return next;
  });
}

  

  return (  
     
    <section className="relative w-full sm:max-w-4xl mx-auto aspect-[9/16] sm:aspect-[3/4] h-[120svh] sm:h-auto rounded-2xl overflow-hidden">

    




    {/* Mobile pitch */}
<img
  src="/pitch-mobile.png"
  alt=""
  aria-hidden="true"
  className="absolute inset-0 h-full w-full object-contain object-top sm:hidden pointer-events-none select-none"
/>

{/* Desktop pitch */}
<img
  src="/pitch.png"
  alt=""
  aria-hidden="true"
  className="absolute inset-0 h-full w-full object-contain object-top hidden sm:block pointer-events-none select-none"
/>

  
    {/* GK row */}
    <div className="absolute top-[42%] left-0 right-0 z-10 flex justify-center gap-6 sm:gap-2 px-4">
    {formation.GK.map((p) => (
  <div key={p.player_id} className="relative">
    <PlayerBox
    ref={(node) => {
      playerRefs.current[p.player_id] = node;
    }}    
      shirtNumber={p.shirt_number}
      maskedName={maskSurname(p.family_name)}
      answer={p.family_name}
      disabled={!!disabled}
      persistedState={persistedPlayers[p.player_id]}
      onStateChange={(state) => updatePlayerState(p.player_id, state)}
      onResolved={(pts) => {
        setScore((s) => s + pts);
        onResolvedOne?.();
      }}
      
    />

    {/* Mobile-only tap layer to open sheet */}
    <button
      type="button"
      aria-label={`Open player ${p.shirt_number}`}
      className="absolute inset-0 sm:hidden"
      onClick={() => {
        if (disabled) return;
        onMobilePlayerTap?.(p.player_id);
      }}
    />
  </div>
))}
</div>
  
    {/* DEF row */}
    <div className="absolute top-[29%] left-0 right-0 z-10 flex justify-center gap-6 sm:gap-2 px-4">
    {formation.DF.map((p) => (
  <div key={p.player_id} className="relative">
    <PlayerBox
    ref={(node) => {
      playerRefs.current[p.player_id] = node;
    }}
      shirtNumber={p.shirt_number}
      maskedName={maskSurname(p.family_name)}
      answer={p.family_name}
      disabled={!!disabled}
      persistedState={persistedPlayers[p.player_id]}
      onStateChange={(state) => updatePlayerState(p.player_id, state)}
      onResolved={(pts) => {
        setScore((s) => s + pts);
        onResolvedOne?.();
      }}
      
    />

    {/* Mobile-only tap layer */}
    <button
      type="button"
      aria-label={`Open player ${p.shirt_number}`}
      className="absolute inset-0 sm:hidden"
      onClick={() => {
        if (disabled) return;
        onMobilePlayerTap?.(p.player_id);
      }}
    />
  </div>
))}
</div>
  
    {/* MID row */}
    <div className="absolute top-[16%] left-0 right-0 z-10 flex justify-center gap-6 sm:gap-2 px-4">
    {formation.MF.map((p) => (
  <div key={p.player_id} className="relative">
    <PlayerBox
    ref={(node) => {
      playerRefs.current[p.player_id] = node;
    }}
      shirtNumber={p.shirt_number}
      maskedName={maskSurname(p.family_name)}
      answer={p.family_name}
      disabled={!!disabled}
      persistedState={persistedPlayers[p.player_id]}
      onStateChange={(state) => updatePlayerState(p.player_id, state)}
      onResolved={(pts) => {
        setScore((s) => s + pts);
        onResolvedOne?.();
      }}
    />

    {/* Mobile-only tap layer */}
    <button
      type="button"
      aria-label={`Open player ${p.shirt_number}`}
      className="absolute inset-0 sm:hidden"
      onClick={() => {
        if (disabled) return;
        onMobilePlayerTap?.(p.player_id);
      }}
    />
  </div>
))}
</div>
  
    {/* ATT row */}
    <div className="absolute top-[3%] left-0 right-0 z-10 flex justify-center gap-6 sm:gap-2 px-4">
    {formation.FW.map((p) => (
  <div key={p.player_id} className="relative">
    <PlayerBox
    ref={(node) => {
      playerRefs.current[p.player_id] = node;
    }}
      shirtNumber={p.shirt_number}
      maskedName={maskSurname(p.family_name)}
      answer={p.family_name}
      disabled={!!disabled}
      persistedState={persistedPlayers[p.player_id]}
      onStateChange={(state) => updatePlayerState(p.player_id, state)}
      onResolved={(pts) => {
        setScore((s) => s + pts);
        onResolvedOne?.();
      }}
    />

    {/* Mobile-only tap layer */}
    <button
      type="button"
      aria-label={`Open player ${p.shirt_number}`}
      className="absolute inset-0 sm:hidden"
      onClick={() => {
        if (disabled) return;
        onMobilePlayerTap?.(p.player_id);
      }}
    />
  </div>
))}
</div>

  </section>
  

   
  );
}

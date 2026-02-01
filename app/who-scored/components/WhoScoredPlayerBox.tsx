"use client";

import WhoScoredGuessBox, {
  type PlayerBoxHandle,
} from "./WhoScoredGuessBox";
import { forwardRef } from "react";

type Props = {
  // Core guessing props (same concept as Missing11 PlayerBox)
  maskedName: string;
  answer: string;
  disabled?: boolean;
  persistedState?: any;
  onStateChange?: (state: any) => void;
  onResolved?: (points: number) => void;

  // Who Scored extra UI
  minutesLabel: string;

  // Mobile tap hook (sheet later)
  onClick?: () => void;
};

const WhoScoredPlayerBox = forwardRef<PlayerBoxHandle, Props>(function WhoScoredPlayerBox(
  {
    maskedName,
    answer,
    disabled,
    persistedState,
    onStateChange,
    onResolved,
    minutesLabel,
    onClick,
  },
  ref
) {
  return (
    <div className="flex flex-col items-center">
      {/* Reuse Missing11 engine + visuals */}
      <div className="relative">
        <WhoScoredGuessBox
          ref={ref}
          shirtNumber={" "}
          maskedName={maskedName}
          answer={answer}
          disabled={disabled}




          persistedState={persistedState}
          onStateChange={onStateChange}
          onResolved={onResolved}
        />

        {/* Mobile tap layer (same pattern as Missing11Game) */}
        {onClick ? (
          <button
            type="button"
            aria-label="Open scorer entry"
            className="absolute inset-0 z-20 sm:hidden"




            onClick={onClick}
          />
        ) : null}
      </div>

 


      {/* Minutes always visible under the box */}
      <div className="mt-1 text-[11px] font-bold text-white/70 text-center max-w-[7.5rem]">
  {minutesLabel}
</div>



    </div>
  );
});



export default WhoScoredPlayerBox;


  
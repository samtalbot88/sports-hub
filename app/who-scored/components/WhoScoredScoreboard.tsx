import WhoScoredPlayerBox from "./WhoScoredPlayerBox";
import type { WhoScoredPlayerGoalGroup as PlayerGoalGroup } from "../../../lib/getWhoScoredPuzzle";



function maskSurname(name: string) {
    // exactly like Missing11Shell: keeps spaces + hyphens, masks letters as "-"
    return name.replace(/\p{L}/gu, "-");
  }
  

type GoalMinute = {
    label: string;       // e.g. "57'" or "90+3'"
    sortMinute: number;  // used for sorting
    isOG: boolean;
    isPen: boolean;
  };
  

  
  
  type Props = {
    homeTeam: string;
    awayTeam: string;
    homeScore: number;
    awayScore: number;
    isAET: boolean;
    homeGoals: (PlayerGoalGroup & { isSolved?: boolean })[];
    awayGoals: (PlayerGoalGroup & { isSolved?: boolean })[];
    playerStates?: Record<string, any>;
onPlayerStateChange?: (playerId: string, state: any) => void;

    onScorerTap?: (playerId: string) => void;
  };
  
  
  export default function WhoScoredScoreboard({
    homeTeam,
    awayTeam,
    homeScore,
    awayScore,
    isAET,
    homeGoals,
    awayGoals,
    onScorerTap,
    playerStates,
    onPlayerStateChange,
  }: Props) {
  
  
    return (
      <div className="w-full overflow-hidden rounded-2xl border-2 border-white/25 bg-emerald-950/35 shadow-lg backdrop-blur-sm">
        {/* Top: teams + score */}
        <div className="px-4 py-5 sm:px-6 sm:py-6">
          <div className="grid grid-cols-3 items-center">
            {/* Home */}
            <div className="text-left">
              <div className="text-lg sm:text-xl font-extrabold text-white">
                {homeTeam}
              </div>
            </div>
  
            {/* Score */}
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight tabular-nums">
                {homeScore} <span className="text-white/70">—</span> {awayScore}
              </div>
              <div className="mt-1 text-xs font-bold uppercase tracking-wide text-white/70">
                {isAET ? "AET" : "FT"}
              </div>
            </div>
  
            {/* Away */}
            <div className="text-right">
              <div className="text-lg sm:text-xl font-extrabold text-white">
                {awayTeam}
              </div>
            </div>
          </div>
        </div>
  
        {/* Divider */}
        <div className="h-px w-full bg-white/15" />
  
       {/* Bottom: goalscorers */}
<div className="px-4 py-4 sm:px-6">
  <div className="text-xs font-bold uppercase tracking-wide text-white/60">
    Goalscorers
  </div>

  <div className="mt-3 grid grid-cols-2 gap-3 sm:gap-4">
  {/* HOME */}
  <div className="space-y-2">
    {(homeGoals ?? []).length === 0 ? (
      <div className="text-sm font-semibold text-white/50">—</div>
    ) : (
      (homeGoals ?? []).map((g) => {
        const minutesLabel = g.minutes
          .map(
            (m) =>
              `${m.label}${m.isOG ? " OG" : ""}${m.isPen ? " PEN" : ""}`
          )
          .join(", ");

        return (
            <WhoScoredPlayerBox
            key={`home-${g.player_id}`}
            maskedName={g.isSolved ? g.family_name : maskSurname(g.family_name)}
            answer={g.family_name}
            minutesLabel={minutesLabel}
            disabled={false}


            onClick={() => onScorerTap?.(g.player_id)}
            persistedState={playerStates?.[g.player_id]}
onStateChange={(state) => onPlayerStateChange?.(g.player_id, state)}

          />
          
          
        );
      })
    )}
  </div>

  {/* AWAY */}
  <div className="space-y-2">
    {(awayGoals ?? []).length === 0 ? (
      <div className="text-sm font-semibold text-white/50">—</div>
    ) : (
      (awayGoals ?? []).map((g) => {
        const minutesLabel = g.minutes
          .map(
            (m) =>
              `${m.label}${m.isOG ? " OG" : ""}${m.isPen ? " PEN" : ""}`
          )
          .join(", ");

        return (
            <WhoScoredPlayerBox
  key={`away-${g.player_id}`}
  maskedName={g.isSolved ? g.family_name : maskSurname(g.family_name)}
  answer={g.family_name}
  minutesLabel={minutesLabel}
  disabled={false}


  onClick={() => onScorerTap?.(g.player_id)}
  persistedState={playerStates?.[g.player_id]}
onStateChange={(state) => onPlayerStateChange?.(g.player_id, state)}

/>

          
        );
      })
    )}
  </div>
</div>

</div>

      </div>
    );
  }
  
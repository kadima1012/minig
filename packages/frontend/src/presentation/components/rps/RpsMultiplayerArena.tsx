import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { RpsChoice, RpsRoundResult, RoundOutcome } from "@minigames/shared";

const CHOICE_EMOJI: Record<RpsChoice, string> = {
  [RpsChoice.Rock]: "🪨",
  [RpsChoice.Paper]: "📄",
  [RpsChoice.Scissors]: "✂️",
};

const OUTCOME_COLOR: Record<RoundOutcome, string> = {
  [RoundOutcome.Win]: "text-green-400",
  [RoundOutcome.Lose]: "text-red-400",
  [RoundOutcome.Draw]: "text-yellow-400",
};

const OUTCOME_LABEL: Record<RoundOutcome, string> = {
  [RoundOutcome.Win]: "You Win This Round!",
  [RoundOutcome.Lose]: "You Lost This Round!",
  [RoundOutcome.Draw]: "It's a Draw!",
};

const OUTCOME_BG: Record<RoundOutcome, string> = {
  [RoundOutcome.Win]: "bg-green-500/20 text-green-400",
  [RoundOutcome.Lose]: "bg-red-500/20 text-red-400",
  [RoundOutcome.Draw]: "bg-yellow-500/20 text-yellow-400",
};

interface Props {
  opponentUsername: string;
  roundNumber: number;
  totalRounds: number;
  myChoice: RpsChoice | null;
  opponentChose: boolean;
  lastResult: RpsRoundResult | null;
  onChoice: (choice: RpsChoice) => void;
}

export function RpsMultiplayerArena({
  opponentUsername,
  roundNumber,
  totalRounds,
  myChoice,
  opponentChose,
  lastResult,
  onChoice,
}: Props) {
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (resultRef.current && lastResult) {
      gsap.fromTo(
        resultRef.current,
        { scale: 0.5, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.7)" }
      );
    }
  }, [lastResult]);

  const hasChosen = myChoice !== null;
  const waitingForResult = hasChosen && !lastResult;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        <p className="text-gray-400 text-sm">
          Round {roundNumber} / {totalRounds}
        </p>
        <p className="text-gray-500 text-xs mt-1">
          vs <span className="text-primary font-semibold">{opponentUsername}</span>
        </p>
      </div>

      {lastResult && (
        <div ref={resultRef} className="text-center space-y-3">
          <div className={`inline-block px-6 py-2 rounded-xl text-lg font-bold ${OUTCOME_BG[lastResult.outcome]}`}>
            {OUTCOME_LABEL[lastResult.outcome]}
          </div>
          <div className="flex items-center justify-center gap-8 text-6xl">
            <div className="text-center">
              <span>{CHOICE_EMOJI[lastResult.yourChoice]}</span>
              <p className="text-xs text-gray-400 mt-1">You</p>
            </div>
            <span className="text-2xl text-gray-400">vs</span>
            <div className="text-center">
              <span>{CHOICE_EMOJI[lastResult.opponentChoice]}</span>
              <p className="text-xs text-gray-400 mt-1">{opponentUsername}</p>
            </div>
          </div>
          <div className="flex justify-center gap-6 text-sm">
            <span className="text-green-400 font-semibold">{lastResult.scores.you.wins}W</span>
            <span className="text-yellow-400 font-semibold">{lastResult.scores.you.draws}D</span>
            <span className="text-red-400 font-semibold">{lastResult.scores.you.losses}L</span>
          </div>
        </div>
      )}

      {!lastResult && !hasChosen && (
        <p className="text-gray-400 text-lg">Choose your weapon!</p>
      )}

      {waitingForResult && (
        <div className="text-center">
          <p className="text-gray-400">You chose {CHOICE_EMOJI[myChoice!]}</p>
          <p className="text-gray-500 text-sm animate-pulse mt-2">
            {opponentChose ? "Resolving..." : "Waiting for opponent..."}
          </p>
        </div>
      )}

      <div className="flex gap-4">
        {(Object.values(RpsChoice) as RpsChoice[]).map((choice) => (
          <button
            key={choice}
            onClick={() => onChoice(choice)}
            disabled={hasChosen}
            className="text-5xl p-4 rounded-2xl bg-surface-elevated hover:bg-surface-border transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-110"
            title={choice}
          >
            {CHOICE_EMOJI[choice]}
          </button>
        ))}
      </div>
    </div>
  );
}

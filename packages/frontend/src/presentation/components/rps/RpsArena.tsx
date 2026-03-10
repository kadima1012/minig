import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { RpsChoice, RpsRound, RoundOutcome } from "@minigames/shared";

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
  [RoundOutcome.Win]: "You Win!",
  [RoundOutcome.Lose]: "CPU Wins!",
  [RoundOutcome.Draw]: "Draw!",
};

interface RpsArenaProps {
  lastResult: RpsRound | null;
  isPlaying: boolean;
  onChoice: (choice: RpsChoice) => void;
  disabled: boolean;
}

export function RpsArena({ lastResult, isPlaying, onChoice, disabled }: RpsArenaProps) {
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

  return (
    <div className="flex flex-col items-center gap-6">
      {lastResult && (
        <div ref={resultRef} className="text-center">
          <div className="flex items-center justify-center gap-8 text-6xl mb-3">
            <span title="You">{CHOICE_EMOJI[lastResult.playerChoice]}</span>
            <span className="text-2xl text-gray-400">vs</span>
            <span title="CPU">{CHOICE_EMOJI[lastResult.cpuChoice]}</span>
          </div>
          <p className={`text-2xl font-bold ${OUTCOME_COLOR[lastResult.outcome]}`}>
            {OUTCOME_LABEL[lastResult.outcome]}
          </p>
        </div>
      )}

      {!lastResult && !isPlaying && (
        <p className="text-gray-400 text-lg">Choose your weapon!</p>
      )}
      {isPlaying && <p className="text-gray-400 animate-pulse">CPU is choosing...</p>}

      <div className="flex gap-4">
        {(Object.values(RpsChoice) as RpsChoice[]).map((choice) => (
          <button
            key={choice}
            onClick={() => onChoice(choice)}
            disabled={disabled || isPlaying}
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

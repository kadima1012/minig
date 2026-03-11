import React from "react";

interface PersonalBestProps {
  bestScore: number | null;
  currentScore: number;
}

export function PersonalBest({ bestScore, currentScore }: PersonalBestProps) {
  if (bestScore === null) return null;

  const isNewBest = currentScore > bestScore;

  return (
    <div className="text-center text-sm">
      {isNewBest ? (
        <span className="text-amber-400 font-semibold">
          New personal best! (previous: {bestScore.toLocaleString()})
        </span>
      ) : (
        <span className="text-gray-400">
          Personal best: <span className="font-semibold text-gray-300">{bestScore.toLocaleString()}</span>
        </span>
      )}
    </div>
  );
}

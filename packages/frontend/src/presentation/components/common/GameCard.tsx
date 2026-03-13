import React from "react";
import { Link } from "react-router-dom";
import { BaseGame, GameId } from "@minigames/shared";

const gameIcons: Record<GameId, string> = {
  [GameId.Quiz]: "🧠",
  [GameId.RockPaperScissors]: "✂️",
  [GameId.FindDifference]: "🔍",
  [GameId.PriceCompare]: "💰",
  [GameId.TriviaConquest]: "🗺️",
};

const gameColors: Record<GameId, string> = {
  [GameId.Quiz]: "from-indigo-600 to-purple-600",
  [GameId.RockPaperScissors]: "from-rose-600 to-pink-600",
  [GameId.FindDifference]: "from-cyan-600 to-teal-600",
  [GameId.PriceCompare]: "from-amber-600 to-orange-600",
  [GameId.TriviaConquest]: "from-emerald-600 to-cyan-600",
};

const gamePaths: Record<GameId, string> = {
  [GameId.Quiz]: "/quiz",
  [GameId.RockPaperScissors]: "/rps",
  [GameId.FindDifference]: "/find-difference",
  [GameId.PriceCompare]: "/price-compare",
  [GameId.TriviaConquest]: "/trivia-conquest",
};

interface GameCardProps {
  game: BaseGame;
}

export function GameCard({ game }: GameCardProps) {
  return (
    <Link
      to={gamePaths[game.id]}
      className={`game-card block rounded-2xl bg-gradient-to-br ${gameColors[game.id]} p-6 shadow-lg game-card-hover`}
    >
      <div className="text-5xl mb-4">{gameIcons[game.id]}</div>
      <h3 className="text-xl font-bold mb-1">{game.title}</h3>
      <p className="text-sm text-white/80">{game.description}</p>
      {game.maxScore > 0 && (
        <div className="mt-4 text-xs text-white/60">Max score: ~{game.maxScore.toLocaleString()}</div>
      )}
      {game.maxScore === 0 && (
        <div className="mt-4 text-xs text-white/60">Multiplayer</div>
      )}
    </Link>
  );
}

import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { useRps } from "../../hooks/useRps";
import { RpsArena } from "../../components/rps/RpsArena";
import { Button } from "../../components/common/Button";
import { RpsChoice, RoundOutcome } from "@minigames/shared";

export function RpsPage() {
  const navigate = useNavigate();
  const { round, totalRounds, lastResult, score, isPlaying, isFinished, play, restart } = useRps();
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isFinished && resultRef.current) {
      gsap.fromTo(resultRef.current, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.5)" });
    }
  }, [isFinished]);

  if (isFinished) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-4">
        <div ref={resultRef} className="bg-surface-elevated rounded-2xl p-10 text-center max-w-sm w-full shadow-2xl">
          <div className="text-6xl mb-4">
            {score.wins > score.losses ? "🏆" : score.wins < score.losses ? "😢" : "🤝"}
          </div>
          <h2 className="text-3xl font-bold mb-6">Game Over!</h2>
          <div className="grid grid-cols-3 gap-4 mb-8 text-center">
            <div>
              <div className="text-2xl font-bold text-green-400">{score.wins}</div>
              <div className="text-xs text-gray-400">Wins</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-400">{score.draws}</div>
              <div className="text-xs text-gray-400">Draws</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-400">{score.losses}</div>
              <div className="text-xs text-gray-400">Losses</div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => navigate("/")}>
              Home
            </Button>
            <Button className="flex-1" onClick={restart}>
              Play Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface px-4 py-10">
      <div className="max-w-lg mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            ← Back
          </Button>
          <span className="text-gray-400 text-sm">
            Round {round} / {totalRounds}
          </span>
          <div className="grid grid-cols-3 gap-3 text-center text-sm">
            <span className="text-green-400 font-bold">{score.wins}W</span>
            <span className="text-yellow-400 font-bold">{score.draws}D</span>
            <span className="text-red-400 font-bold">{score.losses}L</span>
          </div>
        </div>
        <div className="w-full bg-surface-border rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(round / totalRounds) * 100}%` }}
          />
        </div>
        <RpsArena
          lastResult={lastResult}
          isPlaying={isPlaying}
          onChoice={(choice: RpsChoice) => play(choice)}
          disabled={isFinished}
        />
        {lastResult && !isFinished && (
          <p className="text-center text-gray-400 text-sm animate-pulse">
            Choose your next move!
          </p>
        )}
      </div>
    </div>
  );
}

import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { usePriceCompare } from "../../hooks/usePriceCompare";
import { ProductCard } from "../../components/price-compare/ProductCard";
import { ScoreDisplay } from "../../components/common/ScoreDisplay";
import { Button } from "../../components/common/Button";

export function PriceComparePage() {
  const navigate = useNavigate();
  const {
    pair,
    result,
    streak,
    round,
    totalRounds,
    score,
    isLoading,
    isFinished,
    error,
    submitGuess,
    start,
    loadPair,
  } = usePriceCompare();

  const streakRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    start();
  }, []);

  useEffect(() => {
    if (streak > 1 && streakRef.current) {
      gsap.fromTo(streakRef.current, { scale: 1.5, color: "#fbbf24" }, { scale: 1, color: "#ffffff", duration: 0.4 });
    }
  }, [streak]);

  const handleGuess = async (side: "A" | "B") => {
    await submitGuess(side);
  };

  const handleNext = () => {
    loadPair();
  };

  if (isLoading && !pair) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <p className="text-gray-400 animate-pulse">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4">
        <p className="text-red-400">{error}</p>
        <Button onClick={start}>Retry</Button>
      </div>
    );
  }

  if (isFinished) {
    return <ResultScreen score={score} onHome={() => navigate("/")} onRestart={start} />;
  }

  return (
    <div className="min-h-screen bg-surface px-4 py-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            ← Back
          </Button>
          <div className="text-sm text-gray-400">
            Round {round} / {totalRounds}
          </div>
          <div className="flex items-center gap-4">
            {streak > 1 && (
              <span ref={streakRef} className="text-amber-400 font-bold text-sm">
                🔥 {streak}x streak
              </span>
            )}
            <ScoreDisplay score={score} />
          </div>
        </div>

        <h2 className="text-center text-xl font-semibold text-gray-300">
          Which is more expensive?
        </h2>

        {pair && (
          <div className="grid grid-cols-2 gap-4">
            <ProductCard
              product={pair.productA}
              side="A"
              onSelect={handleGuess}
              disabled={!!result}
              revealPrice={result?.priceA}
              isWinner={result ? result.expensiveProduct === "A" : undefined}
            />
            <ProductCard
              product={pair.productB}
              side="B"
              onSelect={handleGuess}
              disabled={!!result}
              revealPrice={result?.priceB}
              isWinner={result ? result.expensiveProduct === "B" : undefined}
            />
          </div>
        )}

        {result && !isFinished && (
          <div className="space-y-3">
            <div
              className={`rounded-xl p-4 text-center font-semibold ${
                result.correct ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"
              }`}
            >
              {result.correct ? "✅ Correct!" : "❌ Wrong!"}
              {result.correct && streak > 1 && ` +${streak * 10} bonus`}
            </div>
            <Button className="w-full" onClick={handleNext}>
              Next Pair →
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function ResultScreen({
  score,
  onHome,
  onRestart,
}: {
  score: number;
  onHome: () => void;
  onRestart: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) {
      gsap.fromTo(ref.current, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.5)" });
    }
  }, []);

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div ref={ref} className="bg-surface-elevated rounded-2xl p-10 text-center max-w-sm w-full shadow-2xl">
        <div className="text-6xl mb-4">💰</div>
        <h2 className="text-3xl font-bold mb-2">Round Complete!</h2>
        <div className="text-5xl font-extrabold text-amber-400 my-6">{score.toLocaleString()}</div>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onHome}>
            Home
          </Button>
          <Button className="flex-1" onClick={onRestart}>
            Play Again
          </Button>
        </div>
      </div>
    </div>
  );
}

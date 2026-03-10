import { useState, useCallback } from "react";
import { ProductPair, PriceGuessResponse } from "@minigames/shared";
import { PriceCompareUseCase } from "../../application/use-cases/price-compare/PriceCompareUseCase";

const useCase = new PriceCompareUseCase();
const TOTAL_ROUNDS = 10;

export function usePriceCompare() {
  const [pair, setPair] = useState<ProductPair | null>(null);
  const [result, setResult] = useState<PriceGuessResponse | null>(null);
  const [streak, setStreak] = useState(0);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPair = useCallback(async () => {
    setIsLoading(true);
    setResult(null);
    setError(null);
    try {
      const p = await useCase.loadPair();
      setPair(p);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const submitGuess = useCallback(
    async (guess: "A" | "B") => {
      if (!pair) return;
      const res = await useCase.submitGuess(pair.pairId, guess, streak);
      setResult(res);
      setStreak(res.streak);
      if (res.correct) setScore((s) => s + 100 + res.streak * 10);
      const newRound = round + 1;
      setRound(newRound);
      if (newRound >= TOTAL_ROUNDS) setIsFinished(true);
      return res;
    },
    [pair, streak, round]
  );

  const start = useCallback(async () => {
    setRound(0);
    setScore(0);
    setStreak(0);
    setIsFinished(false);
    setResult(null);
    await loadPair();
  }, [loadPair]);

  return {
    pair,
    result,
    streak,
    round,
    totalRounds: TOTAL_ROUNDS,
    score,
    isLoading,
    isFinished,
    error,
    loadPair,
    submitGuess,
    start,
  };
}

import { useState, useCallback } from "react";
import { RpsChoice, RpsRound, RpsScore, RoundOutcome } from "@minigames/shared";
import { RpsGameUseCase } from "../../application/use-cases/rps/RpsGameUseCase";

const useCase = new RpsGameUseCase();
const TOTAL_ROUNDS = 5;

export function useRps() {
  const [round, setRound] = useState(0);
  const [lastResult, setLastResult] = useState<RpsRound | null>(null);
  const [score, setScore] = useState<RpsScore>({ wins: 0, losses: 0, draws: 0 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const play = useCallback(async (choice: RpsChoice) => {
    if (isPlaying || isFinished) return;
    setIsPlaying(true);
    const result = await useCase.play(choice);
    setLastResult(result);
    setScore((s) => ({
      wins: s.wins + (result.outcome === RoundOutcome.Win ? 1 : 0),
      losses: s.losses + (result.outcome === RoundOutcome.Lose ? 1 : 0),
      draws: s.draws + (result.outcome === RoundOutcome.Draw ? 1 : 0),
    }));
    const newRound = round + 1;
    setRound(newRound);
    if (newRound >= TOTAL_ROUNDS) setIsFinished(true);
    setIsPlaying(false);
    return result;
  }, [isPlaying, isFinished, round]);

  const restart = useCallback(() => {
    setRound(0);
    setLastResult(null);
    setScore({ wins: 0, losses: 0, draws: 0 });
    setIsPlaying(false);
    setIsFinished(false);
  }, []);

  return {
    round,
    totalRounds: TOTAL_ROUNDS,
    lastResult,
    score,
    isPlaying,
    isFinished,
    play,
    restart,
  };
}

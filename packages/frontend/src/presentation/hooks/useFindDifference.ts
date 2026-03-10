import { useState, useCallback } from "react";
import { DifferencePuzzle } from "@minigames/shared";
import { FindDifferenceUseCase } from "../../application/use-cases/find-difference/FindDifferenceUseCase";

const useCase = new FindDifferenceUseCase();

export function useFindDifference() {
  const [puzzle, setPuzzle] = useState<DifferencePuzzle | null>(null);
  const [foundIds, setFoundIds] = useState<string[]>([]);
  const [foundMarkers, setFoundMarkers] = useState<{ x: number; y: number; id: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPuzzle = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const p = await useCase.loadPuzzle();
      setPuzzle(p);
      setFoundIds([]);
      setFoundMarkers([]);
      setIsFinished(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleClick = useCallback(
    async (xPercent: number, yPercent: number) => {
      if (!puzzle || isFinished) return;
      const result = await useCase.registerClick(puzzle.id, xPercent, yPercent, foundIds);
      if (result.hit && result.zoneId) {
        setFoundIds(result.alreadyFoundIds);
        setFoundMarkers((m) => [...m, { x: xPercent, y: yPercent, id: result.zoneId! }]);
        if (result.foundCount >= puzzle.totalDifferences) {
          setIsFinished(true);
        }
      }
      return result;
    },
    [puzzle, isFinished, foundIds]
  );

  const onTimerExpired = useCallback(() => setIsFinished(true), []);

  return {
    puzzle,
    foundIds,
    foundMarkers,
    foundCount: foundIds.length,
    isLoading,
    isFinished,
    error,
    loadPuzzle,
    handleClick,
    onTimerExpired,
  };
}

import { useCallback, useState } from "react";
import { GameId, UserBestScores } from "@minigames/shared";
import { scoreApi } from "../../infrastructure/api/score.api";
import { useAuth } from "./useAuth";

export function useScores() {
  const { user } = useAuth();
  const [bestScores, setBestScores] = useState<UserBestScores>({});
  const [saving, setSaving] = useState(false);

  const loadBestScores = useCallback(async () => {
    if (!user) return;
    try {
      const scores = await scoreApi.getUserBestScores();
      setBestScores(scores);
    } catch {
      // Silently fail — best scores are optional
    }
  }, [user]);

  const saveScore = useCallback(
    async (gameId: GameId, score: number) => {
      if (!user) return;
      setSaving(true);
      try {
        await scoreApi.saveScore({ gameId, score });
        await loadBestScores();
      } catch {
        // Silently fail
      } finally {
        setSaving(false);
      }
    },
    [user, loadBestScores]
  );

  const getBest = useCallback(
    (gameId: GameId): number | null => {
      if (!user) return null;
      return bestScores[gameId] ?? null;
    },
    [user, bestScores]
  );

  return { bestScores, saving, loadBestScores, saveScore, getBest };
}

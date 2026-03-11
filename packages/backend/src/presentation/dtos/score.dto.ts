import { z } from "zod";
import { GameId } from "@minigames/shared";

export const SaveScoreDto = z.object({
  gameId: z.nativeEnum(GameId),
  score: z.number().int().min(0),
});

export const GetLeaderboardParamsDto = z.object({
  gameId: z.nativeEnum(GameId),
});

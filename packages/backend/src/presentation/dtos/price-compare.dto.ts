import { z } from "zod";

export const PriceGuessDto = z.object({
  pairId: z.string().min(1),
  guess: z.enum(["A", "B"]),
  currentStreak: z.number().int().min(0).default(0),
});

export type PriceGuessDtoType = z.infer<typeof PriceGuessDto>;

import { z } from "zod";

export const DifferenceClickDto = z.object({
  puzzleId: z.string().min(1),
  xPercent: z.number().min(0).max(100),
  yPercent: z.number().min(0).max(100),
  alreadyFoundIds: z.array(z.string()).default([]),
});

export type DifferenceClickDtoType = z.infer<typeof DifferenceClickDto>;

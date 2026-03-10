import { z } from "zod";

export const SubmitAnswerDto = z.object({
  questionId: z.string().min(1),
  selectedIndex: z.number().int().min(0).max(3),
  timeTakenMs: z.number().int().min(0),
});

export type SubmitAnswerDtoType = z.infer<typeof SubmitAnswerDto>;

import { z } from "zod";
import { RpsChoice } from "@minigames/shared";

export const PlayRoundDto = z.object({
  choice: z.nativeEnum(RpsChoice),
});

export type PlayRoundDtoType = z.infer<typeof PlayRoundDto>;

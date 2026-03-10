import { IPuzzleRepository } from "../../../domain/interfaces/IPuzzleRepository";
import { DifferenceClickResponse } from "@minigames/shared";

interface ValidateClickInput {
  puzzleId: string;
  xPercent: number;
  yPercent: number;
  alreadyFoundIds: string[];
}

export class ValidateClickUseCase {
  constructor(private readonly puzzleRepo: IPuzzleRepository) {}

  async execute(input: ValidateClickInput): Promise<DifferenceClickResponse> {
    const puzzle = await this.puzzleRepo.findById(input.puzzleId);
    if (!puzzle) throw new Error(`Puzzle ${input.puzzleId} not found`);

    const zone = puzzle.findHitZone(input.xPercent, input.yPercent);

    if (!zone || input.alreadyFoundIds.includes(zone.id)) {
      return { hit: false, foundCount: input.alreadyFoundIds.length };
    }

    return {
      hit: true,
      zoneId: zone.id,
      foundCount: input.alreadyFoundIds.length + 1,
    };
  }
}

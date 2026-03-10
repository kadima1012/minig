import { IPuzzleRepository } from "../../../domain/interfaces/IPuzzleRepository";
import { DifferencePuzzle } from "@minigames/shared";

export class GetPuzzleUseCase {
  constructor(private readonly puzzleRepo: IPuzzleRepository) {}

  async execute(): Promise<DifferencePuzzle> {
    const puzzle = await this.puzzleRepo.findRandom();
    return {
      id: puzzle.id,
      imageAUrl: puzzle.imageAUrl,
      imageBUrl: puzzle.imageBUrl,
      totalDifferences: puzzle.totalDifferences,
      timeLimitMs: puzzle.timeLimitMs,
    };
  }
}

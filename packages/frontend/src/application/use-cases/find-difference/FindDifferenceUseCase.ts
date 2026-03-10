import { DifferencePuzzle, DifferenceClickResponse } from "@minigames/shared";
import { findDifferenceApi } from "../../../infrastructure/api/find-difference.api";

export class FindDifferenceUseCase {
  async loadPuzzle(): Promise<DifferencePuzzle> {
    return findDifferenceApi.getPuzzle();
  }

  async registerClick(
    puzzleId: string,
    xPercent: number,
    yPercent: number,
    alreadyFoundIds: string[]
  ): Promise<DifferenceClickResponse & { alreadyFoundIds: string[] }> {
    const result = await findDifferenceApi.validateClick({ puzzleId, xPercent, yPercent });
    const updatedIds = result.hit && result.zoneId
      ? [...alreadyFoundIds, result.zoneId]
      : alreadyFoundIds;
    return { ...result, alreadyFoundIds: updatedIds };
  }
}

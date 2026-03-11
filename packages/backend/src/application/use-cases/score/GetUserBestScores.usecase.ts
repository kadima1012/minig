import { UserBestScores } from "@minigames/shared";
import { IScoreRepository } from "../../../domain/interfaces/IScoreRepository";

export class GetUserBestScoresUseCase {
  constructor(private scoreRepo: IScoreRepository) {}

  async execute(userId: string): Promise<UserBestScores> {
    const records = await this.scoreRepo.getUserBestScores(userId);
    const result: UserBestScores = {};
    for (const r of records) {
      result[r.gameId] = r.score;
    }
    return result;
  }
}

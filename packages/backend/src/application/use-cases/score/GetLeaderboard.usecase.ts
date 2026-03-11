import { GameId, LeaderboardResponse } from "@minigames/shared";
import { IScoreRepository } from "../../../domain/interfaces/IScoreRepository";

const LEADERBOARD_SIZE = 10;

export class GetLeaderboardUseCase {
  constructor(private scoreRepo: IScoreRepository) {}

  async execute(gameId: GameId): Promise<LeaderboardResponse> {
    const records = await this.scoreRepo.getTopByGame(gameId, LEADERBOARD_SIZE);

    return {
      gameId,
      entries: records.map((r, i) => ({
        rank: i + 1,
        userId: r.userId,
        username: r.username,
        score: r.score,
        createdAt: r.createdAt.toISOString(),
      })),
    };
  }
}

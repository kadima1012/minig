import { GameId } from "@minigames/shared";
import { ScoreRecord } from "../../domain/entities/ScoreRecord";
import { IScoreRepository } from "../../domain/interfaces/IScoreRepository";

export class InMemoryScoreRepository implements IScoreRepository {
  private records: ScoreRecord[] = [];

  async save(record: ScoreRecord): Promise<ScoreRecord> {
    this.records.push(record);
    return record;
  }

  async getTopByGame(gameId: GameId, limit: number): Promise<ScoreRecord[]> {
    const gameRecords = this.records.filter((r) => r.gameId === gameId);

    const bestByUser = new Map<string, ScoreRecord>();
    for (const record of gameRecords) {
      const existing = bestByUser.get(record.userId);
      if (!existing || record.score > existing.score) {
        bestByUser.set(record.userId, record);
      }
    }

    return Array.from(bestByUser.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  async getUserBestByGame(userId: string, gameId: GameId): Promise<ScoreRecord | null> {
    const userRecords = this.records.filter(
      (r) => r.userId === userId && r.gameId === gameId
    );
    if (userRecords.length === 0) return null;
    return userRecords.reduce((best, r) => (r.score > best.score ? r : best));
  }

  async getUserBestScores(userId: string): Promise<ScoreRecord[]> {
    const byGame = new Map<GameId, ScoreRecord>();
    for (const record of this.records) {
      if (record.userId !== userId) continue;
      const existing = byGame.get(record.gameId);
      if (!existing || record.score > existing.score) {
        byGame.set(record.gameId, record);
      }
    }
    return Array.from(byGame.values());
  }
}

import { GameId } from "@minigames/shared";
import { ScoreRecord } from "../entities/ScoreRecord";

export interface IScoreRepository {
  save(record: ScoreRecord): Promise<ScoreRecord>;
  getTopByGame(gameId: GameId, limit: number): Promise<ScoreRecord[]>;
  getUserBestByGame(userId: string, gameId: GameId): Promise<ScoreRecord | null>;
  getUserBestScores(userId: string): Promise<ScoreRecord[]>;
}

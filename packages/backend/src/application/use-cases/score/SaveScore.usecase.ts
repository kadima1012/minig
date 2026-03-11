import { randomUUID } from "crypto";
import { GameId, ScoreEntry } from "@minigames/shared";
import { ScoreRecord } from "../../../domain/entities/ScoreRecord";
import { IScoreRepository } from "../../../domain/interfaces/IScoreRepository";
import { IUserRepository } from "../../../domain/interfaces/IUserRepository";

interface SaveScoreInput {
  userId: string;
  gameId: GameId;
  score: number;
}

export class SaveScoreUseCase {
  constructor(
    private scoreRepo: IScoreRepository,
    private userRepo: IUserRepository
  ) {}

  async execute(input: SaveScoreInput): Promise<ScoreEntry> {
    const user = await this.userRepo.findById(input.userId);
    if (!user) throw new Error("User not found");

    const record = new ScoreRecord(
      randomUUID(),
      input.userId,
      user.username,
      input.gameId,
      input.score,
      new Date()
    );

    await this.scoreRepo.save(record);
    return record.toEntry();
  }
}

import { GameId } from "@minigames/shared";

export class ScoreRecord {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly username: string,
    public readonly gameId: GameId,
    public readonly score: number,
    public readonly createdAt: Date
  ) {}

  toEntry() {
    return {
      id: this.id,
      userId: this.userId,
      username: this.username,
      gameId: this.gameId,
      score: this.score,
      createdAt: this.createdAt.toISOString(),
    };
  }
}

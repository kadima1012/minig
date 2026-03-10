import { GameId, GameStatus } from "@minigames/shared";

export class GameSession {
  public status: GameStatus = GameStatus.Playing;
  public score: number = 0;
  public round: number = 0;

  constructor(
    public readonly sessionId: string,
    public readonly gameId: GameId,
    public readonly startedAt: Date = new Date()
  ) {}

  addScore(points: number): void {
    this.score += points;
  }

  nextRound(): void {
    this.round += 1;
  }

  finish(): void {
    this.status = GameStatus.Finished;
  }
}

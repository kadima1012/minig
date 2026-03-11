import { RpsChoice, RoundOutcome, RpsScore } from "@minigames/shared";

function determineOutcome(a: RpsChoice, b: RpsChoice): RoundOutcome {
  if (a === b) return RoundOutcome.Draw;
  if (
    (a === RpsChoice.Rock && b === RpsChoice.Scissors) ||
    (a === RpsChoice.Paper && b === RpsChoice.Rock) ||
    (a === RpsChoice.Scissors && b === RpsChoice.Paper)
  ) {
    return RoundOutcome.Win;
  }
  return RoundOutcome.Lose;
}

interface RoundRecord {
  p1Choice: RpsChoice;
  p2Choice: RpsChoice;
  p1Outcome: RoundOutcome;
  p2Outcome: RoundOutcome;
}

export class RpsRoom {
  public player2Id: string | null = null;
  public player2Username: string | null = null;
  public status: "waiting" | "playing" | "finished" = "waiting";
  public currentRound = 0;
  public p1Score: RpsScore = { wins: 0, losses: 0, draws: 0 };
  public p2Score: RpsScore = { wins: 0, losses: 0, draws: 0 };
  public p1Choice: RpsChoice | null = null;
  public p2Choice: RpsChoice | null = null;
  public rounds: RoundRecord[] = [];

  constructor(
    public readonly roomCode: string,
    public readonly player1Id: string,
    public readonly player1Username: string,
    public readonly totalRounds: number,
    public readonly createdAt: Date
  ) {}

  join(userId: string, username: string) {
    if (this.status !== "waiting") throw new Error("Room is not waiting for players");
    if (this.player1Id === userId) throw new Error("Cannot join your own room");
    this.player2Id = userId;
    this.player2Username = username;
    this.status = "playing";
    this.currentRound = 1;
  }

  submitChoice(userId: string, choice: RpsChoice) {
    if (this.status !== "playing") throw new Error("Game is not in progress");
    if (userId === this.player1Id) {
      if (this.p1Choice) throw new Error("Already chose this round");
      this.p1Choice = choice;
    } else if (userId === this.player2Id) {
      if (this.p2Choice) throw new Error("Already chose this round");
      this.p2Choice = choice;
    } else {
      throw new Error("Not a player in this room");
    }
  }

  bothChosen(): boolean {
    return this.p1Choice !== null && this.p2Choice !== null;
  }

  resolveRound(): RoundRecord {
    if (!this.p1Choice || !this.p2Choice) throw new Error("Both players must choose first");

    const p1Outcome = determineOutcome(this.p1Choice, this.p2Choice);
    const p2Outcome = determineOutcome(this.p2Choice, this.p1Choice);

    const record: RoundRecord = {
      p1Choice: this.p1Choice,
      p2Choice: this.p2Choice,
      p1Outcome,
      p2Outcome,
    };
    this.rounds.push(record);

    this.updateScore(this.p1Score, p1Outcome);
    this.updateScore(this.p2Score, p2Outcome);

    this.p1Choice = null;
    this.p2Choice = null;

    if (this.currentRound >= this.totalRounds) {
      this.status = "finished";
    } else {
      this.currentRound++;
    }

    return record;
  }

  isFinished(): boolean {
    return this.status === "finished";
  }

  hasPlayer(userId: string): boolean {
    return this.player1Id === userId || this.player2Id === userId;
  }

  getOverallResult(userId: string): "win" | "lose" | "draw" {
    const score = userId === this.player1Id ? this.p1Score : this.p2Score;
    const opponentScore = userId === this.player1Id ? this.p2Score : this.p1Score;
    if (score.wins > opponentScore.wins) return "win";
    if (score.wins < opponentScore.wins) return "lose";
    return "draw";
  }

  private updateScore(score: RpsScore, outcome: RoundOutcome) {
    if (outcome === RoundOutcome.Win) score.wins++;
    else if (outcome === RoundOutcome.Lose) score.losses++;
    else score.draws++;
  }
}

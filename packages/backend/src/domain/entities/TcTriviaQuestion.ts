import { TcCategory } from "@minigames/shared";

export class TcTriviaQuestion {
  constructor(
    public readonly id: string,
    public readonly text: string,
    public readonly options: [string, string, string, string],
    public readonly correctIndex: number,
    public readonly category: TcCategory,
    public readonly timeoutMs: number
  ) {}

  isCorrect(selectedIndex: number): boolean {
    return selectedIndex === this.correctIndex;
  }
}

export class TcTiebreakerQuestion {
  constructor(
    public readonly id: string,
    public readonly text: string,
    public readonly numericAnswer: number,
    public readonly category: TcCategory,
    public readonly timeoutMs: number
  ) {}

  getDistance(answer: number): number {
    return Math.abs(answer - this.numericAnswer);
  }
}

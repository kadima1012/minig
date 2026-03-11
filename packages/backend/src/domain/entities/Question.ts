export class Question {
  constructor(
    public readonly id: string,
    public readonly text: string,
    public readonly options: string[],
    public readonly correctIndex: number,
    public readonly category: string,
    public readonly timeoutMs: number
  ) {}

  isCorrect(selectedIndex: number): boolean {
    return selectedIndex === this.correctIndex;
  }

  calculateScore(timeTakenMs: number): number {
    const timeBonus = Math.max(0, 1 - timeTakenMs / this.timeoutMs);
    return Math.round(50 + timeBonus * 50);
  }
}

export class GameScore {
  private readonly _value: number;

  constructor(value: number = 0) {
    this._value = Math.max(0, Math.round(value));
  }

  get value(): number {
    return this._value;
  }

  add(points: number): GameScore {
    return new GameScore(this._value + points);
  }

  display(): string {
    return this._value.toLocaleString();
  }
}

export class ScoreValue {
  private readonly _value: number;

  constructor(value: number) {
    if (value < 0) throw new Error("Score cannot be negative");
    this._value = Math.round(value);
  }

  get value(): number {
    return this._value;
  }

  add(other: ScoreValue): ScoreValue {
    return new ScoreValue(this._value + other._value);
  }
}

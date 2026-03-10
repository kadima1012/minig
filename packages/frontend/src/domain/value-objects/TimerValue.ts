export class TimerValue {
  private readonly _ms: number;

  constructor(ms: number) {
    this._ms = Math.max(0, ms);
  }

  get ms(): number {
    return this._ms;
  }

  get seconds(): number {
    return Math.ceil(this._ms / 1000);
  }

  get isExpired(): boolean {
    return this._ms <= 0;
  }

  subtract(ms: number): TimerValue {
    return new TimerValue(this._ms - ms);
  }

  /** Returns a value from 0 to 1 representing elapsed fraction. */
  progressFraction(totalMs: number): number {
    return 1 - this._ms / totalMs;
  }

  display(): string {
    const s = Math.ceil(this._ms / 1000);
    return `${s}s`;
  }
}

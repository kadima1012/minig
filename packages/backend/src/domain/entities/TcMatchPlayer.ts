export class TcMatchPlayer {
  public matchPoints = 0;
  public duelsWon = 0;
  public duelsLost = 0;
  public isInDuel = false;
  public revengeTargetHexId: string | null = null;
  public revengeOpponentId: string | null = null;
  public revengeCooldownUntil: Date | null = null;
  public lastTerritoryLostHexId: string | null = null;
  public connected = true;

  constructor(
    public readonly userId: string,
    public readonly username: string,
    public readonly color: string
  ) {}

  isOnCooldown(): boolean {
    if (!this.revengeCooldownUntil) return false;
    return new Date() < this.revengeCooldownUntil;
  }

  hasRevenge(): boolean {
    return this.revengeTargetHexId !== null;
  }

  clearRevenge(): void {
    this.revengeTargetHexId = null;
    this.revengeOpponentId = null;
  }

  setCooldown(durationMs: number): void {
    this.revengeCooldownUntil = new Date(Date.now() + durationMs);
    this.clearRevenge();
  }
}

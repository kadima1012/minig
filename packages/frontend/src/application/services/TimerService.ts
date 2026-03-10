type TimerCallback = (remainingMs: number) => void;
type ExpiredCallback = () => void;

export class TimerService {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private remainingMs: number = 0;
  private readonly tickMs: number = 100;

  start(
    durationMs: number,
    onTick: TimerCallback,
    onExpired: ExpiredCallback
  ): void {
    this.stop();
    this.remainingMs = durationMs;

    this.intervalId = setInterval(() => {
      this.remainingMs -= this.tickMs;
      if (this.remainingMs <= 0) {
        this.remainingMs = 0;
        this.stop();
        onTick(0);
        onExpired();
      } else {
        onTick(this.remainingMs);
      }
    }, this.tickMs);
  }

  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export interface DifferenceZoneData {
  id: string;
  xPercent: number;
  yPercent: number;
  radiusPercent: number;
}

export class DifferencePuzzleEntity {
  constructor(
    public readonly id: string,
    public readonly imageAUrl: string,
    public readonly imageBUrl: string,
    public readonly zones: DifferenceZoneData[],
    public readonly timeLimitMs: number
  ) {}

  get totalDifferences(): number {
    return this.zones.length;
  }

  findHitZone(
    xPercent: number,
    yPercent: number
  ): DifferenceZoneData | undefined {
    return this.zones.find((zone) => {
      const dx = xPercent - zone.xPercent;
      const dy = yPercent - zone.yPercent;
      return Math.sqrt(dx * dx + dy * dy) <= zone.radiusPercent;
    });
  }
}

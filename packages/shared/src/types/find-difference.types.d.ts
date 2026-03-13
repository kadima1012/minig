export interface DifferenceZone {
    id: string;
    xPercent: number;
    yPercent: number;
    radiusPercent: number;
}
export interface DifferencePuzzle {
    id: string;
    imageAUrl: string;
    imageBUrl: string;
    totalDifferences: number;
    timeLimitMs: number;
}
export interface DifferenceClickRequest {
    puzzleId: string;
    xPercent: number;
    yPercent: number;
}
export interface DifferenceClickResponse {
    hit: boolean;
    zoneId?: string;
    foundCount: number;
}
//# sourceMappingURL=find-difference.types.d.ts.map
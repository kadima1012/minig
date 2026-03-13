import { RpsChoice } from "../enums/rps.enums";
import { RoundOutcome } from "../enums/game.enums";
export interface RpsRound {
    playerChoice: RpsChoice;
    cpuChoice: RpsChoice;
    outcome: RoundOutcome;
}
export interface RpsPlayRequest {
    choice: RpsChoice;
}
export interface RpsScore {
    wins: number;
    losses: number;
    draws: number;
}
//# sourceMappingURL=rps.types.d.ts.map
import { GameId, GameStatus } from "../enums/game.enums";
export interface BaseGame {
    id: GameId;
    title: string;
    description: string;
    maxScore: number;
}
export interface GameResult {
    gameId: GameId;
    score: number;
    completedAt: string;
    timeTakenMs?: number;
}
export interface ApiResponse<T> {
    data: T;
    success: boolean;
    message?: string;
}
export interface GameState {
    status: GameStatus;
    score: number;
    round: number;
}
//# sourceMappingURL=game.types.d.ts.map
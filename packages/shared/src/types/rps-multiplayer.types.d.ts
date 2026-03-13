import { RpsChoice } from "../enums/rps.enums";
import { RoundOutcome } from "../enums/game.enums";
import { RpsScore } from "./rps.types";
export declare enum RpsRoomStatus {
    Waiting = "waiting",
    Playing = "playing",
    Finished = "finished"
}
export declare const RpsMultiplayerEvents: {
    readonly CREATE_ROOM: "rps:create-room";
    readonly JOIN_ROOM: "rps:join-room";
    readonly SUBMIT_CHOICE: "rps:submit-choice";
    readonly LEAVE_ROOM: "rps:leave-room";
    readonly ROOM_CREATED: "rps:room-created";
    readonly OPPONENT_JOINED: "rps:opponent-joined";
    readonly ROUND_START: "rps:round-start";
    readonly OPPONENT_CHOSE: "rps:opponent-chose";
    readonly ROUND_RESULT: "rps:round-result";
    readonly GAME_OVER: "rps:game-over";
    readonly OPPONENT_LEFT: "rps:opponent-left";
    readonly ERROR: "rps:error";
};
export interface RpsRoomCreated {
    roomCode: string;
}
export interface RpsOpponentJoined {
    opponentUsername: string;
}
export interface RpsRoundStart {
    roundNumber: number;
    totalRounds: number;
}
export interface RpsRoundResult {
    yourChoice: RpsChoice;
    opponentChoice: RpsChoice;
    outcome: RoundOutcome;
    scores: {
        you: RpsScore;
        opponent: RpsScore;
    };
}
export interface RpsGameOver {
    finalScores: {
        you: RpsScore;
        opponent: RpsScore;
    };
    result: "win" | "lose" | "draw";
    opponentUsername: string;
}
//# sourceMappingURL=rps-multiplayer.types.d.ts.map
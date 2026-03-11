import { RpsChoice } from "../enums/rps.enums";
import { RoundOutcome } from "../enums/game.enums";
import { RpsScore } from "./rps.types";

export enum RpsRoomStatus {
  Waiting = "waiting",
  Playing = "playing",
  Finished = "finished",
}

export const RpsMultiplayerEvents = {
  CREATE_ROOM: "rps:create-room",
  JOIN_ROOM: "rps:join-room",
  SUBMIT_CHOICE: "rps:submit-choice",
  LEAVE_ROOM: "rps:leave-room",

  ROOM_CREATED: "rps:room-created",
  OPPONENT_JOINED: "rps:opponent-joined",
  ROUND_START: "rps:round-start",
  OPPONENT_CHOSE: "rps:opponent-chose",
  ROUND_RESULT: "rps:round-result",
  GAME_OVER: "rps:game-over",
  OPPONENT_LEFT: "rps:opponent-left",
  ERROR: "rps:error",
} as const;

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

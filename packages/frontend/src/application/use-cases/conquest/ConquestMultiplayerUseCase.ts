import { Socket } from "socket.io-client";
import {
  TcEvents,
  TcMatchCreated,
  TcPlayerJoined,
  TcPlayerLeft,
  TcMatchStarting,
  TcMapState,
  TcDuelStarted,
  TcDuelQuestionData,
  TcOpponentAnswered,
  TcDuelQuestionResult,
  TcTiebreakerData,
  TcDuelResolved,
  TcPlayerEliminated,
  TcLeaderboardEntry,
  TcMatchOver,
  TcRevengeCooldown,
  TcMapUpdateEntry,
  TcErrorPayload,
} from "@minigames/shared";
import { getSocket } from "../../../infrastructure/socket/socketClient";

type EventCallback<T> = (data: T) => void;

export class ConquestMultiplayerUseCase {
  private socket: Socket;

  constructor() {
    this.socket = getSocket();
  }

  // ── Emit (Client -> Server) ────────────────────────────────────

  createMatch(): void {
    this.socket.emit(TcEvents.CREATE_MATCH);
  }

  joinMatch(matchCode: string): void {
    this.socket.emit(TcEvents.JOIN_MATCH, { matchCode });
  }

  findMatch(): void {
    this.socket.emit(TcEvents.JOIN_MATCHMAKING);
  }

  leaveMatch(): void {
    this.socket.emit(TcEvents.LEAVE_MATCH);
  }

  attackHex(hexId: string): void {
    this.socket.emit(TcEvents.ATTACK, { hexId });
  }

  submitAnswer(duelId: string, questionIndex: number, selectedIndex: number): void {
    this.socket.emit(TcEvents.SUBMIT_ANSWER, { duelId, questionIndex, selectedIndex });
  }

  submitTiebreaker(duelId: string, numericAnswer: number): void {
    this.socket.emit(TcEvents.SUBMIT_TIEBREAKER, { duelId, numericAnswer });
  }

  acceptRevenge(): void {
    this.socket.emit(TcEvents.ACCEPT_REVENGE);
  }

  declineRevenge(): void {
    this.socket.emit(TcEvents.DECLINE_REVENGE);
  }

  // ── Listen (Server -> Client) ──────────────────────────────────

  onMatchCreated(cb: EventCallback<TcMatchCreated>): void {
    this.socket.on(TcEvents.MATCH_CREATED, cb);
  }

  onPlayerJoined(cb: EventCallback<TcPlayerJoined>): void {
    this.socket.on(TcEvents.PLAYER_JOINED, cb);
  }

  onPlayerLeft(cb: EventCallback<TcPlayerLeft>): void {
    this.socket.on(TcEvents.PLAYER_LEFT, cb);
  }

  onMatchStarting(cb: EventCallback<TcMatchStarting>): void {
    this.socket.on(TcEvents.MATCH_STARTING, cb);
  }

  onMatchStarted(cb: EventCallback<TcMapState>): void {
    this.socket.on(TcEvents.MATCH_STARTED, cb);
  }

  onMapUpdate(cb: EventCallback<TcMapUpdateEntry[]>): void {
    this.socket.on(TcEvents.MAP_UPDATE, cb);
  }

  onDuelStarted(cb: EventCallback<TcDuelStarted>): void {
    this.socket.on(TcEvents.DUEL_STARTED, cb);
  }

  onDuelQuestion(cb: EventCallback<TcDuelQuestionData>): void {
    this.socket.on(TcEvents.DUEL_QUESTION, cb);
  }

  onOpponentAnswered(cb: EventCallback<TcOpponentAnswered>): void {
    this.socket.on(TcEvents.OPPONENT_ANSWERED, cb);
  }

  onDuelQuestionResult(cb: EventCallback<TcDuelQuestionResult>): void {
    this.socket.on(TcEvents.DUEL_QUESTION_RESULT, cb);
  }

  onDuelTiebreaker(cb: EventCallback<TcTiebreakerData>): void {
    this.socket.on(TcEvents.DUEL_TIEBREAKER, cb);
  }

  onDuelResolved(cb: EventCallback<TcDuelResolved>): void {
    this.socket.on(TcEvents.DUEL_RESOLVED, cb);
  }

  onPlayerEliminated(cb: EventCallback<TcPlayerEliminated>): void {
    this.socket.on(TcEvents.PLAYER_ELIMINATED, cb);
  }

  onLeaderboardUpdate(cb: EventCallback<TcLeaderboardEntry[]>): void {
    this.socket.on(TcEvents.LEADERBOARD_UPDATE, cb);
  }

  onMatchOver(cb: EventCallback<TcMatchOver>): void {
    this.socket.on(TcEvents.MATCH_OVER, cb);
  }

  onMatchmakingFound(cb: EventCallback<{ matchCode: string }>): void {
    this.socket.on(TcEvents.MATCHMAKING_FOUND, cb);
  }

  onRevengeCooldown(cb: EventCallback<TcRevengeCooldown>): void {
    this.socket.on(TcEvents.REVENGE_COOLDOWN, cb);
  }

  onError(cb: EventCallback<TcErrorPayload>): void {
    this.socket.on(TcEvents.ERROR, cb);
  }

  onConnect(cb: () => void): void {
    this.socket.on("connect", cb);
  }

  onConnectError(cb: (err: Error) => void): void {
    this.socket.on("connect_error", cb);
  }

  isConnected(): boolean {
    return this.socket.connected;
  }

  cleanup(): void {
    const events = Object.values(TcEvents);
    events.forEach((event) => this.socket.off(event));
    this.socket.off("connect_error");
    this.socket.off("connect");
  }
}

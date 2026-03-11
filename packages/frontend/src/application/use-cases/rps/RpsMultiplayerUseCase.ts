import { Socket } from "socket.io-client";
import {
  RpsChoice,
  RpsMultiplayerEvents,
  RpsRoomCreated,
  RpsOpponentJoined,
  RpsRoundStart,
  RpsRoundResult,
  RpsGameOver,
} from "@minigames/shared";
import { getSocket } from "../../../infrastructure/socket/socketClient";

type EventCallback<T> = (data: T) => void;

export class RpsMultiplayerUseCase {
  private socket: Socket;

  constructor() {
    this.socket = getSocket();
  }

  createRoom() {
    this.socket.emit(RpsMultiplayerEvents.CREATE_ROOM);
  }

  joinRoom(roomCode: string) {
    this.socket.emit(RpsMultiplayerEvents.JOIN_ROOM, { roomCode });
  }

  submitChoice(choice: RpsChoice) {
    this.socket.emit(RpsMultiplayerEvents.SUBMIT_CHOICE, { choice });
  }

  leaveRoom() {
    this.socket.emit(RpsMultiplayerEvents.LEAVE_ROOM);
  }

  onRoomCreated(cb: EventCallback<RpsRoomCreated>) {
    this.socket.on(RpsMultiplayerEvents.ROOM_CREATED, cb);
  }

  onOpponentJoined(cb: EventCallback<RpsOpponentJoined>) {
    this.socket.on(RpsMultiplayerEvents.OPPONENT_JOINED, cb);
  }

  onRoundStart(cb: EventCallback<RpsRoundStart>) {
    this.socket.on(RpsMultiplayerEvents.ROUND_START, cb);
  }

  onOpponentChose(cb: () => void) {
    this.socket.on(RpsMultiplayerEvents.OPPONENT_CHOSE, cb);
  }

  onRoundResult(cb: EventCallback<RpsRoundResult>) {
    this.socket.on(RpsMultiplayerEvents.ROUND_RESULT, cb);
  }

  onGameOver(cb: EventCallback<RpsGameOver>) {
    this.socket.on(RpsMultiplayerEvents.GAME_OVER, cb);
  }

  onOpponentLeft(cb: () => void) {
    this.socket.on(RpsMultiplayerEvents.OPPONENT_LEFT, cb);
  }

  onError(cb: EventCallback<{ message: string }>) {
    this.socket.on(RpsMultiplayerEvents.ERROR, cb);
  }

  onConnectError(cb: (err: Error) => void) {
    this.socket.on("connect_error", cb);
  }

  onConnect(cb: () => void) {
    this.socket.on("connect", cb);
  }

  isConnected(): boolean {
    return this.socket.connected;
  }

  cleanup() {
    const events = Object.values(RpsMultiplayerEvents);
    events.forEach((event) => this.socket.off(event));
    this.socket.off("connect_error");
    this.socket.off("connect");
  }
}

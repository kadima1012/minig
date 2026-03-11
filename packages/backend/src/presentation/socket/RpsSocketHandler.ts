import { Server, Socket } from "socket.io";
import { GameId, RpsChoice, RpsMultiplayerEvents, RPS_CHOICE_TIMEOUT_MS } from "@minigames/shared";
import { CreateRoomUseCase } from "../../application/use-cases/rps/CreateRoom.usecase";
import { JoinRoomUseCase } from "../../application/use-cases/rps/JoinRoom.usecase";
import { SubmitMultiplayerChoiceUseCase } from "../../application/use-cases/rps/SubmitMultiplayerChoice.usecase";
import { SaveScoreUseCase } from "../../application/use-cases/score/SaveScore.usecase";
import { IRpsRoomRepository } from "../../domain/interfaces/IRpsRoomRepository";
import { IScoreRepository } from "../../domain/interfaces/IScoreRepository";
import { IUserRepository } from "../../domain/interfaces/IUserRepository";

export class RpsSocketHandler {
  private createRoom: CreateRoomUseCase;
  private joinRoom: JoinRoomUseCase;
  private submitChoice: SubmitMultiplayerChoiceUseCase;
  private saveScore: SaveScoreUseCase;

  constructor(
    private io: Server,
    private socket: Socket,
    roomRepo: IRpsRoomRepository,
    scoreRepo: IScoreRepository,
    userRepo: IUserRepository
  ) {
    this.createRoom = new CreateRoomUseCase(roomRepo);
    this.joinRoom = new JoinRoomUseCase(roomRepo);
    this.submitChoice = new SubmitMultiplayerChoiceUseCase(roomRepo);
    this.saveScore = new SaveScoreUseCase(scoreRepo, userRepo);
  }

  private get userId(): string {
    return this.socket.data.userId;
  }

  private get username(): string {
    return this.socket.data.username;
  }

  register() {
    this.socket.on(RpsMultiplayerEvents.CREATE_ROOM, () => this.handleCreateRoom());
    this.socket.on(RpsMultiplayerEvents.JOIN_ROOM, (data: { roomCode: string }) => this.handleJoinRoom(data.roomCode));
    this.socket.on(RpsMultiplayerEvents.SUBMIT_CHOICE, (data: { choice: RpsChoice }) => this.handleSubmitChoice(data.choice));
    this.socket.on(RpsMultiplayerEvents.LEAVE_ROOM, () => this.handleLeaveRoom());
    this.socket.on("disconnect", () => this.handleDisconnect());
  }

  private handleCreateRoom() {
    try {
      const room = this.createRoom.execute(this.userId, this.username);
      this.socket.join(room.roomCode);
      this.socket.data.roomCode = room.roomCode;
      console.log(`[RPS] Room created: ${room.roomCode} by ${this.username} (${this.userId})`);
      this.socket.emit(RpsMultiplayerEvents.ROOM_CREATED, { roomCode: room.roomCode });
    } catch (error) {
      this.emitError(error);
    }
  }

  private handleJoinRoom(roomCode: string) {
    try {
      const room = this.joinRoom.execute(roomCode, this.userId, this.username);
      this.socket.join(room.roomCode);
      this.socket.data.roomCode = room.roomCode;
      console.log(`[RPS] ${this.username} joined room ${room.roomCode}. Status: ${room.status}, Round: ${room.currentRound}`);

      // Notify both players
      const sockets = this.io.sockets.adapter.rooms.get(room.roomCode);
      if (sockets) {
        for (const socketId of sockets) {
          const s = this.io.sockets.sockets.get(socketId);
          if (!s) continue;

          const opponentName = s.data.userId === room.player1Id
            ? room.player2Username
            : room.player1Username;

          s.emit(RpsMultiplayerEvents.OPPONENT_JOINED, { opponentUsername: opponentName });
          s.emit(RpsMultiplayerEvents.ROUND_START, {
            roundNumber: room.currentRound,
            totalRounds: room.totalRounds,
          });
        }
      }
    } catch (error) {
      this.emitError(error);
    }
  }

  private async handleSubmitChoice(choice: RpsChoice) {
    try {
      const roomCode = this.socket.data.roomCode;
      if (!roomCode) throw new Error("Not in a room");
      console.log(`[RPS] ${this.username} submits ${choice} in room ${roomCode}`);
      const result = this.submitChoice.execute(roomCode, this.userId, choice);
      const room = result.room;

      if (!result.roundResolved) {
        // Notify opponent that this player has chosen
        this.socket.to(room.roomCode).emit(RpsMultiplayerEvents.OPPONENT_CHOSE);
        return;
      }

      // Round resolved — send personalized results to each player
      const sockets = this.io.sockets.adapter.rooms.get(room.roomCode);
      if (sockets) {
        for (const socketId of sockets) {
          const s = this.io.sockets.sockets.get(socketId);
          if (!s) continue;

          const isP1 = s.data.userId === room.player1Id;
          const yourChoice = isP1 ? result.roundRecord!.p1Choice : result.roundRecord!.p2Choice;
          const opponentChoice = isP1 ? result.roundRecord!.p2Choice : result.roundRecord!.p1Choice;
          const yourScore = isP1 ? room.p1Score : room.p2Score;
          const opponentScore = isP1 ? room.p2Score : room.p1Score;
          const lastRound = room.rounds[room.rounds.length - 1];
          const outcome = isP1 ? lastRound.p1Outcome : lastRound.p2Outcome;

          s.emit(RpsMultiplayerEvents.ROUND_RESULT, {
            yourChoice,
            opponentChoice,
            outcome,
            scores: { you: yourScore, opponent: opponentScore },
          });

          if (room.isFinished()) {
            const overallResult = room.getOverallResult(s.data.userId);
            const opponentUsername = isP1 ? room.player2Username : room.player1Username;

            s.emit(RpsMultiplayerEvents.GAME_OVER, {
              finalScores: { you: yourScore, opponent: opponentScore },
              result: overallResult,
              opponentUsername,
            });

            // Save score for this player
            try {
              await this.saveScore.execute({
                userId: s.data.userId,
                gameId: GameId.RockPaperScissors,
                score: yourScore.wins,
              });
            } catch {
              // Score saving failure shouldn't break the game
            }
          }
        }

        // If not finished, start next round after a delay so players can see the result
        if (!room.isFinished()) {
          const roomCode = room.roomCode;
          const roundNumber = room.currentRound;
          const totalRounds = room.totalRounds;
          setTimeout(() => {
            this.io.to(roomCode).emit(RpsMultiplayerEvents.ROUND_START, {
              roundNumber,
              totalRounds,
            });
          }, 3000);
        }
      }
    } catch (error) {
      this.emitError(error);
    }
  }

  private handleLeaveRoom() {
    const roomCode = this.socket.data.roomCode;
    if (roomCode) {
      this.socket.to(roomCode).emit(RpsMultiplayerEvents.OPPONENT_LEFT);
      this.socket.leave(roomCode);
      this.socket.data.roomCode = undefined;
    }
  }

  private handleDisconnect() {
    console.log(`[Socket] Disconnected: ${this.username} (${this.userId})`);
    const roomCode = this.socket.data.roomCode;
    if (roomCode) {
      this.socket.to(roomCode).emit(RpsMultiplayerEvents.OPPONENT_LEFT);
    }
  }

  private emitError(error: unknown) {
    const message = error instanceof Error ? error.message : "An error occurred";
    this.socket.emit(RpsMultiplayerEvents.ERROR, { message });
  }
}

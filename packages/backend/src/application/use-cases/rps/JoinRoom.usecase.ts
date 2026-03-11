import { RpsRoom } from "../../../domain/entities/RpsRoom";
import { IRpsRoomRepository } from "../../../domain/interfaces/IRpsRoomRepository";

export class JoinRoomUseCase {
  constructor(private roomRepo: IRpsRoomRepository) {}

  execute(roomCode: string, userId: string, username: string): RpsRoom {
    const room = this.roomRepo.findByCode(roomCode.toUpperCase());
    if (!room) throw new Error("Room not found");
    if (room.status !== "waiting") throw new Error("Room is no longer available");
    if (room.player1Id === userId) throw new Error("Cannot join your own room");

    room.join(userId, username);
    return room;
  }
}

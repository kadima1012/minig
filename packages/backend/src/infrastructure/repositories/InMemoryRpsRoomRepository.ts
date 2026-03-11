import { RpsRoom } from "../../domain/entities/RpsRoom";
import { IRpsRoomRepository } from "../../domain/interfaces/IRpsRoomRepository";

export class InMemoryRpsRoomRepository implements IRpsRoomRepository {
  private rooms = new Map<string, RpsRoom>();

  save(room: RpsRoom): void {
    this.rooms.set(room.roomCode, room);
  }

  findByCode(code: string): RpsRoom | undefined {
    return this.rooms.get(code);
  }

  findByPlayerId(userId: string): RpsRoom | undefined {
    for (const room of this.rooms.values()) {
      if (room.hasPlayer(userId) && room.status !== "finished") return room;
    }
    return undefined;
  }

  remove(code: string): void {
    this.rooms.delete(code);
  }
}

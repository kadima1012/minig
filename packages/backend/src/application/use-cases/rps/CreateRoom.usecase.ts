import { RpsRoom } from "../../../domain/entities/RpsRoom";
import { IRpsRoomRepository } from "../../../domain/interfaces/IRpsRoomRepository";
import { RPS_TOTAL_ROUNDS } from "@minigames/shared";

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 6;

function generateCode(): string {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

export class CreateRoomUseCase {
  constructor(private roomRepo: IRpsRoomRepository) {}

  execute(userId: string, username: string): RpsRoom {
    const existing = this.roomRepo.findByPlayerId(userId);
    if (existing) {
      this.roomRepo.remove(existing.roomCode);
    }

    let code: string;
    do {
      code = generateCode();
    } while (this.roomRepo.findByCode(code));

    const room = new RpsRoom(code, userId, username, RPS_TOTAL_ROUNDS, new Date());
    this.roomRepo.save(room);
    return room;
  }
}

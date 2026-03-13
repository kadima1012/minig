import { randomUUID } from "crypto";
import {
  TC_MAX_PLAYERS,
  TC_MATCH_DURATION_MS,
  TC_HEX_GRID_RADIUS,
  TC_ROOM_CODE_LENGTH,
} from "@minigames/shared";
import { ITcMatchRepository } from "../../../domain/interfaces/ITcMatchRepository";
import { TcMatch } from "../../../domain/entities/TcMatch";

function generateCode(length: number): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export class CreateMatchUseCase {
  constructor(private matchRepo: ITcMatchRepository) {}

  execute(userId: string, username: string): TcMatch {
    // Check if player already in an active match
    const existing = this.matchRepo.findActiveByPlayerId(userId);
    if (existing) throw new Error("Already in an active match");

    let code = generateCode(TC_ROOM_CODE_LENGTH);
    while (this.matchRepo.findByCode(code)) {
      code = generateCode(TC_ROOM_CODE_LENGTH);
    }

    const match = new TcMatch(
      randomUUID(),
      code,
      TC_MAX_PLAYERS,
      TC_MATCH_DURATION_MS,
      TC_HEX_GRID_RADIUS,
      new Date()
    );

    match.addPlayer(userId, username);
    this.matchRepo.save(match);

    return match;
  }
}

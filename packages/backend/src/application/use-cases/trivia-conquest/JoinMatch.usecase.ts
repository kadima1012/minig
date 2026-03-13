import { ITcMatchRepository } from "../../../domain/interfaces/ITcMatchRepository";
import { TcMatch } from "../../../domain/entities/TcMatch";
import { TcMatchPlayer } from "../../../domain/entities/TcMatchPlayer";

export class JoinMatchUseCase {
  constructor(private matchRepo: ITcMatchRepository) {}

  execute(userId: string, username: string, matchCode: string): { match: TcMatch; player: TcMatchPlayer } {
    // Check if already in a match
    const existing = this.matchRepo.findActiveByPlayerId(userId);
    if (existing) throw new Error("Already in an active match");

    const match = this.matchRepo.findByCode(matchCode.toUpperCase());
    if (!match) throw new Error("Match not found");

    const player = match.addPlayer(userId, username);
    return { match, player };
  }
}

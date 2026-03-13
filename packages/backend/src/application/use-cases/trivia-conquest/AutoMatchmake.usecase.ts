import { ITcMatchRepository } from "../../../domain/interfaces/ITcMatchRepository";
import { TcMatch } from "../../../domain/entities/TcMatch";
import { TcMatchPlayer } from "../../../domain/entities/TcMatchPlayer";
import { CreateMatchUseCase } from "./CreateMatch.usecase";

export class AutoMatchmakeUseCase {
  constructor(
    private matchRepo: ITcMatchRepository,
    private createMatch: CreateMatchUseCase
  ) {}

  execute(userId: string, username: string): { match: TcMatch; player: TcMatchPlayer; isNew: boolean } {
    // Check if already in a match
    const existing = this.matchRepo.findActiveByPlayerId(userId);
    if (existing) {
      const player = existing.getPlayer(userId);
      if (player) return { match: existing, player, isNew: false };
    }

    // Find an available lobby
    const lobbies = this.matchRepo.findLobbyMatches();
    for (const lobby of lobbies) {
      if (lobby.players.size < lobby.maxPlayers && !lobby.hasPlayer(userId)) {
        const player = lobby.addPlayer(userId, username);
        return { match: lobby, player, isNew: false };
      }
    }

    // No lobby found, create a new match
    const match = this.createMatch.execute(userId, username);
    const player = match.getPlayer(userId)!;
    return { match, player, isNew: true };
  }
}

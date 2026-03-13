import { TcMapState } from "@minigames/shared";
import { ITcMatchRepository } from "../../../domain/interfaces/ITcMatchRepository";

export class GetMatchStateUseCase {
  constructor(private matchRepo: ITcMatchRepository) {}

  execute(matchId: string): TcMapState {
    const match = this.matchRepo.findById(matchId);
    if (!match) throw new Error("Match not found");

    return {
      hexes: match.getHexesData(),
      players: match.getPlayersData(),
      matchTimerEndsAt: match.endsAt?.toISOString() ?? "",
      matchId: match.id,
      matchCode: match.code,
    };
  }
}

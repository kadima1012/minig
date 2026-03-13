import { randomUUID } from "crypto";
import { TC_DUEL_QUESTIONS } from "@minigames/shared";
import { ITcMatchRepository } from "../../../domain/interfaces/ITcMatchRepository";
import { ITcQuestionRepository } from "../../../domain/interfaces/ITcQuestionRepository";
import { TcDuel } from "../../../domain/entities/TcDuel";

export class AttackTerritoryUseCase {
  constructor(
    private matchRepo: ITcMatchRepository,
    private questionRepo: ITcQuestionRepository
  ) {}

  execute(matchId: string, attackerId: string, hexId: string): TcDuel {
    const match = this.matchRepo.findById(matchId);
    if (!match) throw new Error("Match not found");

    const check = match.canAttack(attackerId, hexId);
    if (!check.ok) throw new Error(check.reason || "Cannot attack");

    const targetHex = match.hexagons.get(hexId)!;
    const defenderId = targetHex.isNeutral() ? null : targetHex.ownerId;

    // Check if defender is in a duel
    if (defenderId) {
      const defender = match.getPlayer(defenderId);
      if (defender?.isInDuel) throw new Error("Defender is already in a duel");
    }

    const questions = this.questionRepo.findRandomByCategory(targetHex.category, TC_DUEL_QUESTIONS);
    if (questions.length < TC_DUEL_QUESTIONS) {
      throw new Error("Not enough questions available");
    }

    const tiebreaker = this.questionRepo.findRandomTiebreaker(targetHex.category);

    const duel = new TcDuel(
      randomUUID(),
      matchId,
      hexId,
      attackerId,
      defenderId,
      targetHex.category,
      questions,
      tiebreaker
    );

    match.registerDuel(duel);
    return duel;
  }
}

import { TC_QUESTION_TIMEOUT_MS } from "@minigames/shared";
import { TcDuel, DuelAnswer } from "../../../domain/entities/TcDuel";

export class SubmitDuelAnswerUseCase {
  execute(
    duel: TcDuel,
    userId: string,
    questionIndex: number,
    selectedIndex: number
  ): { answer: DuelAnswer; timeMs: number } {
    if (duel.currentQuestionIndex !== questionIndex) {
      throw new Error("Wrong question index");
    }

    const timeMs = duel.questionStartedAt
      ? Math.min(Date.now() - duel.questionStartedAt.getTime(), TC_QUESTION_TIMEOUT_MS)
      : TC_QUESTION_TIMEOUT_MS;

    const answer = duel.submitAnswer(userId, selectedIndex, timeMs);

    // For neutral attacks, auto-answer for defender
    if (duel.isNeutral) {
      duel.autoAnswerDefender();
    }

    return { answer, timeMs };
  }
}

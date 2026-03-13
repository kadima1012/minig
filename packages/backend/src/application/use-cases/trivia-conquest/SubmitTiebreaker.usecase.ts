import { TcDuel } from "../../../domain/entities/TcDuel";

export class SubmitTiebreakerUseCase {
  execute(duel: TcDuel, userId: string, numericAnswer: number): void {
    duel.submitTiebreakerAnswer(userId, numericAnswer);
  }
}

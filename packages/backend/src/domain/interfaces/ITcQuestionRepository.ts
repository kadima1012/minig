import { TcCategory } from "@minigames/shared";
import { TcTriviaQuestion, TcTiebreakerQuestion } from "../entities/TcTriviaQuestion";

export interface ITcQuestionRepository {
  findRandomByCategory(category: TcCategory, count: number): TcTriviaQuestion[];
  findRandomTiebreaker(category: TcCategory): TcTiebreakerQuestion;
  seedQuestions(): void;
}

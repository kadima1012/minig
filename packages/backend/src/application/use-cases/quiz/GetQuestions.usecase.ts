import { IQuestionRepository } from "../../../domain/interfaces/IQuestionRepository";
import { QuizQuestion } from "@minigames/shared";

export class GetQuestionsUseCase {
  constructor(private readonly questionRepo: IQuestionRepository) {}

  async execute(count: number = 10): Promise<QuizQuestion[]> {
    const questions = await this.questionRepo.findRandom(count);
    return questions.map((q) => ({
      id: q.id,
      text: q.text,
      options: q.options,
      correctIndex: q.correctIndex,
      category: q.category,
      timeoutMs: q.timeoutMs,
    }));
  }
}

import { IQuestionRepository } from "../../../domain/interfaces/IQuestionRepository";
import { QuizAnswerResponse } from "@minigames/shared";

interface SubmitAnswerInput {
  questionId: string;
  selectedIndex: number;
  timeTakenMs: number;
}

export class SubmitAnswerUseCase {
  constructor(private readonly questionRepo: IQuestionRepository) {}

  async execute(input: SubmitAnswerInput): Promise<QuizAnswerResponse> {
    const question = await this.questionRepo.findById(input.questionId);
    if (!question) throw new Error(`Question ${input.questionId} not found`);

    const correct = question.isCorrect(input.selectedIndex);
    const score = correct
      ? question.calculateScore(input.timeTakenMs)
      : 0;

    return {
      correct,
      correctIndex: question.correctIndex,
      score,
    };
  }
}

import { QuizQuestion, QuizAnswerResponse } from "@minigames/shared";
import { quizApi } from "../../../infrastructure/api/quiz.api";

export class QuizGameUseCase {
  async loadQuestions(): Promise<QuizQuestion[]> {
    return quizApi.getQuestions();
  }

  async submitAnswer(
    questionId: string,
    selectedIndex: number,
    timeTakenMs: number
  ): Promise<QuizAnswerResponse> {
    return quizApi.submitAnswer({ sessionId: "", questionId, selectedIndex, timeTakenMs });
  }
}

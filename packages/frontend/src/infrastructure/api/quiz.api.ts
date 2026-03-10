import apiClient from "./client";
import { ApiResponse, QuizAnswerRequest, QuizAnswerResponse, QuizQuestion } from "@minigames/shared";

export const quizApi = {
  getQuestions: async (): Promise<QuizQuestion[]> => {
    const res = await apiClient.get<ApiResponse<QuizQuestion[]>>("/quiz/questions");
    return res.data.data;
  },

  submitAnswer: async (payload: QuizAnswerRequest): Promise<QuizAnswerResponse> => {
    const res = await apiClient.post<ApiResponse<QuizAnswerResponse>>("/quiz/answer", payload);
    return res.data.data;
  },
};

export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  category: string;
  timeoutMs: number;
}

export interface QuizSession {
  sessionId: string;
  questions: QuizQuestion[];
  currentIndex: number;
  score: number;
  startedAt: string;
}

export interface QuizAnswerRequest {
  sessionId: string;
  questionId: string;
  selectedIndex: number;
  timeTakenMs: number;
}

export interface QuizAnswerResponse {
  correct: boolean;
  correctIndex: number;
  score: number;
}

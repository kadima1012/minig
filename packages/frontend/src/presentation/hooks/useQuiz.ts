import { useState, useCallback } from "react";
import { QuizQuestion, QuizAnswerResponse } from "@minigames/shared";
import { QuizGameUseCase } from "../../application/use-cases/quiz/QuizGameUseCase";

const useCase = new QuizGameUseCase();

export function useQuiz() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lastAnswer, setLastAnswer] = useState<QuizAnswerResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadQuestions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const qs = await useCase.loadQuestions();
      setQuestions(qs);
      setCurrentIndex(0);
      setScore(0);
      setLastAnswer(null);
      setIsFinished(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const submitAnswer = useCallback(
    async (selectedIndex: number, timeTakenMs: number) => {
      if (!questions[currentIndex]) return;
      const result = await useCase.submitAnswer(
        questions[currentIndex].id,
        selectedIndex,
        timeTakenMs
      );
      setLastAnswer(result);
      setScore((s) => s + result.score);
      return result;
    },
    [questions, currentIndex]
  );

  const nextQuestion = useCallback(() => {
    setLastAnswer(null);
    if (currentIndex + 1 >= questions.length) {
      setIsFinished(true);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }, [currentIndex, questions.length]);

  return {
    questions,
    currentQuestion: questions[currentIndex] ?? null,
    currentIndex,
    score,
    lastAnswer,
    isLoading,
    isFinished,
    error,
    loadQuestions,
    submitAnswer,
    nextQuestion,
  };
}

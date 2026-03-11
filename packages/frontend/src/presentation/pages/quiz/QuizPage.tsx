import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { GameId, QUIZ_QUESTION_TIMEOUT_MS } from "@minigames/shared";
import { useQuiz } from "../../hooks/useQuiz";
import { useTimer } from "../../hooks/useTimer";
import { useAuth } from "../../hooks/useAuth";
import { useScores } from "../../hooks/useScores";
import { QuestionCard } from "../../components/quiz/QuestionCard";
import { TimerBar } from "../../components/common/TimerBar";
import { ScoreDisplay } from "../../components/common/ScoreDisplay";
import { Button } from "../../components/common/Button";
import { AuthWarning } from "../../components/common/AuthWarning";
import { Leaderboard } from "../../components/common/Leaderboard";
import { PersonalBest } from "../../components/common/PersonalBest";

export function QuizPage() {
  const navigate = useNavigate();
  const quiz = useQuiz();
  const { user } = useAuth();
  const { saveScore, getBest, loadBestScores } = useScores();
  const startTimeRef = useRef<number>(0);
  const scoreSavedRef = useRef(false);

  const handleTimerExpired = () => {
    if (quiz.currentQuestion && !quiz.lastAnswer) {
      quiz.submitAnswer(-1, QUIZ_QUESTION_TIMEOUT_MS);
    }
  };

  const timer = useTimer(QUIZ_QUESTION_TIMEOUT_MS, handleTimerExpired);

  useEffect(() => {
    quiz.loadQuestions();
    loadBestScores();
  }, []);

  useEffect(() => {
    if (quiz.currentQuestion && !quiz.isFinished) {
      timer.reset();
      timer.start();
      startTimeRef.current = Date.now();
    }
  }, [quiz.currentIndex, quiz.currentQuestion]);

  useEffect(() => {
    if (quiz.isFinished && !scoreSavedRef.current) {
      scoreSavedRef.current = true;
      saveScore(GameId.Quiz, quiz.score);
    }
  }, [quiz.isFinished]);

  const handleAnswer = async (index: number) => {
    timer.stop();
    const timeTaken = Date.now() - startTimeRef.current;
    await quiz.submitAnswer(index, timeTaken);
  };

  const handleNext = () => {
    quiz.nextQuestion();
  };

  if (quiz.isLoading) {
    return <LoadingScreen />;
  }

  if (quiz.isFinished) {
    return (
      <ResultScreen
        score={quiz.score}
        total={quiz.questions.length}
        bestScore={getBest(GameId.Quiz)}
        isLoggedIn={!!user}
        onHome={() => navigate("/")}
      />
    );
  }

  if (!quiz.currentQuestion) return null;

  return (
    <div className="min-h-screen bg-surface px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-5">
        {!user && <AuthWarning />}
        <div className="flex justify-between items-center">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            ← Back
          </Button>
          <ScoreDisplay score={quiz.score} />
        </div>
        <TimerBar remainingMs={timer.remainingMs} totalMs={QUIZ_QUESTION_TIMEOUT_MS} />
        <QuestionCard
          question={quiz.currentQuestion}
          questionNumber={quiz.currentIndex + 1}
          total={quiz.questions.length}
          lastAnswer={quiz.lastAnswer}
          onAnswer={handleAnswer}
        />
        {quiz.lastAnswer && (
          <Button className="w-full" onClick={handleNext}>
            {quiz.currentIndex + 1 >= quiz.questions.length ? "See Results" : "Next Question →"}
          </Button>
        )}
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <p className="text-gray-400 animate-pulse text-lg">Loading questions...</p>
    </div>
  );
}

function ResultScreen({
  score,
  total,
  bestScore,
  isLoggedIn,
  onHome,
}: {
  score: number;
  total: number;
  bestScore: number | null;
  isLoggedIn: boolean;
  onHome: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) {
      gsap.fromTo(ref.current, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.5)" });
    }
  }, []);

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-6">
        <div ref={ref} className="bg-surface-elevated rounded-2xl p-10 text-center shadow-2xl space-y-4">
          <div className="text-6xl">🏆</div>
          <h2 className="text-3xl font-bold">Quiz Complete!</h2>
          <p className="text-gray-400">{total} questions answered</p>
          <div className="text-5xl font-extrabold text-primary">{score.toLocaleString()}</div>
          {isLoggedIn && <PersonalBest bestScore={bestScore} currentScore={score} />}
          {!isLoggedIn && <AuthWarning />}
          <Button className="w-full" onClick={onHome}>
            Back to Home
          </Button>
        </div>
        <Leaderboard gameId={GameId.Quiz} />
      </div>
    </div>
  );
}

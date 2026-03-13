import React, { useState, useEffect, useCallback } from "react";
import { TcDuelQuestionData, TcDuelQuestionResult, TC_CATEGORY_COLORS } from "@minigames/shared";
import { TimerBar } from "../common/TimerBar";

interface DuelScreenProps {
  duelId: string;
  opponentUsername: string | null;
  isNeutral: boolean;
  currentQuestion: TcDuelQuestionData | null;
  lastResult: TcDuelQuestionResult | null;
  opponentAnswered: boolean;
  myAnswer: number | null;
  onAnswer: (duelId: string, questionIndex: number, selectedIndex: number) => void;
}

export function DuelScreen({
  duelId,
  opponentUsername,
  isNeutral,
  currentQuestion,
  lastResult,
  opponentAnswered,
  myAnswer,
  onAnswer,
}: DuelScreenProps) {
  const [remainingMs, setRemainingMs] = useState(0);

  // Timer countdown
  useEffect(() => {
    if (!currentQuestion) return;
    setRemainingMs(currentQuestion.timeoutMs);

    const interval = setInterval(() => {
      setRemainingMs((prev) => Math.max(0, prev - 100));
    }, 100);

    return () => clearInterval(interval);
  }, [currentQuestion]);

  const handleAnswer = useCallback(
    (idx: number) => {
      if (myAnswer !== null || !currentQuestion) return;
      onAnswer(duelId, currentQuestion.questionIndex, idx);
    },
    [duelId, currentQuestion, myAnswer, onAnswer]
  );

  // Show result between questions
  if (lastResult && !currentQuestion) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
        <div className="bg-surface rounded-2xl p-8 max-w-md w-full text-center space-y-4">
          <h3 className="text-xl font-bold">
            {lastResult.yourCorrect ? "Correct!" : "Wrong!"}
          </h3>
          <div className="flex justify-center gap-8 text-2xl font-bold">
            <div>
              <div className="text-sm text-gray-400 mb-1">You</div>
              <div className="text-primary">{lastResult.scores.you}</div>
            </div>
            {!isNeutral && (
              <div>
                <div className="text-sm text-gray-400 mb-1">{opponentUsername || "Opponent"}</div>
                <div className="text-red-400">{lastResult.scores.opponent}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
        <div className="text-xl text-gray-400 animate-pulse">Preparing duel...</div>
      </div>
    );
  }

  const categoryColor = TC_CATEGORY_COLORS[currentQuestion.category] || "#6b7280";

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl p-6 max-w-lg w-full space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span
            className="px-3 py-1 rounded-full text-sm font-bold text-white"
            style={{ backgroundColor: categoryColor }}
          >
            {currentQuestion.category.toUpperCase()}
          </span>
          <span className="text-gray-400 text-sm">
            Question {currentQuestion.questionIndex + 1}/{currentQuestion.totalQuestions}
          </span>
        </div>

        {/* Timer */}
        <TimerBar remainingMs={remainingMs} totalMs={currentQuestion.timeoutMs} />

        {/* Question */}
        <h3 className="text-lg font-bold text-white text-center">{currentQuestion.text}</h3>

        {/* Options */}
        <div className="grid grid-cols-1 gap-3">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = myAnswer === idx;
            const isCorrect = lastResult && lastResult.correctIndex === idx;
            const isWrong = lastResult && isSelected && !lastResult.yourCorrect;

            let bgClass = "bg-surface-elevated hover:bg-surface-border";
            if (isSelected && !lastResult) bgClass = "bg-primary";
            if (isCorrect) bgClass = "bg-green-600";
            if (isWrong) bgClass = "bg-red-600";

            return (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={myAnswer !== null}
                className={`${bgClass} text-white rounded-xl px-4 py-3 text-left font-medium transition-all duration-200 disabled:cursor-not-allowed`}
              >
                <span className="font-bold mr-2">{String.fromCharCode(65 + idx)}.</span>
                {option}
              </button>
            );
          })}
        </div>

        {/* Opponent status */}
        {!isNeutral && (
          <div className="text-center text-sm text-gray-400">
            {opponentAnswered ? (
              <span className="text-yellow-400">{opponentUsername} has answered!</span>
            ) : (
              <span className="animate-pulse">{opponentUsername} is thinking...</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { QuizQuestion, QuizAnswerResponse } from "@minigames/shared";

interface QuestionCardProps {
  question: QuizQuestion;
  questionNumber: number;
  total: number;
  lastAnswer: QuizAnswerResponse | null;
  onAnswer: (index: number) => void;
}

export function QuestionCard({
  question,
  questionNumber,
  total,
  lastAnswer,
  onAnswer,
}: QuestionCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { x: 80, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.35, ease: "power2.out" }
      );
    }
  }, [question.id]);

  return (
    <div ref={cardRef} className="bg-surface-elevated rounded-2xl p-6 shadow-xl">
      <div className="flex justify-between text-sm text-gray-400 mb-4">
        <span className="bg-primary/20 text-primary px-3 py-1 rounded-full">
          {question.category}
        </span>
        <span>
          {questionNumber} / {total}
        </span>
      </div>
      <h2 className="text-xl font-semibold mb-6">{question.text}</h2>
      <div className="grid grid-cols-1 gap-3">
        {question.options.map((option, idx) => {
          let style =
            "w-full text-left px-5 py-3 rounded-xl border transition-all duration-200 font-medium";
          if (lastAnswer) {
            if (idx === question.correctIndex) {
              style += " border-green-500 bg-green-500/20 text-green-300";
            } else if (idx !== question.correctIndex) {
              style += " border-surface-border bg-surface text-gray-500 cursor-not-allowed";
            }
          } else {
            style +=
              " border-surface-border bg-surface hover:border-primary hover:bg-primary/10 cursor-pointer";
          }
          return (
            <button
              key={idx}
              className={style}
              onClick={() => !lastAnswer && onAnswer(idx)}
              disabled={!!lastAnswer}
            >
              <span className="mr-3 text-gray-400">{String.fromCharCode(65 + idx)}.</span>
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";

interface ScoreDisplayProps {
  score: number;
  label?: string;
}

export function ScoreDisplay({ score, label = "Score" }: ScoreDisplayProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const prevScore = useRef(score);

  useEffect(() => {
    if (ref.current && score !== prevScore.current) {
      gsap.fromTo(ref.current, { scale: 1.4, color: "#a5f3fc" }, { scale: 1, color: "#ffffff", duration: 0.4 });
      prevScore.current = score;
    }
  }, [score]);

  return (
    <div className="flex flex-col items-center">
      <span className="text-xs text-gray-400 uppercase tracking-widest">{label}</span>
      <span ref={ref} className="text-2xl font-bold">
        {score.toLocaleString()}
      </span>
    </div>
  );
}

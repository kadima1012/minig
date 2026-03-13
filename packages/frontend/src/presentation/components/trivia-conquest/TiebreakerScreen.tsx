import React, { useState, useEffect } from "react";
import { TcTiebreakerData } from "@minigames/shared";
import { TimerBar } from "../common/TimerBar";
import { Button } from "../common/Button";

interface TiebreakerScreenProps {
  data: TcTiebreakerData;
  onSubmit: (duelId: string, numericAnswer: number) => void;
}

export function TiebreakerScreen({ data, onSubmit }: TiebreakerScreenProps) {
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [remainingMs, setRemainingMs] = useState(data.timeoutMs);

  useEffect(() => {
    setRemainingMs(data.timeoutMs);
    setAnswer("");
    setSubmitted(false);

    const interval = setInterval(() => {
      setRemainingMs((prev) => Math.max(0, prev - 100));
    }, 100);

    return () => clearInterval(interval);
  }, [data]);

  const handleSubmit = () => {
    const num = parseFloat(answer);
    if (isNaN(num)) return;
    setSubmitted(true);
    onSubmit(data.duelId, num);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl p-8 max-w-md w-full space-y-6 text-center">
        <div className="text-yellow-400 font-bold text-sm uppercase tracking-wider">Tiebreaker</div>
        <h3 className="text-xl font-bold">{data.text}</h3>
        <TimerBar remainingMs={remainingMs} totalMs={data.timeoutMs} />
        <p className="text-gray-400 text-sm">Enter a number — closest to the answer wins!</p>
        <input
          type="number"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={submitted}
          placeholder="Your answer..."
          className="bg-surface-elevated text-white text-center text-2xl rounded-xl px-6 py-3 w-full border border-surface-border focus:border-primary focus:outline-none"
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />
        <Button onClick={handleSubmit} disabled={submitted || !answer} size="lg" className="w-full">
          {submitted ? "Submitted!" : "Submit Answer"}
        </Button>
      </div>
    </div>
  );
}

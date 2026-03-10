import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";

interface TimerBarProps {
  remainingMs: number;
  totalMs: number;
}

export function TimerBar({ remainingMs, totalMs }: TimerBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const fraction = remainingMs / totalMs;
  const seconds = Math.ceil(remainingMs / 1000);

  const color =
    fraction > 0.5 ? "bg-green-500" : fraction > 0.25 ? "bg-yellow-500" : "bg-red-500";

  useEffect(() => {
    if (barRef.current && fraction <= 0.25) {
      gsap.to(barRef.current, { opacity: 0.6, duration: 0.3, yoyo: true, repeat: 1 });
    }
  }, [fraction]);

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-bold w-8 text-right">{seconds}s</span>
      <div className="flex-1 h-3 bg-surface-border rounded-full overflow-hidden">
        <div
          ref={barRef}
          className={`h-full rounded-full transition-all duration-100 ${color}`}
          style={{ width: `${Math.max(0, fraction * 100)}%` }}
        />
      </div>
    </div>
  );
}

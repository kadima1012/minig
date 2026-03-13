import React, { useState, useEffect } from "react";
import { Button } from "../common/Button";

interface MatchHeaderProps {
  matchTimerEndsAt: string | null;
  myTerritoryCount: number;
  totalHexes: number;
  matchCode: string | null;
  onLeave: () => void;
}

export function MatchHeader({
  matchTimerEndsAt,
  myTerritoryCount,
  totalHexes,
  matchCode,
  onLeave,
}: MatchHeaderProps) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!matchTimerEndsAt) return;

    const update = () => {
      const diff = new Date(matchTimerEndsAt).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("0:00");
        return;
      }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${mins}:${secs.toString().padStart(2, "0")}`);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [matchTimerEndsAt]);

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-surface-elevated border-b border-surface-border">
      <Button variant="ghost" size="sm" onClick={onLeave}>
        ← Leave
      </Button>
      <div className="flex items-center gap-6">
        {matchCode && (
          <span className="text-xs text-gray-500 font-mono">{matchCode}</span>
        )}
        <div className="text-center">
          <div className="text-2xl font-bold font-mono text-primary">{timeLeft}</div>
        </div>
        <div className="text-sm text-gray-400">
          <span className="text-white font-bold">{myTerritoryCount}</span>/{totalHexes} territories
        </div>
      </div>
      <div className="w-16" /> {/* spacer for balance */}
    </div>
  );
}

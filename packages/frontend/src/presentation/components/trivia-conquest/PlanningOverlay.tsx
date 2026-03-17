import React, { useState, useEffect } from "react";

interface PlanningOverlayProps {
  roundNumber: number;
  planningEndsAt: string | null;
  mySelectedHexId: string | null;
  onDeselect: () => void;
}

export function PlanningOverlay({ roundNumber, planningEndsAt, mySelectedHexId, onDeselect }: PlanningOverlayProps) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!planningEndsAt) return;

    const update = () => {
      const remaining = Math.max(0, new Date(planningEndsAt).getTime() - Date.now());
      setTimeLeft(Math.ceil(remaining / 1000));
    };
    update();
    const interval = setInterval(update, 200);
    return () => clearInterval(interval);
  }, [planningEndsAt]);

  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
      <div className="bg-surface-elevated/95 backdrop-blur-sm border border-surface-border rounded-2xl px-6 py-4 shadow-xl text-center pointer-events-auto min-w-[280px]">
        {/* Round badge */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Round {roundNumber}</span>
          <span className="text-xs text-gray-500">·</span>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-500">Planning</span>
        </div>

        {/* Timer */}
        <div className={`text-4xl font-black tabular-nums ${timeLeft <= 3 ? "text-red-500 animate-pulse" : "text-white"}`}>
          {timeLeft}s
        </div>

        {/* Instructions */}
        <p className="text-sm text-gray-400 mt-2">
          {mySelectedHexId
            ? "Hex selected! Waiting for others..."
            : "Select a neighboring hex to attack"
          }
        </p>

        {/* Deselect button */}
        {mySelectedHexId && (
          <button
            onClick={onDeselect}
            className="mt-2 px-3 py-1 text-xs bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            Change selection
          </button>
        )}
      </div>
    </div>
  );
}

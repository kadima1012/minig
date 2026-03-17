import React, { useState, useEffect } from "react";
import { Button } from "../common/Button";

interface MatchHeaderProps {
  matchTimerEndsAt: string | null;
  myTerritoryCount: number;
  totalHexes: number;
  matchCode: string | null;
  hasSurrendered: boolean;
  onLeave: () => void;
  onSurrender: () => void;
}

export function MatchHeader({
  matchTimerEndsAt,
  myTerritoryCount,
  totalHexes,
  matchCode,
  hasSurrendered,
  onLeave,
  onSurrender,
}: MatchHeaderProps) {
  const [timeLeft, setTimeLeft] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

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
    <>
      <div className="flex items-center justify-between px-4 py-2 bg-surface-elevated border-b border-surface-border">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onLeave}>
            \u2190 Leave
          </Button>
          {!hasSurrendered && (
            <Button variant="ghost" size="sm" onClick={() => setShowConfirm(true)} className="text-red-400 hover:text-red-300">
              Surrender
            </Button>
          )}
          {hasSurrendered && (
            <span className="text-xs text-red-400 font-bold uppercase">Surrendered</span>
          )}
        </div>
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
        <div className="w-16" />
      </div>

      {/* Surrender confirmation dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-elevated border border-surface-border rounded-2xl p-6 shadow-2xl max-w-sm text-center">
            <h3 className="text-xl font-bold text-red-400 mb-3">Surrender?</h3>
            <p className="text-gray-400 text-sm mb-5">
              All your territories ({myTerritoryCount}) will become neutral. This cannot be undone.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="ghost" onClick={() => setShowConfirm(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowConfirm(false);
                  onSurrender();
                }}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Confirm Surrender
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

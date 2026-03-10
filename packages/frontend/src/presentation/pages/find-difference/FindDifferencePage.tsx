import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { useFindDifference } from "../../hooks/useFindDifference";
import { useTimer } from "../../hooks/useTimer";
import { ImagePanel } from "../../components/find-difference/ImagePanel";
import { TimerBar } from "../../components/common/TimerBar";
import { Button } from "../../components/common/Button";
import { FIND_DIFFERENCE_TIME_LIMIT_MS } from "@minigames/shared";

export function FindDifferencePage() {
  const navigate = useNavigate();
  const {
    puzzle,
    foundMarkers,
    foundCount,
    isLoading,
    isFinished,
    error,
    loadPuzzle,
    handleClick,
    onTimerExpired,
  } = useFindDifference();

  const timer = useTimer(FIND_DIFFERENCE_TIME_LIMIT_MS, onTimerExpired);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadPuzzle().then(() => timer.start());
  }, []);

  useEffect(() => {
    if (isFinished) {
      timer.stop();
      if (resultRef.current) {
        gsap.fromTo(resultRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 });
      }
    }
  }, [isFinished]);

  const onPanelClick = async (x: number, y: number) => {
    if (!isFinished) await handleClick(x, y);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <p className="text-gray-400 animate-pulse">Loading puzzle...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4">
        <p className="text-red-400">{error}</p>
        <Button onClick={() => loadPuzzle()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="flex justify-between items-center">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            ← Back
          </Button>
          <span className="font-semibold">
            Found: {foundCount} / {puzzle?.totalDifferences ?? "?"}
          </span>
        </div>
        <TimerBar remainingMs={timer.remainingMs} totalMs={FIND_DIFFERENCE_TIME_LIMIT_MS} />

        {isFinished && (
          <div
            ref={resultRef}
            className={`rounded-xl p-4 text-center font-semibold text-lg ${
              foundCount >= (puzzle?.totalDifferences ?? 0)
                ? "bg-green-500/20 text-green-300"
                : "bg-red-500/20 text-red-300"
            }`}
          >
            {foundCount >= (puzzle?.totalDifferences ?? 0)
              ? "🎉 All differences found!"
              : `Time's up! You found ${foundCount} / ${puzzle?.totalDifferences} differences.`}
          </div>
        )}

        {puzzle && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ImagePanel
              imageUrl={puzzle.imageAUrl}
              label="Image A"
              markers={foundMarkers}
              onImageClick={onPanelClick}
              disabled={isFinished}
            />
            <ImagePanel
              imageUrl={puzzle.imageBUrl}
              label="Image B"
              markers={foundMarkers}
              onImageClick={onPanelClick}
              disabled={isFinished}
            />
          </div>
        )}

        {isFinished && (
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => navigate("/")}>
              Home
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                loadPuzzle().then(() => timer.start());
              }}
            >
              New Puzzle
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

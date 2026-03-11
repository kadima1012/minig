import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { GameId, FIND_DIFFERENCE_TIME_LIMIT_MS } from "@minigames/shared";
import { useFindDifference } from "../../hooks/useFindDifference";
import { useTimer } from "../../hooks/useTimer";
import { useAuth } from "../../hooks/useAuth";
import { useScores } from "../../hooks/useScores";
import { ImagePanel } from "../../components/find-difference/ImagePanel";
import { TimerBar } from "../../components/common/TimerBar";
import { Button } from "../../components/common/Button";
import { AuthWarning } from "../../components/common/AuthWarning";
import { Leaderboard } from "../../components/common/Leaderboard";
import { PersonalBest } from "../../components/common/PersonalBest";

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
  const { user } = useAuth();
  const { saveScore, getBest, loadBestScores } = useScores();
  const resultRef = useRef<HTMLDivElement>(null);
  const scoreSavedRef = useRef(false);

  useEffect(() => {
    loadPuzzle().then(() => timer.start());
    loadBestScores();
  }, []);

  useEffect(() => {
    if (isFinished) {
      timer.stop();
      if (resultRef.current) {
        gsap.fromTo(resultRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 });
      }
      if (!scoreSavedRef.current) {
        scoreSavedRef.current = true;
        saveScore(GameId.FindDifference, foundCount);
      }
    }
  }, [isFinished]);

  const onPanelClick = async (x: number, y: number) => {
    if (!isFinished) await handleClick(x, y);
  };

  const handleNewPuzzle = () => {
    scoreSavedRef.current = false;
    loadPuzzle().then(() => timer.start());
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
        {!user && <AuthWarning />}
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
          <div ref={resultRef} className="space-y-3">
            <div
              className={`rounded-xl p-4 text-center font-semibold text-lg ${
                foundCount >= (puzzle?.totalDifferences ?? 0)
                  ? "bg-green-500/20 text-green-300"
                  : "bg-red-500/20 text-red-300"
              }`}
            >
              {foundCount >= (puzzle?.totalDifferences ?? 0)
                ? "All differences found!"
                : `Time's up! You found ${foundCount} / ${puzzle?.totalDifferences} differences.`}
            </div>
            {user && <PersonalBest bestScore={getBest(GameId.FindDifference)} currentScore={foundCount} />}
            {!user && <AuthWarning />}
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
          <div className="space-y-4">
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => navigate("/")}>
                Home
              </Button>
              <Button className="flex-1" onClick={handleNewPuzzle}>
                New Puzzle
              </Button>
            </div>
            <Leaderboard gameId={GameId.FindDifference} />
          </div>
        )}
      </div>
    </div>
  );
}

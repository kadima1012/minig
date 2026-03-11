import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { RpsChoice } from "@minigames/shared";
import { useRpsMultiplayer } from "../../hooks/useRpsMultiplayer";
import { useAuth } from "../../hooks/useAuth";
import { RpsLobby } from "../../components/rps/RpsLobby";
import { RpsMultiplayerArena } from "../../components/rps/RpsMultiplayerArena";
import { Button } from "../../components/common/Button";

export function RpsMultiplayerPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const mp = useRpsMultiplayer();
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (mp.phase === "finished" && resultRef.current) {
      gsap.fromTo(resultRef.current, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.5)" });
    }
  }, [mp.phase]);

  if (!user) return null;

  // Error toast
  const errorBanner = mp.error && (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-600/90 text-white px-6 py-3 rounded-xl shadow-lg z-50">
      <div className="flex items-center gap-3">
        <span>{mp.error}</span>
        <button onClick={mp.clearError} className="text-white/70 hover:text-white">✕</button>
      </div>
    </div>
  );

  // Finished screen
  if (mp.phase === "finished" && mp.gameOver) {
    const go = mp.gameOver;
    const emoji = go.result === "win" ? "🏆" : go.result === "lose" ? "😢" : "🤝";
    const label = go.result === "win" ? "You Won!" : go.result === "lose" ? "You Lost!" : "It's a Draw!";

    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-4">
        {errorBanner}
        <div className="max-w-md w-full space-y-6">
          <div ref={resultRef} className="bg-surface-elevated rounded-2xl p-10 text-center shadow-2xl space-y-4">
            <div className="text-6xl">{emoji}</div>
            <h2 className="text-3xl font-bold">{label}</h2>
            <p className="text-gray-400">vs {go.opponentUsername}</p>
            <div className="grid grid-cols-2 gap-6 text-center">
              <div>
                <p className="text-sm text-gray-400 mb-1">You</p>
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div>
                    <div className="text-xl font-bold text-green-400">{go.finalScores.you.wins}</div>
                    <div className="text-xs text-gray-500">W</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-yellow-400">{go.finalScores.you.draws}</div>
                    <div className="text-xs text-gray-500">D</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-red-400">{go.finalScores.you.losses}</div>
                    <div className="text-xs text-gray-500">L</div>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">{go.opponentUsername}</p>
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div>
                    <div className="text-xl font-bold text-green-400">{go.finalScores.opponent.wins}</div>
                    <div className="text-xs text-gray-500">W</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-yellow-400">{go.finalScores.opponent.draws}</div>
                    <div className="text-xs text-gray-500">D</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-red-400">{go.finalScores.opponent.losses}</div>
                    <div className="text-xs text-gray-500">L</div>
                  </div>
                </div>
              </div>
            </div>
            {mp.error && <p className="text-yellow-400 text-sm">{mp.error}</p>}
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => navigate("/rps")}>
                Back to RPS
              </Button>
              <Button className="flex-1" onClick={() => mp.leaveRoom()}>
                Play Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Playing screen
  if (mp.phase === "playing" && mp.opponentUsername) {
    return (
      <div className="min-h-screen bg-surface px-4 py-10">
        {errorBanner}
        <div className="max-w-lg mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <Button variant="ghost" size="sm" onClick={() => { mp.leaveRoom(); navigate("/rps"); }}>
              ← Leave
            </Button>
            <div className="grid grid-cols-3 gap-3 text-center text-sm">
              <span className="text-green-400 font-bold">{mp.myScore.wins}W</span>
              <span className="text-yellow-400 font-bold">{mp.myScore.draws}D</span>
              <span className="text-red-400 font-bold">{mp.myScore.losses}L</span>
            </div>
          </div>
          <div className="w-full bg-surface-border rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(mp.roundNumber / mp.totalRounds) * 100}%` }}
            />
          </div>
          <RpsMultiplayerArena
            opponentUsername={mp.opponentUsername}
            roundNumber={mp.roundNumber}
            totalRounds={mp.totalRounds}
            myChoice={mp.myChoice}
            opponentChose={mp.opponentChose}
            lastResult={mp.lastResult}
            onChoice={mp.submitChoice}
          />
          {mp.lastResult && (
            <p className="text-center text-gray-400 text-sm animate-pulse">
              Next round starting...
            </p>
          )}
        </div>
      </div>
    );
  }

  // Lobby (idle / waiting)
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      {errorBanner}
      <RpsLobby
        phase={mp.phase === "waiting" ? "waiting" : "idle"}
        roomCode={mp.roomCode}
        onCreateRoom={mp.createRoom}
        onJoinRoom={mp.joinRoom}
        onBack={() => navigate("/rps")}
      />
    </div>
  );
}

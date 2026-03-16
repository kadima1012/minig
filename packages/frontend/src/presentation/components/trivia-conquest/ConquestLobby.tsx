import React, { useState, useEffect } from "react";
import { Button } from "../common/Button";
import { TcPlayerData } from "@minigames/shared";

interface ConquestLobbyProps {
  phase: "idle" | "waiting" | "starting";
  matchCode: string | null;
  players: TcPlayerData[];
  maxPlayers: number;
  startCountdown: number | null;
  onCreateMatch: () => void;
  onJoinMatch: (code: string) => void;
  onFindMatch: () => void;
  onReconnect: () => void;
  onLeave: () => void;
  onBack: () => void;
}

export function ConquestLobby({
  phase,
  matchCode,
  players,
  maxPlayers,
  startCountdown,
  onCreateMatch,
  onJoinMatch,
  onFindMatch,
  onReconnect,
  onLeave,
  onBack,
}: ConquestLobbyProps) {
  const [joinCode, setJoinCode] = useState("");
  const [mode, setMode] = useState<"choose" | "join">("choose");
  const [localCountdown, setLocalCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (phase === "starting" && startCountdown !== null) {
      setLocalCountdown(startCountdown);
      const interval = setInterval(() => {
        setLocalCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            return prev === null ? null : prev - 1;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [phase, startCountdown]);

  if (phase === "starting") {
    return (
      <div className="flex flex-col items-center gap-6">
        <h2 className="text-2xl font-bold">Match Starting!</h2>
        <div className="text-6xl font-bold text-primary animate-pulse">{localCountdown ?? startCountdown}</div>
        <div className="grid grid-cols-4 gap-2">
          {players.map((p) => (
            <div key={p.userId} className="flex items-center gap-2 bg-surface-elevated rounded-lg px-3 py-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
              <span className="text-sm">{p.username}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (phase === "waiting") {
    return (
      <div className="flex flex-col items-center gap-6">
        <h2 className="text-2xl font-bold">Waiting for Players</h2>
        {matchCode && (
          <>
            <p className="text-gray-400">Share this match code:</p>
            <div className="bg-surface-elevated rounded-2xl px-8 py-4 text-center">
              <span className="text-4xl font-mono font-bold tracking-widest text-primary">
                {matchCode}
              </span>
            </div>
          </>
        )}
        <div className="text-gray-400">
          <span className="text-white font-bold">{players.length}</span> / {maxPlayers} players
        </div>
        <div className="grid grid-cols-4 gap-2 max-w-md">
          {players.map((p) => (
            <div key={p.userId} className="flex items-center gap-2 bg-surface-elevated rounded-lg px-3 py-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
              <span className="text-sm truncate">{p.username}</span>
            </div>
          ))}
        </div>
        <p className="text-gray-500 text-sm animate-pulse">Waiting for more players to join...</p>
        <Button variant="ghost" onClick={onLeave}>Cancel</Button>
      </div>
    );
  }

  if (mode === "join") {
    return (
      <div className="flex flex-col items-center gap-6">
        <h2 className="text-2xl font-bold">Join a Match</h2>
        <p className="text-gray-400">Enter the match code:</p>
        <input
          type="text"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
          placeholder="ABCDEF"
          maxLength={6}
          className="bg-surface-elevated text-white text-center text-2xl font-mono tracking-widest rounded-xl px-6 py-3 w-48 border border-surface-border focus:border-primary focus:outline-none"
        />
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => setMode("choose")}>Back</Button>
          <Button onClick={() => joinCode.length === 6 && onJoinMatch(joinCode)} disabled={joinCode.length !== 6}>
            Join
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
        Trivia Conquest
      </h2>
      <p className="text-gray-400 text-center max-w-sm">
        Conquer territories by winning trivia duels! Control the map to win.
      </p>
      <div className="flex flex-col gap-3 w-72">
        <Button size="lg" onClick={onCreateMatch}>Create Match</Button>
        <Button size="lg" variant="secondary" onClick={() => setMode("join")}>Join Match</Button>
        <Button size="lg" variant="ghost" onClick={onFindMatch}>Find Match</Button>
        <Button size="lg" variant="ghost" onClick={onReconnect}>Rejoin Match</Button>
      </div>
      <p className="text-gray-500 text-xs text-center max-w-xs">
        Create a match and share the code, or use Find Match for automatic matchmaking.
        Use Rejoin if you disconnected from an active match.
      </p>
      <Button variant="ghost" size="sm" onClick={onBack}>← Back to Home</Button>
    </div>
  );
}

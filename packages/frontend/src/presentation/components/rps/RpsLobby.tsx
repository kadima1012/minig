import React, { useState } from "react";
import { Button } from "../common/Button";

interface RpsLobbyProps {
  phase: "idle" | "waiting";
  roomCode: string | null;
  onCreateRoom: () => void;
  onJoinRoom: (code: string) => void;
  onBack: () => void;
}

export function RpsLobby({ phase, roomCode, onCreateRoom, onJoinRoom, onBack }: RpsLobbyProps) {
  const [joinCode, setJoinCode] = useState("");
  const [mode, setMode] = useState<"choose" | "join">("choose");

  if (phase === "waiting") {
    return (
      <div className="flex flex-col items-center gap-6">
        <h2 className="text-2xl font-bold">Waiting for Opponent</h2>
        {roomCode ? (
          <>
            <p className="text-gray-400">Share this room code with your friend:</p>
            <div className="bg-surface-elevated rounded-2xl px-8 py-4 text-center">
              <span className="text-4xl font-mono font-bold tracking-widest text-primary">
                {roomCode}
              </span>
            </div>
          </>
        ) : (
          <p className="text-gray-400 animate-pulse">Creating room...</p>
        )}
        <p className="text-gray-500 text-sm animate-pulse">Waiting for someone to join...</p>
        <Button variant="ghost" onClick={onBack}>Cancel</Button>
      </div>
    );
  }

  if (mode === "join") {
    return (
      <div className="flex flex-col items-center gap-6">
        <h2 className="text-2xl font-bold">Join a Room</h2>
        <p className="text-gray-400">Enter the room code:</p>
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
          <Button onClick={() => joinCode.length === 6 && onJoinRoom(joinCode)} disabled={joinCode.length !== 6}>
            Join
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <h2 className="text-2xl font-bold">Multiplayer RPS</h2>
      <p className="text-gray-400">Play against a friend in real-time!</p>
      <div className="flex flex-col gap-3 w-64">
        <Button size="lg" onClick={onCreateRoom}>Create Room</Button>
        <Button size="lg" variant="secondary" onClick={() => setMode("join")}>Join Room</Button>
      </div>
      <p className="text-gray-500 text-xs text-center max-w-xs">
        Each player needs their own account. Use a different browser or incognito tab for the second player.
      </p>
      <Button variant="ghost" size="sm" onClick={onBack}>← Back to RPS</Button>
    </div>
  );
}

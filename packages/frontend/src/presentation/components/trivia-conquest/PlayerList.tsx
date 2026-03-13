import React from "react";
import { TcPlayerData } from "@minigames/shared";

interface PlayerListProps {
  players: TcPlayerData[];
  myUserId: string;
}

export function PlayerList({ players, myUserId }: PlayerListProps) {
  const sorted = [...players].sort((a, b) => b.territoryCount - a.territoryCount);

  return (
    <div className="bg-surface-elevated rounded-xl p-3 space-y-1 max-h-64 overflow-y-auto">
      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1 mb-2">Players</h4>
      {sorted.map((player, idx) => {
        const isMe = player.userId === myUserId;
        return (
          <div
            key={player.userId}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm ${
              isMe ? "bg-primary/20" : ""
            } ${!player.connected ? "opacity-50" : ""}`}
          >
            <span className="text-gray-500 w-4 text-right font-mono text-xs">{idx + 1}</span>
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: player.color }} />
            <span className={`truncate flex-1 ${isMe ? "font-bold text-primary" : ""}`}>
              {player.username}{isMe ? " (you)" : ""}
            </span>
            <span className="text-gray-400 text-xs">{player.territoryCount}</span>
          </div>
        );
      })}
    </div>
  );
}

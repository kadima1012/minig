import React from "react";
import { TcRoundOrderEntry, TcCurrentDuelInfo } from "@minigames/shared";

interface RoundOrderLegendProps {
  roundNumber: number;
  order: TcRoundOrderEntry[];
  currentDuelInfo: TcCurrentDuelInfo | null;
  myUserId: string;
}

export function RoundOrderLegend({ roundNumber, order, currentDuelInfo, myUserId }: RoundOrderLegendProps) {
  if (order.length === 0) return null;

  const currentPos = currentDuelInfo?.position ?? -1;

  return (
    <div className="bg-surface-elevated/95 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-surface-border">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Round {roundNumber}</span>
        <span className="text-xs text-gray-500">·</span>
        <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Resolution</span>
      </div>

      <div className="space-y-1">
        {order.map((entry, idx) => {
          const isCurrentDuel = idx === currentPos;
          const isDone = idx < currentPos;
          const isMe = entry.userId === myUserId;

          return (
            <div
              key={entry.userId}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-all ${
                isCurrentDuel
                  ? "bg-amber-500/20 border border-amber-500/40 ring-1 ring-amber-500/30"
                  : isDone
                    ? "opacity-40"
                    : ""
              } ${isMe ? "font-bold" : ""}`}
            >
              {/* Position number */}
              <span className={`w-4 text-center font-mono ${isCurrentDuel ? "text-amber-400" : "text-gray-500"}`}>
                {isDone ? "\u2713" : idx + 1}
              </span>

              {/* Player color dot */}
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: entry.color }}
              />

              {/* Player name */}
              <span className={`truncate flex-1 ${isMe ? "text-primary" : ""}`}>
                {entry.username}{isMe ? " (you)" : ""}
              </span>

              {/* Target indicator */}
              <span className="text-gray-500">
                {entry.isNeutral ? "\u2694 neutral" : "\u2694 PvP"}
              </span>

              {/* Current duel sword icon */}
              {isCurrentDuel && (
                <span className="text-amber-400 animate-pulse text-sm">\u2694</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Current duel info */}
      {currentDuelInfo && (
        <div className="mt-2 pt-2 border-t border-surface-border text-xs text-center text-gray-400">
          <span style={{ color: currentDuelInfo.attackerColor }} className="font-bold">
            {currentDuelInfo.attackerUsername}
          </span>
          {" vs "}
          <span className="font-bold">
            {currentDuelInfo.isNeutral ? "Neutral" : currentDuelInfo.defenderUsername ?? "???"}
          </span>
          <span className="ml-2 text-gray-500">
            ({currentDuelInfo.position + 1}/{currentDuelInfo.total})
          </span>
        </div>
      )}
    </div>
  );
}

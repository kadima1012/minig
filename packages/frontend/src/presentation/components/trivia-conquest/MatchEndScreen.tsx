import React from "react";
import { TcMatchOver } from "@minigames/shared";
import { Button } from "../common/Button";

interface MatchEndScreenProps {
  data: TcMatchOver;
  myUserId: string;
  onPlayAgain: () => void;
  onBackHome: () => void;
}

export function MatchEndScreen({ data, myUserId, onPlayAgain, onBackHome }: MatchEndScreenProps) {
  const isWinner = data.winnerId === myUserId;
  const myEntry = data.leaderboard.find((e) => e.userId === myUserId);
  const reasonText = data.reason === "domination" ? "Map Domination!" : "Time's Up!";

  return (
    <div className="flex flex-col items-center gap-6 max-w-lg mx-auto">
      <h2 className="text-3xl font-bold">{reasonText}</h2>
      {isWinner && (
        <div className="text-5xl font-bold text-yellow-400">You Won!</div>
      )}
      {!isWinner && myEntry && (
        <div className="text-2xl font-bold text-gray-400">
          You placed #{myEntry.rank}
        </div>
      )}

      {/* Leaderboard */}
      <div className="w-full bg-surface-elevated rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 border-b border-surface-border">
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">Player</th>
              <th className="px-3 py-2 text-right">Territories</th>
              <th className="px-3 py-2 text-right">Duels</th>
              <th className="px-3 py-2 text-right">Points</th>
            </tr>
          </thead>
          <tbody>
            {data.leaderboard.map((entry) => {
              const isMe = entry.userId === myUserId;
              const medal = entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : "";
              return (
                <tr
                  key={entry.userId}
                  className={`border-b border-surface-border/50 ${isMe ? "bg-primary/10" : ""}`}
                >
                  <td className="px-3 py-2 font-mono">{medal || entry.rank}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                      <span className={isMe ? "font-bold text-primary" : ""}>
                        {entry.username}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right font-mono">{entry.territoryCount}</td>
                  <td className="px-3 py-2 text-right font-mono">{entry.duelsWon}</td>
                  <td className="px-3 py-2 text-right font-mono">{entry.matchPoints}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex gap-3">
        <Button onClick={onPlayAgain}>Play Again</Button>
        <Button variant="ghost" onClick={onBackHome}>Back to Home</Button>
      </div>
    </div>
  );
}

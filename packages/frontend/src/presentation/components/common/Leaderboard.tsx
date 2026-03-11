import React, { useEffect, useState } from "react";
import { GameId, LeaderboardEntry } from "@minigames/shared";
import { scoreApi } from "../../../infrastructure/api/score.api";
import { useAuth } from "../../hooks/useAuth";

interface LeaderboardProps {
  gameId: GameId;
}

export function Leaderboard({ gameId }: LeaderboardProps) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    scoreApi
      .getLeaderboard(gameId)
      .then((res) => setEntries(res.entries))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [gameId]);

  if (loading) {
    return <p className="text-gray-400 text-sm text-center animate-pulse">Loading leaderboard...</p>;
  }

  if (entries.length === 0) {
    return (
      <div className="text-center text-gray-500 text-sm py-4">
        No scores yet. Be the first!
      </div>
    );
  }

  return (
    <div className="bg-surface-elevated rounded-xl p-4">
      <h3 className="text-sm font-semibold text-gray-300 mb-3 text-center uppercase tracking-wide">
        Top 10
      </h3>
      <div className="space-y-1">
        {entries.map((entry) => {
          const isCurrentUser = user?.id === entry.userId;
          return (
            <div
              key={`${entry.rank}-${entry.userId}`}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
                isCurrentUser ? "bg-indigo-500/20 text-indigo-300" : "text-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 text-center font-bold text-gray-500">
                  {entry.rank <= 3
                    ? ["🥇", "🥈", "🥉"][entry.rank - 1]
                    : `#${entry.rank}`}
                </span>
                <span className={isCurrentUser ? "font-semibold" : ""}>
                  {entry.username}
                  {isCurrentUser && " (you)"}
                </span>
              </div>
              <span className="font-bold">{entry.score.toLocaleString()}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

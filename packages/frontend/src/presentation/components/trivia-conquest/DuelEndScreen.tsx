import React, { useEffect, useState } from "react";
import { TcDuelResolved } from "@minigames/shared";

interface DuelEndScreenProps {
  resolved: TcDuelResolved;
  myUserId: string;
  opponentUsername: string | null;
  isNeutral: boolean;
  isAttacker: boolean;
}

export function DuelEndScreen({ resolved, myUserId, opponentUsername, isNeutral, isAttacker }: DuelEndScreenProps) {
  const [animPhase, setAnimPhase] = useState<"enter" | "visible">("enter");

  useEffect(() => {
    const t = setTimeout(() => setAnimPhase("visible"), 50);
    return () => clearTimeout(t);
  }, []);

  const iWon = resolved.winnerId === myUserId;
  // For neutral duels, winnerId === null means attacker failed (not a draw)
  const iLost = isNeutral
    ? resolved.winnerId === null
    : resolved.winnerId !== null && resolved.winnerId !== myUserId;
  const isDraw = !isNeutral && resolved.winnerId === null;

  const myScore = isAttacker ? resolved.attackerScore : resolved.defenderScore;
  const oppScore = isAttacker ? resolved.defenderScore : resolved.attackerScore;

  const title = isDraw
    ? "Draw!"
    : iWon
      ? "Victory!"
      : "Defeat!";

  const subtitle = isDraw
    ? "The territory remains unchanged."
    : iWon
      ? isAttacker
        ? isNeutral
          ? "You conquered a neutral territory!"
          : `You conquered ${opponentUsername ?? "opponent"}'s territory!`
        : "You successfully defended your territory!"
      : isAttacker
        ? isNeutral
          ? "You failed to conquer this territory."
          : `${opponentUsername ?? "Opponent"} defended their territory!`
        : `${opponentUsername ?? "Opponent"} conquered your territory!`;

  const bgGradient = isDraw
    ? "from-gray-600/90 to-gray-800/90"
    : iWon
      ? "from-emerald-600/90 to-emerald-900/90"
      : "from-red-600/90 to-red-900/90";

  const titleColor = isDraw
    ? "text-gray-200"
    : iWon
      ? "text-emerald-200"
      : "text-red-200";

  const icon = isDraw ? "⚔️" : iWon ? "👑" : "💀";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/70 transition-opacity duration-300 ${
          animPhase === "enter" ? "opacity-0" : "opacity-100"
        }`}
      />

      {/* Content */}
      <div
        className={`relative z-10 flex flex-col items-center gap-4 p-8 rounded-3xl bg-gradient-to-b ${bgGradient} shadow-2xl border border-white/10 transition-all duration-500 ${
          animPhase === "enter"
            ? "scale-50 opacity-0"
            : "scale-100 opacity-100"
        }`}
      >
        {/* Icon */}
        <div className={`text-6xl ${animPhase === "visible" ? "animate-bounce" : ""}`}>
          {icon}
        </div>

        {/* Title */}
        <h2 className={`text-4xl font-extrabold ${titleColor} tracking-wider`}>
          {title}
        </h2>

        {/* Subtitle */}
        <p className="text-white/80 text-center text-sm max-w-xs">
          {subtitle}
        </p>

        {/* Scores */}
        <div className="flex gap-8 mt-2">
          <div className="flex flex-col items-center">
            <span className="text-xs text-white/50 uppercase tracking-wide">You</span>
            <span className={`text-2xl font-bold ${iWon ? "text-emerald-300" : isDraw ? "text-gray-300" : "text-red-300"}`}>
              {myScore}/5
            </span>
          </div>
          {!isNeutral && (
            <>
              <div className="flex flex-col items-center justify-center">
                <span className="text-white/30 text-lg font-bold">vs</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs text-white/50 uppercase tracking-wide">
                  {opponentUsername ?? "Opponent"}
                </span>
                <span className={`text-2xl font-bold ${iLost ? "text-emerald-300" : isDraw ? "text-gray-300" : "text-red-300"}`}>
                  {oppScore}/5
                </span>
              </div>
            </>
          )}
          {isNeutral && (
            <>
              <div className="flex flex-col items-center justify-center">
                <span className="text-white/30 text-lg font-bold">/</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs text-white/50 uppercase tracking-wide">Needed</span>
                <span className="text-2xl font-bold text-yellow-300">
                  3/5
                </span>
              </div>
            </>
          )}
        </div>

        {/* Progress bar auto-dismiss */}
        <div className="mt-2 w-48 h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-white/40 rounded-full transition-all ease-linear"
            style={{
              width: animPhase === "visible" ? "100%" : "0%",
              transitionDuration: "3.5s",
            }}
          />
        </div>
      </div>
    </div>
  );
}

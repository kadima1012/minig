import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useConquest } from "../../hooks/useConquest";
import { useAuth } from "../../hooks/useAuth";
import { ConquestLobby } from "../../components/trivia-conquest/ConquestLobby";
import { HexMap } from "../../components/trivia-conquest/HexMap";
import { DuelScreen } from "../../components/trivia-conquest/DuelScreen";
import { TiebreakerScreen } from "../../components/trivia-conquest/TiebreakerScreen";
import { MatchHeader } from "../../components/trivia-conquest/MatchHeader";
import { PlayerList } from "../../components/trivia-conquest/PlayerList";
import { MatchEndScreen } from "../../components/trivia-conquest/MatchEndScreen";
import { RevengePopup } from "../../components/trivia-conquest/RevengePopup";

export function TriviaConquestPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const game = useConquest();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  if (!user) return null;

  // Error banner
  const errorBanner = game.error && (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-600/90 text-white px-6 py-3 rounded-xl shadow-lg z-50">
      <div className="flex items-center gap-3">
        <span>{game.error}</span>
        <button onClick={game.clearError} className="text-white/70 hover:text-white">✕</button>
      </div>
    </div>
  );

  // Match End
  if (game.phase === "finished" && game.matchEnd) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-10">
        {errorBanner}
        <MatchEndScreen
          data={game.matchEnd}
          myUserId={user.id}
          onPlayAgain={() => {
            game.leaveMatch();
            game.createMatch();
          }}
          onBackHome={() => {
            game.leaveMatch();
            navigate("/");
          }}
        />
      </div>
    );
  }

  // Playing / Duel / Tiebreaker
  if (game.phase === "playing" || game.phase === "duel" || game.phase === "duel-result" || game.phase === "tiebreaker") {
    const myTerritoryCount = game.hexes.filter((h) => h.ownerId === user.id).length;

    return (
      <div className="h-screen bg-surface flex flex-col overflow-hidden">
        {errorBanner}
        <MatchHeader
          matchTimerEndsAt={game.matchTimerEndsAt}
          myTerritoryCount={myTerritoryCount}
          totalHexes={game.hexes.length}
          matchCode={game.matchCode}
          onLeave={() => {
            game.leaveMatch();
            navigate("/");
          }}
        />

        <div className="flex-1 flex overflow-hidden">
          {/* Main hex map */}
          <div className="flex-1 p-4">
            <HexMap
              hexes={game.hexes}
              myUserId={user.id}
              onHexClick={game.attackHex}
              isInDuel={game.duel !== null}
            />
          </div>

          {/* Sidebar */}
          <div className="w-56 p-3 border-l border-surface-border overflow-y-auto hidden md:block">
            <PlayerList players={game.players} myUserId={user.id} />

            {/* Leaderboard mini */}
            {game.leaderboard.length > 0 && (
              <div className="mt-3 bg-surface-elevated rounded-xl p-3">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Leaderboard</h4>
                {game.leaderboard.slice(0, 5).map((e) => (
                  <div key={e.userId} className="flex items-center gap-2 text-xs py-0.5">
                    <span className="text-gray-500 w-3">{e.rank}</span>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: e.color }} />
                    <span className={`truncate flex-1 ${e.userId === user.id ? "text-primary font-bold" : ""}`}>
                      {e.username}
                    </span>
                    <span className="text-gray-400">{e.territoryCount}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Duel overlay */}
        {game.duel && (game.phase === "duel" || game.phase === "duel-result") && (
          <DuelScreen
            duelId={game.duel.duelId}
            opponentUsername={game.duel.opponentUsername}
            isNeutral={game.duel.isNeutral}
            currentQuestion={game.duel.currentQuestion}
            lastResult={game.duel.lastResult}
            opponentAnswered={game.duel.opponentAnswered}
            myAnswer={game.duel.myAnswer}
            onAnswer={game.submitAnswer}
          />
        )}

        {/* Tiebreaker overlay */}
        {game.phase === "tiebreaker" && game.tiebreaker && (
          <TiebreakerScreen data={game.tiebreaker} onSubmit={game.submitTiebreaker} />
        )}

        {/* Revenge popup */}
        <RevengePopup
          revengeHexId={game.revengeHexId}
          cooldownEndsAt={game.cooldownEndsAt}
          onAccept={game.acceptRevenge}
          onDecline={game.declineRevenge}
        />
      </div>
    );
  }

  // Lobby / Waiting / Starting
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      {errorBanner}
      <ConquestLobby
        phase={game.phase === "starting" ? "starting" : game.phase === "waiting" ? "waiting" : "idle"}
        matchCode={game.matchCode}
        players={game.players}
        maxPlayers={game.maxPlayers}
        startCountdown={game.startCountdown}
        onCreateMatch={game.createMatch}
        onJoinMatch={game.joinMatch}
        onFindMatch={game.findMatch}
        hasActiveMatch={game.hasActiveMatch}
        onReconnect={game.reconnect}
        onLeave={game.leaveMatch}
        onBack={() => navigate("/")}
      />
    </div>
  );
}

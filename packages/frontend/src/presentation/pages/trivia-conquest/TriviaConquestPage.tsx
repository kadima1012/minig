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
import { DuelEndScreen } from "../../components/trivia-conquest/DuelEndScreen";
import { PlanningOverlay } from "../../components/trivia-conquest/PlanningOverlay";
import { RoundOrderLegend } from "../../components/trivia-conquest/RoundOrderLegend";

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

  // Surrender notification banner
  const surrenderBanner = game.surrenderMessage && (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-amber-600/90 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-pulse">
      <span>{game.surrenderMessage}</span>
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

  // Active game phases: playing, planning, resolution, duel, duel-result, tiebreaker, duel-ended
  const isGameActive = ["playing", "planning", "resolution", "duel", "duel-result", "tiebreaker", "duel-ended"].includes(game.phase);

  if (isGameActive) {
    const myTerritoryCount = (game.hexes ?? []).filter((h) => h.ownerId === user.id).length;
    const isInDuel = game.duel !== null;
    const isPlanning = game.phase === "planning";
    const isResolution = game.phase === "resolution" || game.phase === "duel" || game.phase === "duel-result" || game.phase === "tiebreaker" || game.phase === "duel-ended";

    return (
      <div className="h-screen bg-surface flex flex-col overflow-hidden">
        {errorBanner}
        {surrenderBanner}
        <MatchHeader
          matchTimerEndsAt={game.matchTimerEndsAt}
          myTerritoryCount={myTerritoryCount}
          totalHexes={(game.hexes ?? []).length}
          matchCode={game.matchCode}
          hasSurrendered={game.hasSurrendered}
          onLeave={() => {
            game.leaveMatch();
            navigate("/");
          }}
          onSurrender={game.surrender}
        />

        <div className="flex-1 flex overflow-hidden relative">
          {/* Main hex map */}
          <div className="flex-1 p-4 relative">
            <HexMap
              hexes={game.hexes}
              myUserId={user.id}
              onHexClick={isPlanning ? game.selectHex : game.attackHex}
              isInDuel={isInDuel}
              isPlanning={isPlanning}
              attackableHexIds={isPlanning ? game.attackableHexIds : undefined}
              mySelectedHexId={isPlanning ? game.mySelectedHexId : undefined}
              hexSelections={isPlanning ? game.hexSelections : undefined}
            />

            {/* Planning overlay */}
            {isPlanning && (
              <PlanningOverlay
                roundNumber={game.roundNumber}
                planningEndsAt={game.planningEndsAt}
                mySelectedHexId={game.mySelectedHexId}
                onDeselect={game.deselectHex}
              />
            )}

            {/* Phase indicator — always visible when not in planning (which has its own overlay) */}
            {!isPlanning && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
                <div className="bg-surface-elevated/90 backdrop-blur-sm border border-surface-border rounded-xl px-4 py-2 shadow-lg text-center">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Round {game.roundNumber}</span>
                    <span className="text-xs text-gray-500">·</span>
                    <span className={`text-xs font-bold uppercase tracking-wider ${
                      game.phase === "resolution" ? "text-orange-400" :
                      game.phase === "duel" || game.phase === "duel-result" ? "text-red-400" :
                      game.phase === "tiebreaker" ? "text-yellow-400" :
                      game.phase === "duel-ended" ? "text-green-400" :
                      "text-gray-400"
                    }`}>
                      {game.phase === "resolution" ? "Resolving..." :
                       game.phase === "duel" || game.phase === "duel-result" ? "Duel in progress" :
                       game.phase === "tiebreaker" ? "Tiebreaker" :
                       game.phase === "duel-ended" ? "Duel complete" :
                       game.phase}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-60 p-3 border-l border-surface-border overflow-y-auto hidden md:flex flex-col gap-3">
            <PlayerList players={game.players} myUserId={user.id} />

            {/* Round order legend during resolution */}
            {isResolution && (game.roundOrder ?? []).length > 0 && (
              <RoundOrderLegend
                roundNumber={game.roundNumber}
                order={game.roundOrder}
                currentDuelInfo={game.currentDuelInfo}
                myUserId={user.id}
              />
            )}

            {/* Leaderboard mini */}
            {(game.leaderboard ?? []).length > 0 && (
              <div className="bg-surface-elevated rounded-xl p-3">
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

        {/* Duel end result overlay */}
        {game.phase === "duel-ended" && game.duel?.resolved && (
          <DuelEndScreen
            resolved={game.duel.resolved}
            myUserId={user.id}
            opponentUsername={game.duel.opponentUsername}
            isNeutral={game.duel.isNeutral}
            isAttacker={game.duel.isAttacker}
          />
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

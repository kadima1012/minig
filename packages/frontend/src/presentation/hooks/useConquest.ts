import { useReducer, useEffect, useRef, useCallback } from "react";
import { useAuth } from "./useAuth";
import {
  TcHexData,
  TcPlayerData,
  TcLeaderboardEntry,
  TcDuelQuestionData,
  TcDuelQuestionResult,
  TcTiebreakerData,
  TcDuelResolved,
  TcMatchOver,
  TcMapUpdateEntry,
  TcRoundOrderEntry,
  TcHexSelectedData,
  TcCurrentDuelInfo,
  TcEliminationRoundData,
  TcEliminationResultData,
  TcPlayerSurrendered,
} from "@minigames/shared";
import { ConquestMultiplayerUseCase } from "../../application/use-cases/conquest/ConquestMultiplayerUseCase";
import { disconnectSocket } from "../../infrastructure/socket/socketClient";

// ── Phase ─────────────────────────────────────────────────────────

export type ConquestPhase =
  | "idle"
  | "waiting"
  | "starting"
  | "playing"
  | "planning"
  | "resolution"
  | "duel"
  | "duel-result"
  | "tiebreaker"
  | "duel-ended"
  | "finished";

// ── State ─────────────────────────────────────────────────────────

export interface ConquestDuelState {
  duelId: string;
  hexId: string;
  opponentUsername: string | null;
  isNeutral: boolean;
  isAttacker: boolean;
  currentQuestion: TcDuelQuestionData | null;
  lastResult: TcDuelQuestionResult | null;
  opponentAnswered: boolean;
  myAnswer: number | null;
  resolved: TcDuelResolved | null;
}

export interface ConquestState {
  phase: ConquestPhase;
  matchId: string | null;
  matchCode: string | null;
  players: TcPlayerData[];
  hexes: TcHexData[];
  matchTimerEndsAt: string | null;
  startCountdown: number | null;
  leaderboard: TcLeaderboardEntry[];
  duel: ConquestDuelState | null;
  tiebreaker: TcTiebreakerData | null;
  revengeHexId: string | null;
  revengeOpponentId: string | null;
  cooldownEndsAt: string | null;
  matchEnd: TcMatchOver | null;
  error: string | null;
  maxPlayers: number;
  hasActiveMatch: boolean;
  // ── Round / Planning state ──────────────────────────────────────
  roundNumber: number;
  planningEndsAt: string | null;
  attackableHexIds: string[];
  /** hexId -> { userId, username, color } */
  hexSelections: TcHexSelectedData[];
  mySelectedHexId: string | null;
  roundOrder: TcRoundOrderEntry[];
  currentDuelInfo: TcCurrentDuelInfo | null;
  eliminationRound: TcEliminationRoundData | null;
  eliminationResult: TcEliminationResultData | null;
  hasSurrendered: boolean;
  surrenderMessage: string | null;
}

const initialState: ConquestState = {
  phase: "idle",
  matchId: null,
  matchCode: null,
  players: [],
  hexes: [],
  matchTimerEndsAt: null,
  startCountdown: null,
  leaderboard: [],
  duel: null,
  tiebreaker: null,
  revengeHexId: null,
  revengeOpponentId: null,
  cooldownEndsAt: null,
  matchEnd: null,
  error: null,
  maxPlayers: 20,
  hasActiveMatch: false,
  roundNumber: 0,
  planningEndsAt: null,
  attackableHexIds: [],
  hexSelections: [],
  mySelectedHexId: null,
  roundOrder: [],
  currentDuelInfo: null,
  eliminationRound: null,
  eliminationResult: null,
  hasSurrendered: false,
  surrenderMessage: null,
};

// ── Actions ───────────────────────────────────────────────────────

type ConquestAction =
  | { type: "MATCH_CREATED"; matchId: string; matchCode: string }
  | { type: "PLAYER_JOINED"; userId: string; username: string; color: string; playerCount: number; maxPlayers: number }
  | { type: "PLAYER_LEFT"; userId: string; playerCount: number }
  | { type: "MATCH_STARTING"; countdown: number }
  | { type: "MATCH_STARTED"; hexes: TcHexData[]; players: TcPlayerData[]; matchTimerEndsAt: string; matchId: string; matchCode: string }
  | { type: "MAP_UPDATE"; updates: TcMapUpdateEntry[] }
  // ── Planning / Resolution ───────────────────────────────────────
  | { type: "PLANNING_START"; roundNumber: number; durationMs: number; attackableHexIds: string[] }
  | { type: "HEX_SELECTED"; data: TcHexSelectedData }
  | { type: "HEX_DESELECTED"; hexId: string; userId: string }
  | { type: "MY_HEX_SELECTED"; hexId: string }
  | { type: "MY_HEX_DESELECTED" }
  | { type: "PLANNING_END" }
  | { type: "RESOLUTION_START"; roundNumber: number; order: TcRoundOrderEntry[] }
  | { type: "CURRENT_DUEL_INFO"; info: TcCurrentDuelInfo }
  | { type: "ELIMINATION_ROUND"; data: TcEliminationRoundData }
  | { type: "ELIMINATION_RESULT"; data: TcEliminationResultData }
  | { type: "PLAYER_SURRENDERED"; data: TcPlayerSurrendered; isMe: boolean }
  // ── Duel ────────────────────────────────────────────────────────
  | { type: "DUEL_STARTED"; duelId: string; hexId: string; category: string; opponentUsername: string | null; isNeutral: boolean; isAttacker: boolean }
  | { type: "DUEL_QUESTION"; question: TcDuelQuestionData }
  | { type: "OPPONENT_ANSWERED" }
  | { type: "SUBMIT_ANSWER"; selectedIndex: number }
  | { type: "DUEL_QUESTION_RESULT"; result: TcDuelQuestionResult }
  | { type: "DUEL_TIEBREAKER"; data: TcTiebreakerData }
  | { type: "DUEL_RESOLVED"; data: TcDuelResolved }
  | { type: "PLAYER_ELIMINATED"; revengeHexId: string; revengeOpponentId: string }
  | { type: "LEADERBOARD_UPDATE"; entries: TcLeaderboardEntry[] }
  | { type: "MATCH_OVER"; data: TcMatchOver }
  | { type: "MATCHMAKING_FOUND"; matchCode: string }
  | { type: "REVENGE_COOLDOWN"; cooldownEndsAt: string }
  | { type: "DISMISS_DUEL" }
  | { type: "ACTIVE_MATCH_STATUS"; hasActiveMatch: boolean }
  | { type: "OPPONENT_DISCONNECTED"; message: string }
  | { type: "RECONNECTED"; hexes: TcHexData[]; players: TcPlayerData[]; matchTimerEndsAt: string; matchId: string; matchCode: string; leaderboard: TcLeaderboardEntry[]; roundNumber: number; roundPhase: string; planningEndsAt: string | null; selections: TcHexSelectedData[]; roundOrder: TcRoundOrderEntry[]; currentDuelPosition: number }
  | { type: "ERROR"; message: string }
  | { type: "CLEAR_ERROR" }
  | { type: "RESET" };

// ── Reducer ───────────────────────────────────────────────────────

function reducer(state: ConquestState, action: ConquestAction): ConquestState {
  switch (action.type) {
    case "MATCH_CREATED":
      return {
        ...state,
        phase: "waiting",
        matchId: action.matchId,
        matchCode: action.matchCode,
      };

    case "PLAYER_JOINED":
      return {
        ...state,
        phase: state.phase === "idle" ? "waiting" : state.phase,
        maxPlayers: action.maxPlayers,
        players: [
          ...state.players.filter((p) => p.userId !== action.userId),
          {
            userId: action.userId,
            username: action.username,
            color: action.color,
            territoryCount: 0,
            duelsWon: 0,
            duelsLost: 0,
            connected: true,
          },
        ],
      };

    case "PLAYER_LEFT":
      return {
        ...state,
        players: state.players.map((p) =>
          p.userId === action.userId ? { ...p, connected: false } : p
        ),
      };

    case "MATCH_STARTING":
      return { ...state, phase: "starting", startCountdown: action.countdown };

    case "MATCH_STARTED":
      return {
        ...state,
        phase: "playing",
        hexes: action.hexes,
        players: action.players,
        matchTimerEndsAt: action.matchTimerEndsAt,
        matchId: action.matchId,
        matchCode: action.matchCode,
        startCountdown: null,
      };

    case "MAP_UPDATE": {
      const updatedHexes = state.hexes.map((hex) => {
        const update = action.updates.find((u) => u.hexId === hex.id);
        if (update) {
          return {
            ...hex,
            ownerId: update.ownerId,
            ownerUsername: update.ownerUsername,
            ownerColor: update.ownerColor,
          };
        }
        return hex;
      });
      return { ...state, hexes: updatedHexes };
    }

    // ── Planning / Resolution ─────────────────────────────────────

    case "PLANNING_START":
      return {
        ...state,
        phase: "planning",
        roundNumber: action.roundNumber,
        planningEndsAt: new Date(Date.now() + action.durationMs).toISOString(),
        attackableHexIds: action.attackableHexIds,
        hexSelections: [],
        mySelectedHexId: null,
        roundOrder: [],
        currentDuelInfo: null,
        duel: null,
        tiebreaker: null,
        eliminationRound: null,
        eliminationResult: null,
      };

    case "HEX_SELECTED":
      return {
        ...state,
        hexSelections: [
          ...state.hexSelections.filter((s) => s.userId !== action.data.userId && s.hexId !== action.data.hexId),
          action.data,
        ],
      };

    case "HEX_DESELECTED":
      return {
        ...state,
        hexSelections: state.hexSelections.filter((s) => s.userId !== action.userId),
      };

    case "MY_HEX_SELECTED":
      return { ...state, mySelectedHexId: action.hexId };

    case "MY_HEX_DESELECTED":
      return { ...state, mySelectedHexId: null };

    case "PLANNING_END":
      return {
        ...state,
        planningEndsAt: null,
      };

    case "RESOLUTION_START":
      return {
        ...state,
        phase: "resolution",
        roundOrder: action.order,
        currentDuelInfo: null,
        hexSelections: [],
        mySelectedHexId: null,
        attackableHexIds: [],
      };

    case "CURRENT_DUEL_INFO":
      return {
        ...state,
        currentDuelInfo: action.info,
      };

    case "ELIMINATION_ROUND":
      return {
        ...state,
        phase: "playing",
        eliminationRound: action.data,
        eliminationResult: null,
      };

    case "ELIMINATION_RESULT":
      return {
        ...state,
        eliminationResult: action.data,
        eliminationRound: null,
      };

    case "PLAYER_SURRENDERED":
      if (action.isMe) {
        return {
          ...state,
          hasSurrendered: true,
          duel: null,
          tiebreaker: null,
        };
      }
      return {
        ...state,
        surrenderMessage: `${action.data.username} surrendered! ${action.data.freedHexIds.length} territories freed.`,
      };

    // ── Duel ──────────────────────────────────────────────────────

    case "DUEL_STARTED":
      return {
        ...state,
        phase: "duel",
        revengeHexId: null,
        revengeOpponentId: null,
        duel: {
          duelId: action.duelId,
          hexId: action.hexId,
          opponentUsername: action.opponentUsername,
          isNeutral: action.isNeutral,
          isAttacker: action.isAttacker,
          currentQuestion: null,
          lastResult: null,
          opponentAnswered: false,
          myAnswer: null,
          resolved: null,
        },
      };

    case "DUEL_QUESTION":
      return {
        ...state,
        phase: "duel",
        duel: state.duel
          ? {
              ...state.duel,
              currentQuestion: action.question,
              opponentAnswered: false,
              myAnswer: null,
              lastResult: null,
            }
          : null,
      };

    case "OPPONENT_ANSWERED":
      return {
        ...state,
        duel: state.duel ? { ...state.duel, opponentAnswered: true } : null,
      };

    case "SUBMIT_ANSWER":
      return {
        ...state,
        duel: state.duel ? { ...state.duel, myAnswer: action.selectedIndex } : null,
      };

    case "DUEL_QUESTION_RESULT":
      return {
        ...state,
        phase: "duel-result",
        duel: state.duel ? { ...state.duel, lastResult: action.result } : null,
      };

    case "DUEL_TIEBREAKER":
      return { ...state, phase: "tiebreaker", tiebreaker: action.data };

    case "DUEL_RESOLVED":
      // If this is our active duel, show result
      if (state.duel && state.duel.duelId === action.data.duelId) {
        return {
          ...state,
          phase: "duel-ended",
          duel: { ...state.duel, resolved: action.data },
          tiebreaker: null,
        };
      }
      // Otherwise it's another player's duel in resolution — stay in resolution
      return state;

    case "DISMISS_DUEL":
      return {
        ...state,
        phase: state.roundOrder.length > 0 ? "resolution" : "playing",
        duel: null,
        tiebreaker: null,
      };

    case "PLAYER_ELIMINATED":
      return {
        ...state,
        revengeHexId: action.revengeHexId,
        revengeOpponentId: action.revengeOpponentId,
      };

    case "LEADERBOARD_UPDATE":
      return { ...state, leaderboard: action.entries };

    case "MATCH_OVER":
      return { ...state, phase: "finished", matchEnd: action.data, duel: null, tiebreaker: null, hasActiveMatch: false };

    case "MATCHMAKING_FOUND":
      return { ...state, phase: "waiting", matchCode: action.matchCode };

    case "REVENGE_COOLDOWN":
      return {
        ...state,
        cooldownEndsAt: action.cooldownEndsAt,
        revengeHexId: null,
        revengeOpponentId: null,
      };

    case "ACTIVE_MATCH_STATUS":
      return { ...state, hasActiveMatch: action.hasActiveMatch };

    case "OPPONENT_DISCONNECTED":
      return {
        ...state,
        error: action.message,
        duel: null,
        tiebreaker: null,
        phase: state.roundOrder.length > 0 ? "resolution" : "playing",
      };

    case "RECONNECTED": {
      let phase: ConquestPhase = "playing";
      if (action.roundPhase === "planning") phase = "planning";
      else if (action.roundPhase === "resolution") phase = "resolution";

      return {
        ...state,
        phase,
        hexes: action.hexes,
        players: action.players,
        matchTimerEndsAt: action.matchTimerEndsAt,
        matchId: action.matchId,
        matchCode: action.matchCode,
        leaderboard: action.leaderboard,
        roundNumber: action.roundNumber,
        planningEndsAt: action.planningEndsAt,
        hexSelections: action.selections,
        roundOrder: action.roundOrder,
        currentDuelInfo: null,
        duel: null,
        tiebreaker: null,
        error: null,
      };
    }

    case "ERROR":
      return { ...state, error: action.message };

    case "CLEAR_ERROR":
      return { ...state, error: null, surrenderMessage: null };

    case "RESET":
      return initialState;

    default:
      return state;
  }
}

// ── Hook ──────────────────────────────────────────────────────────

export function useConquest() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const useCaseRef = useRef<ConquestMultiplayerUseCase | null>(null);
  const { user } = useAuth();
  const userIdRef = useRef(user?.id);
  userIdRef.current = user?.id;

  useEffect(() => {
    const uc = new ConquestMultiplayerUseCase();
    useCaseRef.current = uc;

    uc.onMatchCreated((data) => {
      dispatch({ type: "MATCH_CREATED", matchId: data.matchId, matchCode: data.matchCode });
    });

    uc.onPlayerJoined((data) => {
      dispatch({
        type: "PLAYER_JOINED",
        userId: data.userId,
        username: data.username,
        color: data.color,
        playerCount: data.playerCount,
        maxPlayers: data.maxPlayers,
      });
    });

    uc.onPlayerLeft((data) => {
      dispatch({ type: "PLAYER_LEFT", userId: data.userId, playerCount: data.playerCount });
    });

    uc.onMatchStarting((data) => {
      dispatch({ type: "MATCH_STARTING", countdown: data.countdown });
    });

    uc.onMatchStarted((data) => {
      dispatch({
        type: "MATCH_STARTED",
        hexes: data.hexes,
        players: data.players,
        matchTimerEndsAt: data.matchTimerEndsAt,
        matchId: data.matchId,
        matchCode: data.matchCode,
      });
    });

    uc.onMapUpdate((updates) => {
      dispatch({ type: "MAP_UPDATE", updates });
    });

    // ── Planning / Resolution listeners ───────────────────────────

    uc.onPlanningStart((data) => {
      dispatch({
        type: "PLANNING_START",
        roundNumber: data.roundNumber,
        durationMs: data.durationMs,
        attackableHexIds: data.attackableHexIds,
      });
    });

    uc.onHexSelected((data) => {
      dispatch({ type: "HEX_SELECTED", data });
    });

    uc.onHexDeselected((data) => {
      dispatch({ type: "HEX_DESELECTED", hexId: data.hexId, userId: data.userId });
    });

    uc.onPlanningEnd(() => {
      dispatch({ type: "PLANNING_END" });
    });

    uc.onResolutionStart((data) => {
      dispatch({ type: "RESOLUTION_START", roundNumber: data.roundNumber, order: data.order });
    });

    uc.onCurrentDuelInfo((info) => {
      dispatch({ type: "CURRENT_DUEL_INFO", info });
    });

    uc.onEliminationRound((data) => {
      dispatch({ type: "ELIMINATION_ROUND", data });
    });

    uc.onEliminationResult((data) => {
      dispatch({ type: "ELIMINATION_RESULT", data });
    });

    uc.onPlayerSurrendered((data) => {
      const isMe = data.userId === userIdRef.current;
      dispatch({ type: "PLAYER_SURRENDERED", data, isMe });
      if (!isMe) {
        // Auto-clear surrender message after 3 seconds
        setTimeout(() => dispatch({ type: "CLEAR_ERROR" }), 3000);
      }
    });

    // ── Duel listeners ────────────────────────────────────────────

    uc.onDuelStarted((data) => {
      dispatch({
        type: "DUEL_STARTED",
        duelId: data.duelId,
        hexId: data.hexId,
        category: data.category,
        opponentUsername: data.opponentUsername,
        isNeutral: data.isNeutral,
        isAttacker: data.isAttacker,
      });
    });

    uc.onDuelQuestion((question) => {
      dispatch({ type: "DUEL_QUESTION", question });
    });

    uc.onOpponentAnswered(() => {
      dispatch({ type: "OPPONENT_ANSWERED" });
    });

    uc.onDuelQuestionResult((result) => {
      dispatch({ type: "DUEL_QUESTION_RESULT", result });
    });

    uc.onDuelTiebreaker((data) => {
      dispatch({ type: "DUEL_TIEBREAKER", data });
    });

    uc.onDuelResolved((data) => {
      dispatch({ type: "DUEL_RESOLVED", data });
      setTimeout(() => dispatch({ type: "DISMISS_DUEL" }), 4000);
    });

    uc.onPlayerEliminated((data) => {
      dispatch({
        type: "PLAYER_ELIMINATED",
        revengeHexId: data.revengeHexId,
        revengeOpponentId: data.revengeOpponentId,
      });
    });

    uc.onLeaderboardUpdate((entries) => {
      dispatch({ type: "LEADERBOARD_UPDATE", entries });
    });

    uc.onMatchOver((data) => {
      dispatch({ type: "MATCH_OVER", data });
    });

    uc.onMatchmakingFound((data) => {
      dispatch({ type: "MATCHMAKING_FOUND", matchCode: data.matchCode });
    });

    uc.onRevengeCooldown((data) => {
      dispatch({ type: "REVENGE_COOLDOWN", cooldownEndsAt: data.cooldownEndsAt });
    });

    uc.onOpponentDisconnected((data) => {
      dispatch({ type: "OPPONENT_DISCONNECTED", message: data.message });
      setTimeout(() => dispatch({ type: "CLEAR_ERROR" }), 3000);
    });

    uc.onReconnected((data) => {
      dispatch({
        type: "RECONNECTED",
        hexes: data.hexes,
        players: data.players,
        matchTimerEndsAt: data.matchTimerEndsAt,
        matchId: data.matchId,
        matchCode: data.matchCode,
        leaderboard: data.leaderboard,
        roundNumber: data.roundNumber,
        roundPhase: data.roundPhase,
        planningEndsAt: data.planningEndsAt,
        selections: data.selections,
        roundOrder: data.roundOrder,
        currentDuelPosition: data.currentDuelPosition,
      });
    });

    uc.onError((data) => {
      dispatch({ type: "ERROR", message: data.message });
    });

    uc.onConnectError((err) => {
      dispatch({ type: "ERROR", message: `Connection failed: ${err.message}` });
    });

    uc.onActiveMatchStatus((data) => {
      dispatch({ type: "ACTIVE_MATCH_STATUS", hasActiveMatch: data.hasActiveMatch });
    });

    uc.onConnect(() => {
      console.log("[TC] Socket connected");
      uc.checkActiveMatch();
    });

    return () => {
      uc.cleanup();
      disconnectSocket();
    };
  }, []);

  const createMatch = useCallback(() => {
    dispatch({ type: "RESET" });
    useCaseRef.current?.createMatch();
  }, []);

  const joinMatch = useCallback((code: string) => {
    dispatch({ type: "RESET" });
    useCaseRef.current?.joinMatch(code);
  }, []);

  const findMatch = useCallback(() => {
    dispatch({ type: "RESET" });
    useCaseRef.current?.findMatch();
  }, []);

  const leaveMatch = useCallback(() => {
    useCaseRef.current?.leaveMatch();
    dispatch({ type: "RESET" });
  }, []);

  const selectHex = useCallback((hexId: string) => {
    dispatch({ type: "MY_HEX_SELECTED", hexId });
    useCaseRef.current?.selectHex(hexId);
  }, []);

  const deselectHex = useCallback(() => {
    dispatch({ type: "MY_HEX_DESELECTED" });
    useCaseRef.current?.deselectHex();
  }, []);

  const attackHex = useCallback((hexId: string) => {
    useCaseRef.current?.attackHex(hexId);
  }, []);

  const submitAnswer = useCallback((duelId: string, questionIndex: number, selectedIndex: number) => {
    dispatch({ type: "SUBMIT_ANSWER", selectedIndex });
    useCaseRef.current?.submitAnswer(duelId, questionIndex, selectedIndex);
  }, []);

  const submitTiebreaker = useCallback((duelId: string, numericAnswer: number) => {
    useCaseRef.current?.submitTiebreaker(duelId, numericAnswer);
  }, []);

  const acceptRevenge = useCallback(() => {
    useCaseRef.current?.acceptRevenge();
  }, []);

  const declineRevenge = useCallback(() => {
    useCaseRef.current?.declineRevenge();
  }, []);

  const reconnect = useCallback(() => {
    useCaseRef.current?.reconnect();
  }, []);

  const surrender = useCallback(() => {
    useCaseRef.current?.surrender();
  }, []);

  const submitEliminationAnswer = useCallback((numericAnswer: number) => {
    useCaseRef.current?.submitEliminationAnswer(numericAnswer);
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  return {
    ...state,
    createMatch,
    joinMatch,
    findMatch,
    leaveMatch,
    selectHex,
    deselectHex,
    attackHex,
    submitAnswer,
    submitTiebreaker,
    acceptRevenge,
    declineRevenge,
    reconnect,
    surrender,
    submitEliminationAnswer,
    clearError,
  };
}

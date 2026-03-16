import { useReducer, useEffect, useRef, useCallback } from "react";
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
} from "@minigames/shared";
import { ConquestMultiplayerUseCase } from "../../application/use-cases/conquest/ConquestMultiplayerUseCase";
import { disconnectSocket } from "../../infrastructure/socket/socketClient";

// ── Phase ─────────────────────────────────────────────────────────

export type ConquestPhase =
  | "idle"
  | "waiting"
  | "starting"
  | "playing"
  | "duel"
  | "duel-result"
  | "tiebreaker"
  | "finished";

// ── State ─────────────────────────────────────────────────────────

export interface ConquestDuelState {
  duelId: string;
  hexId: string;
  opponentUsername: string | null;
  isNeutral: boolean;
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
};

// ── Actions ───────────────────────────────────────────────────────

type ConquestAction =
  | { type: "MATCH_CREATED"; matchId: string; matchCode: string }
  | { type: "PLAYER_JOINED"; userId: string; username: string; color: string; playerCount: number; maxPlayers: number }
  | { type: "PLAYER_LEFT"; userId: string; playerCount: number }
  | { type: "MATCH_STARTING"; countdown: number }
  | { type: "MATCH_STARTED"; hexes: TcHexData[]; players: TcPlayerData[]; matchTimerEndsAt: string; matchId: string; matchCode: string }
  | { type: "MAP_UPDATE"; updates: TcMapUpdateEntry[] }
  | { type: "DUEL_STARTED"; duelId: string; hexId: string; category: string; opponentUsername: string | null; isNeutral: boolean }
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
  | { type: "RECONNECTED"; hexes: TcHexData[]; players: TcPlayerData[]; matchTimerEndsAt: string; matchId: string; matchCode: string; leaderboard: TcLeaderboardEntry[] }
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
            matchPoints: 0,
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
      // Ignore if this resolved duel is not our active duel
      if (!state.duel || state.duel.duelId !== action.data.duelId) return state;
      return {
        ...state,
        phase: "playing",
        duel: { ...state.duel, resolved: action.data },
        tiebreaker: null,
      };

    case "DISMISS_DUEL":
      return { ...state, duel: null, tiebreaker: null };

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
        phase: "playing",
      };

    case "RECONNECTED":
      return {
        ...state,
        phase: "playing",
        hexes: action.hexes,
        players: action.players,
        matchTimerEndsAt: action.matchTimerEndsAt,
        matchId: action.matchId,
        matchCode: action.matchCode,
        leaderboard: action.leaderboard,
        duel: null,
        tiebreaker: null,
        error: null,
      };

    case "ERROR":
      return { ...state, error: action.message };

    case "CLEAR_ERROR":
      return { ...state, error: null };

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

    uc.onDuelStarted((data) => {
      dispatch({
        type: "DUEL_STARTED",
        duelId: data.duelId,
        hexId: data.hexId,
        category: data.category,
        opponentUsername: data.opponentUsername,
        isNeutral: data.isNeutral,
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
      setTimeout(() => dispatch({ type: "DISMISS_DUEL" }), 3000);
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
      // Auto-clear the message after 3 seconds
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
      // Check if player has an active match they left
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

  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  return {
    ...state,
    createMatch,
    joinMatch,
    findMatch,
    leaveMatch,
    attackHex,
    submitAnswer,
    submitTiebreaker,
    acceptRevenge,
    declineRevenge,
    reconnect,
    clearError,
  };
}

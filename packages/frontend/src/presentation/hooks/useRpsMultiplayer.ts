import { useState, useEffect, useRef, useCallback } from "react";
import {
  RpsChoice,
  RpsRoundResult,
  RpsGameOver,
  RpsScore,
  RoundOutcome,
} from "@minigames/shared";
import { RpsMultiplayerUseCase } from "../../application/use-cases/rps/RpsMultiplayerUseCase";
import { disconnectSocket } from "../../infrastructure/socket/socketClient";

export type MultiplayerPhase = "idle" | "waiting" | "playing" | "finished";

interface MultiplayerState {
  phase: MultiplayerPhase;
  roomCode: string | null;
  opponentUsername: string | null;
  roundNumber: number;
  totalRounds: number;
  myScore: RpsScore;
  opponentScore: RpsScore;
  opponentChose: boolean;
  lastResult: RpsRoundResult | null;
  gameOver: RpsGameOver | null;
  error: string | null;
  myChoice: RpsChoice | null;
}

const initialState: MultiplayerState = {
  phase: "idle",
  roomCode: null,
  opponentUsername: null,
  roundNumber: 0,
  totalRounds: 5,
  myScore: { wins: 0, losses: 0, draws: 0 },
  opponentScore: { wins: 0, losses: 0, draws: 0 },
  opponentChose: false,
  lastResult: null,
  gameOver: null,
  error: null,
  myChoice: null,
};

export function useRpsMultiplayer() {
  const [state, setState] = useState<MultiplayerState>(initialState);
  const useCaseRef = useRef<RpsMultiplayerUseCase | null>(null);

  useEffect(() => {
    const uc = new RpsMultiplayerUseCase();
    useCaseRef.current = uc;

    uc.onRoomCreated((data) => {
      setState((s) => ({ ...s, phase: "waiting", roomCode: data.roomCode }));
    });

    uc.onOpponentJoined((data) => {
      setState((s) => ({ ...s, opponentUsername: data.opponentUsername }));
    });

    uc.onRoundStart((data) => {
      setState((s) => ({
        ...s,
        phase: "playing",
        roundNumber: data.roundNumber,
        totalRounds: data.totalRounds,
        opponentChose: false,
        lastResult: null,
        myChoice: null,
      }));
    });

    uc.onOpponentChose(() => {
      setState((s) => ({ ...s, opponentChose: true }));
    });

    uc.onRoundResult((data) => {
      setState((s) => ({
        ...s,
        lastResult: data,
        myScore: data.scores.you,
        opponentScore: data.scores.opponent,
      }));
    });

    uc.onGameOver((data) => {
      setState((s) => ({ ...s, phase: "finished", gameOver: data }));
    });

    uc.onOpponentLeft(() => {
      setState((s) => ({
        ...s,
        phase: "finished",
        gameOver: s.gameOver ?? {
          finalScores: { you: s.myScore, opponent: s.opponentScore },
          result: "win",
          opponentUsername: s.opponentUsername ?? "Opponent",
        },
        error: "Opponent left the game",
      }));
    });

    uc.onError((data) => {
      setState((s) => ({ ...s, error: data.message }));
    });

    uc.onConnectError((err) => {
      setState((s) => ({ ...s, error: `Connection failed: ${err.message}` }));
    });

    uc.onConnect(() => {
      console.log("[Socket] Connected successfully");
    });

    return () => {
      uc.leaveRoom();
      uc.cleanup();
      disconnectSocket();
    };
  }, []);

  const createRoom = useCallback(() => {
    setState({ ...initialState, phase: "waiting" });
    useCaseRef.current?.createRoom();
  }, []);

  const joinRoom = useCallback((roomCode: string) => {
    setState({ ...initialState });
    useCaseRef.current?.joinRoom(roomCode);
  }, []);

  const submitChoice = useCallback((choice: RpsChoice) => {
    setState((s) => ({ ...s, myChoice: choice }));
    useCaseRef.current?.submitChoice(choice);
  }, []);

  const leaveRoom = useCallback(() => {
    useCaseRef.current?.leaveRoom();
    setState(initialState);
  }, []);

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }));
  }, []);

  return {
    ...state,
    createRoom,
    joinRoom,
    submitChoice,
    leaveRoom,
    clearError,
  };
}

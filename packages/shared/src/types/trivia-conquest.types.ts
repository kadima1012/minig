import { TcCategory, TcDuelStatus, TcMatchStatus } from "../enums/trivia-conquest.enums";

// ── Socket Events ──────────────────────────────────────────────────

export const TcEvents = {
  // Client -> Server
  CREATE_MATCH: "tc:create-match",
  JOIN_MATCH: "tc:join-match",
  JOIN_MATCHMAKING: "tc:join-matchmaking",
  LEAVE_MATCH: "tc:leave-match",
  ATTACK: "tc:attack",
  SUBMIT_ANSWER: "tc:submit-answer",
  SUBMIT_TIEBREAKER: "tc:submit-tiebreaker",
  ACCEPT_REVENGE: "tc:accept-revenge",
  DECLINE_REVENGE: "tc:decline-revenge",

  // Server -> Client
  MATCH_CREATED: "tc:match-created",
  PLAYER_JOINED: "tc:player-joined",
  PLAYER_LEFT: "tc:player-left",
  MATCH_STARTING: "tc:match-starting",
  MATCH_STARTED: "tc:match-started",
  MAP_UPDATE: "tc:map-update",
  DUEL_STARTED: "tc:duel-started",
  DUEL_QUESTION: "tc:duel-question",
  OPPONENT_ANSWERED: "tc:opponent-answered",
  DUEL_QUESTION_RESULT: "tc:duel-question-result",
  DUEL_TIEBREAKER: "tc:duel-tiebreaker",
  DUEL_RESOLVED: "tc:duel-resolved",
  PLAYER_ELIMINATED: "tc:player-eliminated",
  LEADERBOARD_UPDATE: "tc:leaderboard",
  MATCH_OVER: "tc:match-over",
  MATCHMAKING_FOUND: "tc:matchmaking-found",
  REVENGE_COOLDOWN: "tc:revenge-cooldown",
  ERROR: "tc:error",
} as const;

// ── Hex & Map Types ────────────────────────────────────────────────

export interface TcHexData {
  id: string;
  q: number;
  r: number;
  category: TcCategory;
  ownerId: string | null;
  ownerUsername: string | null;
  ownerColor: string | null;
}

export interface TcPlayerData {
  userId: string;
  username: string;
  color: string;
  territoryCount: number;
  matchPoints: number;
  duelsWon: number;
  duelsLost: number;
  connected: boolean;
}

export interface TcMapState {
  hexes: TcHexData[];
  players: TcPlayerData[];
  matchTimerEndsAt: string;
  matchId: string;
  matchCode: string;
}

// ── Duel Types ─────────────────────────────────────────────────────

export interface TcDuelQuestionData {
  duelId: string;
  questionIndex: number;
  totalQuestions: number;
  text: string;
  options: string[];
  timeoutMs: number;
  category: TcCategory;
}

export interface TcDuelQuestionResult {
  duelId: string;
  questionIndex: number;
  yourCorrect: boolean;
  opponentCorrect: boolean;
  correctIndex: number;
  scores: {
    you: number;
    opponent: number;
  };
}

export interface TcTiebreakerData {
  duelId: string;
  text: string;
  timeoutMs: number;
}

export interface TcDuelResolved {
  duelId: string;
  winnerId: string | null;
  hexId: string;
  newOwnerId: string | null;
  attackerScore: number;
  defenderScore: number;
  pointsAwarded: number;
}

// ── Event Payloads ─────────────────────────────────────────────────

export interface TcMatchCreated {
  matchId: string;
  matchCode: string;
}

export interface TcPlayerJoined {
  userId: string;
  username: string;
  color: string;
  playerCount: number;
  maxPlayers: number;
}

export interface TcPlayerLeft {
  userId: string;
  playerCount: number;
}

export interface TcMatchStarting {
  countdown: number;
}

export interface TcDuelStarted {
  duelId: string;
  hexId: string;
  category: TcCategory;
  opponentUsername: string | null;
  isNeutral: boolean;
}

export interface TcOpponentAnswered {
  duelId: string;
  questionIndex: number;
}

export interface TcPlayerEliminated {
  userId: string;
  revengeHexId: string;
  revengeOpponentId: string;
}

export interface TcRevengeCooldown {
  cooldownEndsAt: string;
}

export interface TcMatchOver {
  winnerId: string | null;
  reason: "domination" | "timeout";
  leaderboard: TcLeaderboardEntry[];
}

export interface TcLeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  color: string;
  territoryCount: number;
  duelsWon: number;
  matchPoints: number;
}

export interface TcMapUpdateEntry {
  hexId: string;
  ownerId: string | null;
  ownerUsername: string | null;
  ownerColor: string | null;
}

export interface TcJoinMatchPayload {
  matchCode: string;
}

export interface TcAttackPayload {
  hexId: string;
}

export interface TcSubmitAnswerPayload {
  duelId: string;
  questionIndex: number;
  selectedIndex: number;
}

export interface TcSubmitTiebreakerPayload {
  duelId: string;
  numericAnswer: number;
}

export interface TcErrorPayload {
  message: string;
}

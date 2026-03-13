import { TcCategory } from "../enums/trivia-conquest.enums";
export declare const TcEvents: {
    readonly CREATE_MATCH: "tc:create-match";
    readonly JOIN_MATCH: "tc:join-match";
    readonly JOIN_MATCHMAKING: "tc:join-matchmaking";
    readonly LEAVE_MATCH: "tc:leave-match";
    readonly ATTACK: "tc:attack";
    readonly SUBMIT_ANSWER: "tc:submit-answer";
    readonly SUBMIT_TIEBREAKER: "tc:submit-tiebreaker";
    readonly ACCEPT_REVENGE: "tc:accept-revenge";
    readonly DECLINE_REVENGE: "tc:decline-revenge";
    readonly MATCH_CREATED: "tc:match-created";
    readonly PLAYER_JOINED: "tc:player-joined";
    readonly PLAYER_LEFT: "tc:player-left";
    readonly MATCH_STARTING: "tc:match-starting";
    readonly MATCH_STARTED: "tc:match-started";
    readonly MAP_UPDATE: "tc:map-update";
    readonly DUEL_STARTED: "tc:duel-started";
    readonly DUEL_QUESTION: "tc:duel-question";
    readonly OPPONENT_ANSWERED: "tc:opponent-answered";
    readonly DUEL_QUESTION_RESULT: "tc:duel-question-result";
    readonly DUEL_TIEBREAKER: "tc:duel-tiebreaker";
    readonly DUEL_RESOLVED: "tc:duel-resolved";
    readonly PLAYER_ELIMINATED: "tc:player-eliminated";
    readonly LEADERBOARD_UPDATE: "tc:leaderboard";
    readonly MATCH_OVER: "tc:match-over";
    readonly MATCHMAKING_FOUND: "tc:matchmaking-found";
    readonly REVENGE_COOLDOWN: "tc:revenge-cooldown";
    readonly ERROR: "tc:error";
};
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
//# sourceMappingURL=trivia-conquest.types.d.ts.map
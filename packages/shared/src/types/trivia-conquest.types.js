"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TcEvents = void 0;
// ── Socket Events ──────────────────────────────────────────────────
exports.TcEvents = {
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
};
//# sourceMappingURL=trivia-conquest.types.js.map
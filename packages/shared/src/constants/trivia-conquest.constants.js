"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TC_CATEGORY_COLORS = exports.TC_PLAYER_COLORS = exports.TC_MATCH_POINT_DEFENSE_WIN = exports.TC_MATCH_POINT_ATTACK_WIN = exports.TC_START_COUNTDOWN_S = exports.TC_NEUTRAL_WIN_THRESHOLD = exports.TC_ROOM_CODE_LENGTH = exports.TC_WIN_THRESHOLD = exports.TC_REVENGE_COOLDOWN_MS = exports.TC_MAX_PLAYERS = exports.TC_MIN_PLAYERS_PROD = exports.TC_MIN_PLAYERS_DEV = exports.TC_HEX_GRID_RADIUS = exports.TC_FAST_ANSWER_THRESHOLD_MS = exports.TC_TIEBREAKER_TIMEOUT_MS = exports.TC_QUESTION_TIMEOUT_MS = exports.TC_DUEL_QUESTIONS = exports.TC_MATCH_DURATION_MS = void 0;
exports.TC_MATCH_DURATION_MS = 1_200_000; // 20 minutes
exports.TC_DUEL_QUESTIONS = 5;
exports.TC_QUESTION_TIMEOUT_MS = 8_000; // 8 seconds per question
exports.TC_TIEBREAKER_TIMEOUT_MS = 15_000; // 15 seconds for tiebreaker
exports.TC_FAST_ANSWER_THRESHOLD_MS = 4_000; // <= 4s = fast answer (2 pts)
exports.TC_HEX_GRID_RADIUS = 3; // radius 3 = 37 hexes
exports.TC_MIN_PLAYERS_DEV = 2;
exports.TC_MIN_PLAYERS_PROD = 16;
exports.TC_MAX_PLAYERS = 20;
exports.TC_REVENGE_COOLDOWN_MS = 360_000; // 6 minutes
exports.TC_WIN_THRESHOLD = 0.5; // 50%+ of hexes
exports.TC_ROOM_CODE_LENGTH = 6;
exports.TC_NEUTRAL_WIN_THRESHOLD = 3; // need 3/5 correct to conquer neutral
exports.TC_START_COUNTDOWN_S = 5;
exports.TC_MATCH_POINT_ATTACK_WIN = 10;
exports.TC_MATCH_POINT_DEFENSE_WIN = 8;
exports.TC_PLAYER_COLORS = [
    "#ef4444", // red
    "#3b82f6", // blue
    "#22c55e", // green
    "#f59e0b", // amber
    "#8b5cf6", // violet
    "#ec4899", // pink
    "#06b6d4", // cyan
    "#f97316", // orange
    "#14b8a6", // teal
    "#a855f7", // purple
    "#e11d48", // rose
    "#84cc16", // lime
    "#6366f1", // indigo
    "#0ea5e9", // sky
    "#d946ef", // fuchsia
    "#78716c", // stone
    "#facc15", // yellow
    "#2dd4bf", // emerald
    "#fb923c", // light-orange
    "#818cf8", // light-indigo
];
exports.TC_CATEGORY_COLORS = {
    science: "#3b82f6",
    movies: "#ec4899",
    history: "#f59e0b",
    tech: "#06b6d4",
    gaming: "#22c55e",
};
//# sourceMappingURL=trivia-conquest.constants.js.map
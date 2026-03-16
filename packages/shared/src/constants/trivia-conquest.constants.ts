export const TC_MATCH_DURATION_MS = 1_200_000; // 20 minutes
export const TC_DUEL_QUESTIONS = 5;
export const TC_QUESTION_TIMEOUT_MS = 8_000; // 8 seconds per question
export const TC_TIEBREAKER_TIMEOUT_MS = 15_000; // 15 seconds for tiebreaker
export const TC_HEX_GRID_RADIUS = 3; // radius 3 = 37 hexes
export const TC_MIN_PLAYERS_DEV = 2;
export const TC_MIN_PLAYERS_PROD = 16;
export const TC_MAX_PLAYERS = 20;
export const TC_REVENGE_COOLDOWN_MS = 360_000; // 6 minutes
export const TC_WIN_THRESHOLD = 0.5; // 50%+ of hexes
export const TC_ROOM_CODE_LENGTH = 6;
export const TC_NEUTRAL_WIN_THRESHOLD = 3; // need 3/5 correct to conquer neutral
export const TC_START_COUNTDOWN_S = 5;

export const TC_PLAYER_COLORS = [
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

export const TC_CATEGORY_COLORS: Record<string, string> = {
  science: "#3b82f6",
  movies: "#ec4899",
  history: "#f59e0b",
  tech: "#06b6d4",
  gaming: "#22c55e",
};

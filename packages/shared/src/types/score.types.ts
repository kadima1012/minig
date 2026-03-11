import { GameId } from "../enums/game.enums";

export interface ScoreEntry {
  id: string;
  userId: string;
  username: string;
  gameId: GameId;
  score: number;
  createdAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  score: number;
  createdAt: string;
}

export interface SaveScoreRequest {
  gameId: GameId;
  score: number;
}

export interface LeaderboardResponse {
  gameId: GameId;
  entries: LeaderboardEntry[];
}

export interface UserBestScores {
  [gameId: string]: number;
}

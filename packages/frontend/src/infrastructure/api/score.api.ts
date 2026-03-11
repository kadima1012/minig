import apiClient from "./client";
import {
  GameId,
  LeaderboardResponse,
  SaveScoreRequest,
  ScoreEntry,
  UserBestScores,
} from "@minigames/shared";

export const scoreApi = {
  async saveScore(data: SaveScoreRequest): Promise<ScoreEntry> {
    const res = await apiClient.post<{ success: boolean; data: ScoreEntry }>(
      "/scores",
      data
    );
    return res.data.data;
  },

  async getLeaderboard(gameId: GameId): Promise<LeaderboardResponse> {
    const res = await apiClient.get<{ success: boolean; data: LeaderboardResponse }>(
      `/scores/leaderboard/${gameId}`
    );
    return res.data.data;
  },

  async getUserBestScores(): Promise<UserBestScores> {
    const res = await apiClient.get<{ success: boolean; data: UserBestScores }>(
      "/scores/me"
    );
    return res.data.data;
  },
};

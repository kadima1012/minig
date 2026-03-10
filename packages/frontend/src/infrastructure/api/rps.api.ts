import apiClient from "./client";
import { ApiResponse, RpsChoice, RpsRound } from "@minigames/shared";

export const rpsApi = {
  playRound: async (choice: RpsChoice): Promise<RpsRound> => {
    const res = await apiClient.post<ApiResponse<RpsRound>>("/rps/play", { choice });
    return res.data.data;
  },
};

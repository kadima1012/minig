import apiClient from "./client";
import {
  ApiResponse,
  DifferencePuzzle,
  DifferenceClickRequest,
  DifferenceClickResponse,
} from "@minigames/shared";

export const findDifferenceApi = {
  getPuzzle: async (): Promise<DifferencePuzzle> => {
    const res = await apiClient.get<ApiResponse<DifferencePuzzle>>("/find-difference/puzzle");
    return res.data.data;
  },

  validateClick: async (payload: DifferenceClickRequest): Promise<DifferenceClickResponse> => {
    const res = await apiClient.post<ApiResponse<DifferenceClickResponse>>(
      "/find-difference/click",
      payload
    );
    return res.data.data;
  },
};

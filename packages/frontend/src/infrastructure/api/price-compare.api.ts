import apiClient from "./client";
import {
  ApiResponse,
  ProductPair,
  PriceGuessRequest,
  PriceGuessResponse,
} from "@minigames/shared";

export const priceCompareApi = {
  getPair: async (): Promise<ProductPair> => {
    const res = await apiClient.get<ApiResponse<ProductPair>>("/price-compare/pair");
    return res.data.data;
  },

  validateGuess: async (payload: PriceGuessRequest & { currentStreak: number }): Promise<PriceGuessResponse> => {
    const res = await apiClient.post<ApiResponse<PriceGuessResponse>>(
      "/price-compare/guess",
      payload
    );
    return res.data.data;
  },
};

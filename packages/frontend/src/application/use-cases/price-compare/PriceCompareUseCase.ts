import { ProductPair, PriceGuessResponse } from "@minigames/shared";
import { priceCompareApi } from "../../../infrastructure/api/price-compare.api";

export class PriceCompareUseCase {
  async loadPair(): Promise<ProductPair> {
    return priceCompareApi.getPair();
  }

  async submitGuess(
    pairId: string,
    guess: "A" | "B",
    currentStreak: number
  ): Promise<PriceGuessResponse> {
    return priceCompareApi.validateGuess({ pairId, guess, currentStreak });
  }
}

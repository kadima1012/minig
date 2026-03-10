import { IProductRepository } from "../../../domain/interfaces/IProductRepository";
import { PriceGuessResponse } from "@minigames/shared";

interface ValidatePriceGuessInput {
  pairId: string;
  guess: "A" | "B";
  currentStreak: number;
}

export class ValidatePriceGuessUseCase {
  constructor(private readonly productRepo: IProductRepository) {}

  async execute(input: ValidatePriceGuessInput): Promise<PriceGuessResponse> {
    const pair = await this.productRepo.findPairById(input.pairId);
    if (!pair) throw new Error(`Product pair ${input.pairId} not found`);

    const correct = pair.isCorrectGuess(input.guess);
    const streak = correct ? input.currentStreak + 1 : 0;

    return {
      correct,
      priceA: pair.productA.price,
      priceB: pair.productB.price,
      expensiveProduct: pair.getExpensive(),
      streak,
    };
  }
}

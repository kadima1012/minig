import { IProductRepository } from "../../../domain/interfaces/IProductRepository";
import { ProductPair } from "@minigames/shared";

export class GetProductPairUseCase {
  constructor(private readonly productRepo: IProductRepository) {}

  async execute(): Promise<ProductPair> {
    const pair = await this.productRepo.findRandomPair();
    return {
      pairId: pair.pairId,
      productA: {
        id: pair.productA.id,
        name: pair.productA.name,
        imageUrl: pair.productA.imageUrl,
        category: pair.productA.category,
      },
      productB: {
        id: pair.productB.id,
        name: pair.productB.name,
        imageUrl: pair.productB.imageUrl,
        category: pair.productB.category,
      },
    };
  }
}

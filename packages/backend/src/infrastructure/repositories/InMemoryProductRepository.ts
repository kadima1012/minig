import { IProductRepository } from "../../domain/interfaces/IProductRepository";
import { ProductPairEntity } from "../../domain/entities/Product";
import { productPairsData } from "../data/products.data";

export class InMemoryProductRepository implements IProductRepository {
  private readonly pairs: ProductPairEntity[] = productPairsData;

  async findRandomPair(): Promise<ProductPairEntity> {
    const index = Math.floor(Math.random() * this.pairs.length);
    return this.pairs[index];
  }

  async findPairById(pairId: string): Promise<ProductPairEntity | undefined> {
    return this.pairs.find((p) => p.pairId === pairId);
  }
}

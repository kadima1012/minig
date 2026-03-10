import { ProductPairEntity } from "../entities/Product";

export interface IProductRepository {
  findRandomPair(): Promise<ProductPairEntity>;
  findPairById(pairId: string): Promise<ProductPairEntity | undefined>;
}

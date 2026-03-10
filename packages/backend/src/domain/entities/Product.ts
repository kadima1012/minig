export class Product {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly imageUrl: string,
    public readonly category: string,
    public readonly price: number
  ) {}
}

export class ProductPairEntity {
  constructor(
    public readonly pairId: string,
    public readonly productA: Product,
    public readonly productB: Product
  ) {}

  getExpensive(): "A" | "B" {
    return this.productA.price >= this.productB.price ? "A" : "B";
  }

  isCorrectGuess(guess: "A" | "B"): boolean {
    return guess === this.getExpensive();
  }
}

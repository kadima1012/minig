export interface Product {
    id: string;
    name: string;
    imageUrl: string;
    category: string;
}
export interface ProductPair {
    pairId: string;
    productA: Product;
    productB: Product;
}
export interface PriceGuessRequest {
    pairId: string;
    guess: "A" | "B";
}
export interface PriceGuessResponse {
    correct: boolean;
    priceA: number;
    priceB: number;
    expensiveProduct: "A" | "B";
    streak: number;
}
//# sourceMappingURL=price-compare.types.d.ts.map
import { Router } from "express";
import { PriceCompareController } from "../controllers/PriceCompareController";
import { validateBody } from "../middleware/validateRequest";
import { PriceGuessDto } from "../dtos/price-compare.dto";
import { InMemoryProductRepository } from "../../infrastructure/repositories/InMemoryProductRepository";
import { GetProductPairUseCase } from "../../application/use-cases/price-compare/GetProductPair.usecase";
import { ValidatePriceGuessUseCase } from "../../application/use-cases/price-compare/ValidatePriceGuess.usecase";

const productRepo = new InMemoryProductRepository();
const controller = new PriceCompareController(
  new GetProductPairUseCase(productRepo),
  new ValidatePriceGuessUseCase(productRepo)
);

export const priceCompareRouter = Router();

priceCompareRouter.get("/pair", controller.getPair);
priceCompareRouter.post("/guess", validateBody(PriceGuessDto), controller.validateGuess);

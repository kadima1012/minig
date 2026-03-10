import { Request, Response, NextFunction } from "express";
import { GetProductPairUseCase } from "../../application/use-cases/price-compare/GetProductPair.usecase";
import { ValidatePriceGuessUseCase } from "../../application/use-cases/price-compare/ValidatePriceGuess.usecase";
import { PriceGuessDtoType } from "../dtos/price-compare.dto";

export class PriceCompareController {
  constructor(
    private readonly getProductPairUseCase: GetProductPairUseCase,
    private readonly validatePriceGuessUseCase: ValidatePriceGuessUseCase
  ) {}

  getPair = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pair = await this.getProductPairUseCase.execute();
      res.json({ success: true, data: pair });
    } catch (err) {
      next(err);
    }
  };

  validateGuess = async (
    req: Request<object, object, PriceGuessDtoType>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.validatePriceGuessUseCase.execute(req.body);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };
}

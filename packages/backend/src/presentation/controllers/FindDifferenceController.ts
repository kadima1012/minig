import { Request, Response, NextFunction } from "express";
import { GetPuzzleUseCase } from "../../application/use-cases/find-difference/GetPuzzle.usecase";
import { ValidateClickUseCase } from "../../application/use-cases/find-difference/ValidateClick.usecase";
import { DifferenceClickDtoType } from "../dtos/find-difference.dto";

export class FindDifferenceController {
  constructor(
    private readonly getPuzzleUseCase: GetPuzzleUseCase,
    private readonly validateClickUseCase: ValidateClickUseCase
  ) {}

  getPuzzle = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const puzzle = await this.getPuzzleUseCase.execute();
      res.json({ success: true, data: puzzle });
    } catch (err) {
      next(err);
    }
  };

  validateClick = async (
    req: Request<object, object, DifferenceClickDtoType>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.validateClickUseCase.execute(req.body);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };
}

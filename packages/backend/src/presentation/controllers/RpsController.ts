import { Request, Response, NextFunction } from "express";
import { PlayRoundUseCase } from "../../application/use-cases/rps/PlayRound.usecase";
import { PlayRoundDtoType } from "../dtos/rps.dto";

export class RpsController {
  constructor(private readonly playRoundUseCase: PlayRoundUseCase) {}

  playRound = (
    req: Request<object, object, PlayRoundDtoType>,
    res: Response,
    next: NextFunction
  ): void => {
    try {
      const result = this.playRoundUseCase.execute(req.body.choice);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };
}

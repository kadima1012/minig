import { Router } from "express";
import { FindDifferenceController } from "../controllers/FindDifferenceController";
import { validateBody } from "../middleware/validateRequest";
import { DifferenceClickDto } from "../dtos/find-difference.dto";
import { InMemoryPuzzleRepository } from "../../infrastructure/repositories/InMemoryPuzzleRepository";
import { GetPuzzleUseCase } from "../../application/use-cases/find-difference/GetPuzzle.usecase";
import { ValidateClickUseCase } from "../../application/use-cases/find-difference/ValidateClick.usecase";

const puzzleRepo = new InMemoryPuzzleRepository();
const controller = new FindDifferenceController(
  new GetPuzzleUseCase(puzzleRepo),
  new ValidateClickUseCase(puzzleRepo)
);

export const findDifferenceRouter = Router();

findDifferenceRouter.get("/puzzle", controller.getPuzzle);
findDifferenceRouter.post("/click", validateBody(DifferenceClickDto), controller.validateClick);

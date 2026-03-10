import { Router } from "express";
import { RpsController } from "../controllers/RpsController";
import { validateBody } from "../middleware/validateRequest";
import { PlayRoundDto } from "../dtos/rps.dto";
import { PlayRoundUseCase } from "../../application/use-cases/rps/PlayRound.usecase";

const controller = new RpsController(new PlayRoundUseCase());

export const rpsRouter = Router();

rpsRouter.post("/play", validateBody(PlayRoundDto), controller.playRound);

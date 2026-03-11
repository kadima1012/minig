import { Router } from "express";
import { ScoreController } from "../controllers/ScoreController";
import { validateBody } from "../middleware/validateRequest";
import { authMiddleware } from "../middleware/authMiddleware";
import { SaveScoreDto } from "../dtos/score.dto";

export const scoreRouter = Router();

scoreRouter.post("/", authMiddleware, validateBody(SaveScoreDto), ScoreController.saveScore);
scoreRouter.get("/leaderboard/:gameId", ScoreController.getLeaderboard);
scoreRouter.get("/me", authMiddleware, ScoreController.getUserBestScores);

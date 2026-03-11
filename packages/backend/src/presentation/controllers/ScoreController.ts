import { Request, Response, NextFunction } from "express";
import { GameId } from "@minigames/shared";
import { SaveScoreUseCase } from "../../application/use-cases/score/SaveScore.usecase";
import { GetLeaderboardUseCase } from "../../application/use-cases/score/GetLeaderboard.usecase";
import { GetUserBestScoresUseCase } from "../../application/use-cases/score/GetUserBestScores.usecase";
import { InMemoryScoreRepository } from "../../infrastructure/repositories/InMemoryScoreRepository";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { userRepo } from "./AuthController";

export const scoreRepo = new InMemoryScoreRepository();

const saveScoreUseCase = new SaveScoreUseCase(scoreRepo, userRepo);
const getLeaderboardUseCase = new GetLeaderboardUseCase(scoreRepo);
const getUserBestScoresUseCase = new GetUserBestScoresUseCase(scoreRepo);

export class ScoreController {
  static async saveScore(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await saveScoreUseCase.execute({
        userId: req.userId!,
        gameId: req.body.gameId,
        score: req.body.score,
      });
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save score";
      res.status(400).json({ success: false, message });
    }
  }

  static async getLeaderboard(req: Request, res: Response, next: NextFunction) {
    try {
      const gameId = req.params.gameId as GameId;
      if (!Object.values(GameId).includes(gameId)) {
        res.status(400).json({ success: false, message: "Invalid game ID" });
        return;
      }
      const result = await getLeaderboardUseCase.execute(gameId);
      res.json({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to get leaderboard";
      res.status(500).json({ success: false, message });
    }
  }

  static async getUserBestScores(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await getUserBestScoresUseCase.execute(req.userId!);
      res.json({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to get best scores";
      res.status(500).json({ success: false, message });
    }
  }
}

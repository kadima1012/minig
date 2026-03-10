import { Request, Response, NextFunction } from "express";
import { GetQuestionsUseCase } from "../../application/use-cases/quiz/GetQuestions.usecase";
import { SubmitAnswerUseCase } from "../../application/use-cases/quiz/SubmitAnswer.usecase";
import { SubmitAnswerDtoType } from "../dtos/quiz.dto";

export class QuizController {
  constructor(
    private readonly getQuestionsUseCase: GetQuestionsUseCase,
    private readonly submitAnswerUseCase: SubmitAnswerUseCase
  ) {}

  getQuestions = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const questions = await this.getQuestionsUseCase.execute(10);
      res.json({ success: true, data: questions });
    } catch (err) {
      next(err);
    }
  };

  submitAnswer = async (
    req: Request<object, object, SubmitAnswerDtoType>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.submitAnswerUseCase.execute(req.body);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };
}

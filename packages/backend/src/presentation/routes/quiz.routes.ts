import { Router } from "express";
import { QuizController } from "../controllers/QuizController";
import { validateBody } from "../middleware/validateRequest";
import { SubmitAnswerDto } from "../dtos/quiz.dto";
import { InMemoryQuestionRepository } from "../../infrastructure/repositories/InMemoryQuestionRepository";
import { GetQuestionsUseCase } from "../../application/use-cases/quiz/GetQuestions.usecase";
import { SubmitAnswerUseCase } from "../../application/use-cases/quiz/SubmitAnswer.usecase";

const questionRepo = new InMemoryQuestionRepository();
const controller = new QuizController(
  new GetQuestionsUseCase(questionRepo),
  new SubmitAnswerUseCase(questionRepo)
);

export const quizRouter = Router();

quizRouter.get("/questions", controller.getQuestions);
quizRouter.post("/answer", validateBody(SubmitAnswerDto), controller.submitAnswer);

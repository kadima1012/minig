import { Router } from "express";
import { quizRouter } from "./quiz.routes";
import { rpsRouter } from "./rps.routes";
import { findDifferenceRouter } from "./find-difference.routes";
import { priceCompareRouter } from "./price-compare.routes";
import { authRouter } from "./auth.routes";
import { scoreRouter } from "./score.routes";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/scores", scoreRouter);
apiRouter.use("/quiz", quizRouter);
apiRouter.use("/rps", rpsRouter);
apiRouter.use("/find-difference", findDifferenceRouter);
apiRouter.use("/price-compare", priceCompareRouter);

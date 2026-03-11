import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { validateBody } from "../middleware/validateRequest";
import { authMiddleware } from "../middleware/authMiddleware";
import { RegisterDto, LoginDto } from "../dtos/auth.dto";

export const authRouter = Router();

authRouter.post("/register", validateBody(RegisterDto), AuthController.register);
authRouter.post("/login", validateBody(LoginDto), AuthController.login);
authRouter.get("/me", authMiddleware, AuthController.getProfile);

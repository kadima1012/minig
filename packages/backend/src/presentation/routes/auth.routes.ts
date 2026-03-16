import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { validateBody } from "../middleware/validateRequest";
import { authMiddleware } from "../middleware/authMiddleware";
import { RegisterDto, LoginDto, UpdateProfileDto, ChangePasswordDto, DeleteAccountDto } from "../dtos/auth.dto";

export const authRouter = Router();

authRouter.post("/register", validateBody(RegisterDto), AuthController.register);
authRouter.post("/login", validateBody(LoginDto), AuthController.login);
authRouter.get("/me", authMiddleware, AuthController.getProfile);
authRouter.put("/profile", authMiddleware, validateBody(UpdateProfileDto), AuthController.updateProfile);
authRouter.put("/password", authMiddleware, validateBody(ChangePasswordDto), AuthController.changePassword);
authRouter.delete("/account", authMiddleware, validateBody(DeleteAccountDto), AuthController.deleteAccount);

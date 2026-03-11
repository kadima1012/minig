import { Request, Response, NextFunction } from "express";
import { RegisterUseCase } from "../../application/use-cases/auth/Register.usecase";
import { LoginUseCase } from "../../application/use-cases/auth/Login.usecase";
import { GetProfileUseCase } from "../../application/use-cases/auth/GetProfile.usecase";
import { InMemoryUserRepository } from "../../infrastructure/repositories/InMemoryUserRepository";
import { PasswordService } from "../../infrastructure/services/PasswordService";
import { JwtService } from "../../infrastructure/services/JwtService";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

export const userRepo = new InMemoryUserRepository();
const passwordService = new PasswordService();
const jwtService = new JwtService();

const registerUseCase = new RegisterUseCase(userRepo, passwordService, jwtService);
const loginUseCase = new LoginUseCase(userRepo, passwordService, jwtService);
const getProfileUseCase = new GetProfileUseCase(userRepo);

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await registerUseCase.execute(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Registration failed";
      res.status(400).json({ success: false, message });
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await loginUseCase.execute(req.body);
      res.json({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      res.status(401).json({ success: false, message });
    }
  }

  static async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const profile = await getProfileUseCase.execute(userId);
      res.json({ success: true, data: profile });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to get profile";
      res.status(404).json({ success: false, message });
    }
  }
}

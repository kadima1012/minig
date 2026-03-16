import { Request, Response, NextFunction } from "express";
import { RegisterUseCase } from "../../application/use-cases/auth/Register.usecase";
import { LoginUseCase } from "../../application/use-cases/auth/Login.usecase";
import { GetProfileUseCase } from "../../application/use-cases/auth/GetProfile.usecase";
import { UpdateProfileUseCase } from "../../application/use-cases/auth/UpdateProfile.usecase";
import { ChangePasswordUseCase } from "../../application/use-cases/auth/ChangePassword.usecase";
import { DeleteAccountUseCase } from "../../application/use-cases/auth/DeleteAccount.usecase";
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
const updateProfileUseCase = new UpdateProfileUseCase(userRepo);
const changePasswordUseCase = new ChangePasswordUseCase(userRepo, passwordService);
const deleteAccountUseCase = new DeleteAccountUseCase(userRepo, passwordService);

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

  static async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const profile = await updateProfileUseCase.execute(userId, req.body);
      res.json({ success: true, data: profile });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update profile";
      res.status(400).json({ success: false, message });
    }
  }

  static async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      await changePasswordUseCase.execute(userId, req.body.currentPassword, req.body.newPassword);
      res.json({ success: true, message: "Password changed successfully" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to change password";
      res.status(400).json({ success: false, message });
    }
  }

  static async deleteAccount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      await deleteAccountUseCase.execute(userId, req.body.password);
      res.json({ success: true, message: "Account deleted successfully" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete account";
      res.status(400).json({ success: false, message });
    }
  }
}

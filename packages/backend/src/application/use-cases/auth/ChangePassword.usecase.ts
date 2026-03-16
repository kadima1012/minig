import { IUserRepository } from "../../../domain/interfaces/IUserRepository";
import { PasswordService } from "../../../infrastructure/services/PasswordService";

export class ChangePasswordUseCase {
  constructor(
    private userRepo: IUserRepository,
    private passwordService: PasswordService
  ) {}

  async execute(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new Error("User not found");

    const valid = await this.passwordService.compare(currentPassword, user.passwordHash);
    if (!valid) throw new Error("Current password is incorrect");

    user.passwordHash = await this.passwordService.hash(newPassword);
    await this.userRepo.update(user);
  }
}

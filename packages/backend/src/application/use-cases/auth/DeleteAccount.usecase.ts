import { IUserRepository } from "../../../domain/interfaces/IUserRepository";
import { PasswordService } from "../../../infrastructure/services/PasswordService";

export class DeleteAccountUseCase {
  constructor(
    private userRepo: IUserRepository,
    private passwordService: PasswordService
  ) {}

  async execute(userId: string, password: string): Promise<void> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new Error("User not found");

    const valid = await this.passwordService.compare(password, user.passwordHash);
    if (!valid) throw new Error("Password is incorrect");

    await this.userRepo.delete(userId);
  }
}

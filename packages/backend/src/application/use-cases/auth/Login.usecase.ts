import { IUserRepository } from "../../../domain/interfaces/IUserRepository";
import { PasswordService } from "../../../infrastructure/services/PasswordService";
import { JwtService } from "../../../infrastructure/services/JwtService";
import { AuthResponse } from "@minigames/shared";

interface LoginInput {
  email: string;
  password: string;
}

export class LoginUseCase {
  constructor(
    private userRepo: IUserRepository,
    private passwordService: PasswordService,
    private jwtService: JwtService
  ) {}

  async execute(input: LoginInput): Promise<AuthResponse> {
    const user = await this.userRepo.findByEmail(input.email);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    const valid = await this.passwordService.compare(input.password, user.passwordHash);
    if (!valid) {
      throw new Error("Invalid email or password");
    }

    const token = this.jwtService.sign({ userId: user.id });

    return { user: user.toProfile(), token };
  }
}

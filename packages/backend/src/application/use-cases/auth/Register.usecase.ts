import { randomUUID } from "crypto";
import { UserEntity } from "../../../domain/entities/User";
import { IUserRepository } from "../../../domain/interfaces/IUserRepository";
import { PasswordService } from "../../../infrastructure/services/PasswordService";
import { JwtService } from "../../../infrastructure/services/JwtService";
import { AuthResponse } from "@minigames/shared";

interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

export class RegisterUseCase {
  constructor(
    private userRepo: IUserRepository,
    private passwordService: PasswordService,
    private jwtService: JwtService
  ) {}

  async execute(input: RegisterInput): Promise<AuthResponse> {
    const existingEmail = await this.userRepo.findByEmail(input.email);
    if (existingEmail) {
      throw new Error("Email already in use");
    }

    const existingUsername = await this.userRepo.findByUsername(input.username);
    if (existingUsername) {
      throw new Error("Username already taken");
    }

    const passwordHash = await this.passwordService.hash(input.password);
    const user = new UserEntity(
      randomUUID(),
      input.username,
      input.email,
      passwordHash,
      new Date()
    );

    await this.userRepo.create(user);

    const token = this.jwtService.sign({ userId: user.id });

    return { user: user.toProfile(), token };
  }
}

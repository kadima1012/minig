import { UpdateProfileRequest, UserProfile } from "@minigames/shared";
import { IUserRepository } from "../../../domain/interfaces/IUserRepository";

export class UpdateProfileUseCase {
  constructor(private userRepo: IUserRepository) {}

  async execute(userId: string, data: UpdateProfileRequest): Promise<UserProfile> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new Error("User not found");

    if (data.username && data.username !== user.username) {
      const existing = await this.userRepo.findByUsername(data.username);
      if (existing) throw new Error("Username already taken");
      user.username = data.username;
    }

    if (data.email && data.email !== user.email) {
      const existing = await this.userRepo.findByEmail(data.email);
      if (existing) throw new Error("Email already in use");
      user.email = data.email;
    }

    await this.userRepo.update(user);
    return user.toProfile();
  }
}

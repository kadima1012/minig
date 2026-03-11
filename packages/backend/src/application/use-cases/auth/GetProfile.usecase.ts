import { IUserRepository } from "../../../domain/interfaces/IUserRepository";
import { UserProfile } from "@minigames/shared";

export class GetProfileUseCase {
  constructor(private userRepo: IUserRepository) {}

  async execute(userId: string): Promise<UserProfile> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    return user.toProfile();
  }
}

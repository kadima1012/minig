import { randomUUID } from "crypto";
import { UserEntity } from "../../domain/entities/User";
import { InMemoryUserRepository } from "../repositories/InMemoryUserRepository";
import { PasswordService } from "../services/PasswordService";

export async function seedTestData(userRepo: InMemoryUserRepository) {
  const passwordService = new PasswordService();
  const hash = await passwordService.hash("password");

  const testUser = new UserEntity(
    randomUUID(),
    "auner",
    "auner_edy@yahoo.com",
    hash,
    new Date()
  );

  const testUser2 = new UserEntity(
    randomUUID(),
    "player2",
    "player2@test.com",
    hash,
    new Date()
  );

  await userRepo.create(testUser);
  await userRepo.create(testUser2);
  console.log("[seed] Test user created: auner_edy@yahoo.com / password");
  console.log("[seed] Test user created: player2@test.com / password");
}

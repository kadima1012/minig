import { UserEntity } from "../../domain/entities/User";
import { IUserRepository } from "../../domain/interfaces/IUserRepository";

export class InMemoryUserRepository implements IUserRepository {
  private users: UserEntity[] = [];

  async findById(id: string): Promise<UserEntity | null> {
    return this.users.find((u) => u.id === id) ?? null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.users.find((u) => u.email === email) ?? null;
  }

  async findByUsername(username: string): Promise<UserEntity | null> {
    return this.users.find((u) => u.username === username) ?? null;
  }

  async create(user: UserEntity): Promise<UserEntity> {
    this.users.push(user);
    return user;
  }
}

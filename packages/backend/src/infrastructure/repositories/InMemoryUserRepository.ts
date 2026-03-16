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

  async update(user: UserEntity): Promise<UserEntity> {
    const index = this.users.findIndex((u) => u.id === user.id);
    if (index === -1) throw new Error("User not found");
    this.users[index] = user;
    return user;
  }

  async delete(id: string): Promise<void> {
    this.users = this.users.filter((u) => u.id !== id);
  }
}

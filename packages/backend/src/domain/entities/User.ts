export class UserEntity {
  constructor(
    public readonly id: string,
    public readonly username: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly createdAt: Date
  ) {}

  toProfile() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      createdAt: this.createdAt.toISOString(),
    };
  }
}

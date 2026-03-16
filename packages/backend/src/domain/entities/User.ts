export class UserEntity {
  public username: string;
  public email: string;
  public passwordHash: string;

  constructor(
    public readonly id: string,
    username: string,
    email: string,
    passwordHash: string,
    public readonly createdAt: Date
  ) {
    this.username = username;
    this.email = email;
    this.passwordHash = passwordHash;
  }

  toProfile() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      createdAt: this.createdAt.toISOString(),
    };
  }
}

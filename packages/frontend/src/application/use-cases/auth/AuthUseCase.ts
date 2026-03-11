import { authApi } from "../../../infrastructure/api/auth.api";
import { AuthResponse, LoginRequest, RegisterRequest, UserProfile } from "@minigames/shared";

export class AuthUseCase {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    return authApi.register(data);
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    return authApi.login(data);
  }

  async getProfile(): Promise<UserProfile> {
    return authApi.getProfile();
  }
}

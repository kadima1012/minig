import { authApi } from "../../../infrastructure/api/auth.api";
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
  ChangePasswordRequest,
  DeleteAccountRequest,
  UserProfile,
} from "@minigames/shared";

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

  async updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
    return authApi.updateProfile(data);
  }

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    return authApi.changePassword(data);
  }

  async deleteAccount(data: DeleteAccountRequest): Promise<void> {
    return authApi.deleteAccount(data);
  }
}

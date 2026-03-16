import apiClient from "./client";
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
  ChangePasswordRequest,
  DeleteAccountRequest,
  UserProfile,
} from "@minigames/shared";

export const authApi = {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const res = await apiClient.post<{ success: boolean; data: AuthResponse }>(
      "/auth/register",
      data
    );
    return res.data.data;
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    const res = await apiClient.post<{ success: boolean; data: AuthResponse }>(
      "/auth/login",
      data
    );
    return res.data.data;
  },

  async getProfile(): Promise<UserProfile> {
    const res = await apiClient.get<{ success: boolean; data: UserProfile }>("/auth/me");
    return res.data.data;
  },

  async updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
    const res = await apiClient.put<{ success: boolean; data: UserProfile }>(
      "/auth/profile",
      data
    );
    return res.data.data;
  },

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await apiClient.put("/auth/password", data);
  },

  async deleteAccount(data: DeleteAccountRequest): Promise<void> {
    await apiClient.delete("/auth/account", { data });
  },
};

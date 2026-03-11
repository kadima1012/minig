import apiClient from "./client";
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
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
};

import React, { createContext, useCallback, useEffect, useState } from "react";
import { UserProfile, LoginRequest, RegisterRequest } from "@minigames/shared";
import { AuthUseCase } from "../../application/use-cases/auth/AuthUseCase";

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
}

export interface AuthContextValue extends AuthState {
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = "minigames_token";
const authUseCase = new AuthUseCase();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem(TOKEN_KEY),
    loading: true,
  });

  useEffect(() => {
    if (!state.token) {
      setState((s) => ({ ...s, loading: false }));
      return;
    }

    authUseCase
      .getProfile()
      .then((user) => setState({ user, token: state.token, loading: false }))
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setState({ user: null, token: null, loading: false });
      });
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    const result = await authUseCase.login(data);
    localStorage.setItem(TOKEN_KEY, result.token);
    setState({ user: result.user, token: result.token, loading: false });
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    const result = await authUseCase.register(data);
    localStorage.setItem(TOKEN_KEY, result.token);
    setState({ user: result.user, token: result.token, loading: false });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setState({ user: null, token: null, loading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

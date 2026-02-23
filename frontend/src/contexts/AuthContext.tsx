import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { apiClient } from "../api/client";
import { authApi, usersApi } from "../api";
import type { User } from "../api/types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (email: string, password: string, name?: string) => Promise<User>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = apiClient.getToken();
    if (token) {
      usersApi
        .getProfile()
        .then(setUser)
        .catch(() => {
          apiClient.setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password }); 
    apiClient.setToken(response.accessToken);
    localStorage.setItem("refreshToken", response.refreshToken);
    setUser(response.user);
    return response.user;
  };

  const signup = async (email: string, password: string, name?: string) => {
    const response = await authApi.signup({ email, password, name });
    apiClient.setToken(response.accessToken);
    localStorage.setItem("refreshToken", response.refreshToken);
    setUser(response.user);
    return response.user;
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch {
        // Ignore logout errors
      }
    }
    apiClient.setToken(null);
    localStorage.removeItem("refreshToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === "ADMIN",
        login,
        signup,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

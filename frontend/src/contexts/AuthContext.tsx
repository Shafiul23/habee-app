// frontend/src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import api from "../../lib/api";

type AuthContextType = {
  isLoggedIn: boolean;
  token: string | null; // for backend calls
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const checkToken = async () => {
      const token = await SecureStore.getItemAsync("token");

      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        try {
          await api.get("/habits/test");
          setIsLoggedIn(true);
          setToken(token);
        } catch (err) {
          console.warn("Invalid or expired token. Clearing...");
          await SecureStore.deleteItemAsync("token");
          delete api.defaults.headers.common["Authorization"];
          setIsLoggedIn(false);
          setToken(null);
        }
      } else {
        setIsLoggedIn(false);
      }
    };

    checkToken();
  }, []);

  const register = async (email: string, password: string) => {
    await api.post("/auth/register", { email, password });
  };

  const login = async (token: string) => {
    await SecureStore.setItemAsync("token", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setIsLoggedIn(true);
    setToken(token);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("token");
    delete api.defaults.headers.common["Authorization"];
    setIsLoggedIn(false);
    setToken(null);
  };

  const deleteAccount = async () => {
    await api.delete("/auth/delete");
    await logout(); // Clear token and state
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, token, register, login, logout, deleteAccount }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext)!;

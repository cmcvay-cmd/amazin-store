"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  getSession,
  loginUser,
  logoutUser,
  registerUser,
  type SessionUser,
} from "@/lib/auth";

type AuthContextValue = {
  user: SessionUser | null;
  ready: boolean;
  login: (id: string, password: string) => { ok: boolean; error?: string };
  register: (input: {
    name: string;
    address: string;
    contact: string;
    password: string;
  }) => { ok: boolean; error?: string; userId?: string };
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(getSession());
    setReady(true);
  }, []);

  const login = (id: string, password: string) => {
    const res = loginUser(id, password);
    if (res.ok) {
      setUser(res.user);
      return { ok: true };
    }
    return { ok: false, error: res.error };
  };

  const register = (input: {
    name: string;
    address: string;
    contact: string;
    password: string;
  }) => {
    const res = registerUser(input);
    if (res.ok) {
      setUser(res.user);
      return { ok: true, userId: res.user.id };
    }
    return { ok: false, error: res.error };
  };

  const logout = () => {
    logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, ready, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

import React, { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "user" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => boolean;
  signup: (name: string, email: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USERS: User[] = [
  { id: "u1", name: "John Doe", email: "user@demo.com", role: "user" },
  { id: "a1", name: "Admin", email: "admin@demo.com", role: "admin" },
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, _password: string, role: UserRole): boolean => {
    // Simulate auth
    const found = DEMO_USERS.find((u) => u.email === email && u.role === role);
    if (found) {
      setUser(found);
      return true;
    }
    // Allow any email for demo
    setUser({
      id: Math.random().toString(36).slice(2),
      name: email.split("@")[0],
      email,
      role,
    });
    return true;
  };

  const signup = (name: string, email: string, _password: string): boolean => {
    setUser({
      id: Math.random().toString(36).slice(2),
      name,
      email,
      role: "user",
    });
    return true;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

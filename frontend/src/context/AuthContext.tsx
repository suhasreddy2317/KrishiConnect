import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';

interface User {
  id: number;
  name: string;
  phone: string;
  email?: string | null;
  role: string;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('kc_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('kc_user');
    if (stored && token) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('kc_user');
      }
    }
    setIsLoading(false);
  }, [token]);

  const login = async (identifier: string, password: string) => {
    const response = await apiRequest<{ access_token: string; token_type: string; user: User }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ identifier, password }),
      },
    );

    setToken(response.access_token);
    setUser(response.user);
    localStorage.setItem('kc_token', response.access_token);
    localStorage.setItem('kc_user', JSON.stringify(response.user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('kc_token');
    localStorage.removeItem('kc_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};

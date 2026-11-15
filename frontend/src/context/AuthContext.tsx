'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../lib/types';
import { api, getStoredToken, setStoredToken, clearStoredToken } from '../lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email_or_phone: string, passcode: string) => Promise<void>;
  signup: (name: string, email_or_phone: string, passcode: string, default_role: string) => Promise<void>;
  demoLogin: (persona: 'grandpa' | 'sarah' | 'elena' | 'tom') => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const stored = getStoredToken();
      if (stored) {
        setToken(stored);
        try {
          const userData = await api.getMe();
          setUser(userData);
        } catch {
          clearStoredToken();
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email_or_phone: string, passcode: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email_or_phone, passcode);
      setStoredToken(res.access_token);
      setToken(res.access_token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email_or_phone: string, passcode: string, default_role: string) => {
    setIsLoading(true);
    try {
      const res = await api.signup(name, email_or_phone, passcode, default_role);
      setStoredToken(res.access_token);
      setToken(res.access_token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async (persona: 'grandpa' | 'sarah' | 'elena' | 'tom') => {
    setIsLoading(true);
    try {
      const res = await api.demoLogin(persona);
      setStoredToken(res.access_token);
      setToken(res.access_token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearStoredToken();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, signup, demoLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

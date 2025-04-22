// src/context/AuthContext.tsx

'use client';

import { createContext, useState, useContext, ReactNode } from 'react';
import jwt from 'jsonwebtoken';

interface AuthContextType {
  isLoggedIn: boolean;
  userName: string | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userName, setUserName] = useState<string | null>(null);

  const login = (token: string) => {
    localStorage.setItem('authToken', token);
    const decoded = jwt.decode(token) as { email: string } | null;
    if (decoded) {
      setIsLoggedIn(true);
      setUserName(decoded.email);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setIsLoggedIn(false);
    setUserName(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userName, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

'use client';

import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import jwt from 'jsonwebtoken';

interface AuthContextType {
  isLoggedIn: boolean;
  userEmail: string | null;
  userName: string | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  // Khôi phục trạng thái khi load lại trang
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decoded = jwt.decode(token) as { name: string } | null;
        if (decoded && decoded.name) {
          setIsLoggedIn(true);
          setUserName(decoded.name); // Giả sử bạn muốn hiển thị email như tên người dùng
        }
      } catch (error) {
        console.error('Token decode error:', error);
        logout();
      }
    }
  }, []);

  const login = (token: string) => {
    localStorage.setItem('authToken', token);
    const decoded = jwt.decode(token) as { name: string } | null;
        if (decoded && decoded.name) {
          setIsLoggedIn(true);
          setUserName(decoded.name); // Giả sử bạn muốn hiển thị email như tên người dùng
        }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setIsLoggedIn(false);
    setUserName(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userEmail, userName, login, logout }}>
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

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

  const logout = async () => {
    try {
      // Gọi API logout để xóa cookie
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (response.ok) {
        // Xóa localStorage nếu bạn vẫn lưu một số thông tin ở đó
        localStorage.removeItem('authToken');
        
        // Cập nhật state
        setIsLoggedIn(false);
        setUserName(null);
        
        // Tùy chọn: chuyển hướng về trang login
        // window.location.href = '/login';
      } else {
        console.error('Đăng xuất thất bại');
      }
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error);
    }
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

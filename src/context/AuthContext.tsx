'use client';

import {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from 'react';
import jwt from 'jsonwebtoken';

interface AuthContextType {
  isLoggedIn: boolean;
  userEmail: string | null;
  userName: string | null;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  // ✅ Hàm fetch liked posts chung
  const fetchLikedPosts = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/likes`);
      const data = await response.json();
      if (data.success && Array.isArray(data.likedPostIds)) {
        const likedPostsObj: Record<string, boolean> = {};
        data.likedPostIds.forEach((postId: string) => {
          likedPostsObj[postId] = true;
        });
        localStorage.setItem('likedPosts', JSON.stringify(likedPostsObj));
        console.log('✅ Lưu likedPosts thành công:', likedPostsObj);
      }
    } catch (error) {
      console.error('❌ Lỗi khi fetch liked posts:', error);
    }
  };

  // ✅ Khôi phục trạng thái khi load lại trang
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');

    if (token && userId) {
      try {
        const decoded = jwt.decode(token) as { name: string } | null;
        if (decoded && decoded.name) {
          setIsLoggedIn(true);
          setUserName(decoded.name);
          fetchLikedPosts(userId); // <-- fetch lại khi reload
        }
      } catch (error) {
        console.error('Token decode error:', error);
        logout();
      }
    }
  }, []);

  // ✅ Hàm login async + await fetch liked
  const login = async (token: string) => {
    localStorage.setItem('authToken', token);

    const decoded = jwt.decode(token) as { name: string; _id: string } | null;
    if (decoded && decoded.name && decoded._id) {
      setIsLoggedIn(true);
      setUserName(decoded.name);
      localStorage.setItem('userId', decoded._id);

      await fetchLikedPosts(decoded._id); // ⬅ fetch sau login
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

        
        // Cập nhật state
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('likedPosts');
        setIsLoggedIn(false);
         setUserName(null);
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
    <AuthContext.Provider
      value={{ isLoggedIn, userEmail, userName, login, logout }}
    >
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

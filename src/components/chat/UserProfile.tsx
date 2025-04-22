'use client';

import { useAuth } from "@context/AuthContext"; // Import useAuth
import { useRouter } from 'next/navigation';
import Image from 'next/image'; // Sử dụng Image từ Next.js

export default function UserProfile() {
  const { isLoggedIn, userName, logout } = useAuth();  // Lấy trạng thái đăng nhập từ context
  const router = useRouter();

  const handleLogout = () => {
    logout();  // Gọi hàm logout từ context
    router.push('/login');  // Chuyển hướng đến trang login sau khi đăng xuất
  };

  return (
    <div className="flex items-center gap-4">
      {isLoggedIn ? (
        <>
          <div className="flex items-center">
            <Image
              src="/img/avatar-default-svgrepo-com.svg"
              alt="User Avatar"
              className="w-10 h-10 rounded-full cursor-pointer"
              width={40} // Cài đặt width cho Image
              height={40} // Cài đặt height cho Image
            />
            <span className="ml-2">{userName}</span>  {/* Hiển thị tên người dùng */}
          </div>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md"
          >
            Đăng xuất
          </button>
        </>
      ) : (
        <div className="flex gap-4">
          <button
            onClick={() => router.push('/login')}
            className="bg-white text-white border-2 border-blue-800 rounded px-6 py-2 rounded-md relative overflow-hidden group hover:bg-gradient-to-r hover:from-blue-500 hover:via-indigo-400 hover:to-purple-500"
          >
            <span className="relative group-hover:text-white z-10 font-bold text-gray-800">
              Đăng nhập
            </span>
          </button>
          <button
            onClick={() => router.push('/register')}
            className="bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-500 text-white px-6 py-2 rounded-md relative overflow-hidden group"
          >
            <span className="absolute top-0 left-0 w-full h-full bg-white opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-0 transition duration-500"></span>
            <span className="relative group-hover:text-white z-10 font-bold text-gray-800">
              Đăng ký
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
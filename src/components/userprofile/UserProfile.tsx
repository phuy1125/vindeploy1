'use client';

import { useEffect, useState } from 'react';
import { useAuth } from "@context/AuthContext"; // Import useAuth
import { useRouter } from 'next/navigation';
import Image from 'next/image'; // Import Image from Next.js

export default function UserProfile() {
  const { isLoggedIn, userName, userId, avatar, logout, updateUserName, updateAvatar } = useAuth();  // Get avatar from context
  const router = useRouter();

  const handleLogout = () => {
    logout();  // Call the logout function from context
    router.push('/login');  // Redirect to login page after logout
  };

  const handleAvatarClick = () => {
    if (userId) {
      router.push(`/user/${userId}`);  // Redirect to user detail page
    }
  };

  // Ensure userName is pulled from localStorage if it's not already in the context
  useEffect(() => {
    const storedUserName = localStorage.getItem('userName');
    const storedAvatar = localStorage.getItem('avatar');
  
    if (storedUserName && storedUserName !== userName) {
      updateUserName(storedUserName); // Update username in context if it's different
    }
  
    if (storedAvatar && storedAvatar !== avatar) {
      updateAvatar(storedAvatar); // Update avatar in context if it's different
    }
  }, [userName, avatar, updateUserName, updateAvatar]);
  

  return (
    <div className="flex items-center gap-4">
      {isLoggedIn ? (
        <>
          <div className="flex items-center cursor-pointer" onClick={handleAvatarClick}>
            <div className="relative">
              <Image
                src={avatar || "/img/avatar-default-svgrepo-com.svg"}  // Use avatar from context
                alt="User Avatar"
                className="w-10 h-10 rounded-full transition-all duration-200 ease-in-out transform hover:scale-110 hover:border-2 hover:border-blue-500"
                width={40}  // Set width for Image
                height={40}  // Set height for Image
              />
            </div>
            <span className="ml-2">{userName}</span>  {/* Display userName */}
          </div>
          
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md ml-4"
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

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@context/AuthContext';
import Image from 'next/image';

interface UserDetails {
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  avatar: string | null;
}

export default function UserDetailPage() {
  const params = useParams<{ userId: string }>();
  const userId = params?.userId;
  const router = useRouter();
  const { updateUserName, updateAvatar } = useAuth();

  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [newUsername, setNewUsername] = useState<string>('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Fetch user details on component mount
  useEffect(() => {
    if (userId) {
      async function fetchUserDetails() {
        try {
          const res = await fetch(`/api/users/${userId}`);
          const data = await res.json();

          if (res.ok) {
            setUserDetails(data);
            setNewUsername(data.username || '');
          } else {
            setError(data.message || 'Không thể lấy thông tin người dùng');
          }
        } catch (err) {
          setError('Lỗi khi lấy thông tin người dùng');
          console.error(err);
        } finally {
          setLoading(false);
        }
      }

      fetchUserDetails();
    }
  }, [userId]);

  // Handle avatar change (file upload)
  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      // Create preview URL for the selected image
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);
    }
  };

  const handleUpdateUsernameAndAvatar = async () => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      
      // Only append username if it's not empty and different from current
      if (newUsername && newUsername !== userDetails?.username) {
        formData.append('username', newUsername);
      }

      // If there's an avatar file, append it
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const res = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        // Immediately update the userDetails state with new username and avatar
        setUserDetails((prevState) => {
          if (prevState) {
            return {
              ...prevState,
              username: newUsername || prevState.username,
              avatar: data.avatarUrl || prevState.avatar,
              updatedAt: new Date().toISOString(),
            };
          }
          return prevState;
        });

        // Update username and avatar in context if they were changed
        if (newUsername && newUsername !== userDetails?.username) {
          updateUserName(newUsername);
        }
        if (data.avatarUrl) {
          // Store the avatar URL in localStorage for persistence
          localStorage.setItem('avatar', data.avatarUrl);
          updateAvatar(data.avatarUrl);
        }

        // Reset states
        setEditMode(false);
        setAvatarFile(null);
        setPreviewImage(null);
      } else {
        throw new Error(data.message || 'Failed to update username and avatar');
      }
    } catch (err) {
      setError('Error updating username and avatar');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setNewUsername(userDetails?.username || '');
    setAvatarFile(null);
    setPreviewImage(null);
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white overflow-hidden shadow rounded-lg border p-6 w-full max-w-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Thông tin người dùng
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Đây là thông tin chi tiết về người dùng.
          </p>
        </div>

        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Avatar
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {editMode ? (
                  <div className="flex flex-col gap-3">
                    {/* Preview current or new avatar */}
                    <div className="w-20 h-20">
                      <Image 
                        src={previewImage || userDetails?.avatar || "/img/avatar-default-svgrepo-com.svg"} 
                        alt="User Avatar" 
                        className="w-full h-full rounded-full object-cover"
                        width={80} 
                        height={80}  
                      />
                    </div>
                    <input 
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="border px-3 py-2 rounded-md w-full"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20">
                    <Image 
                      src={userDetails?.avatar || "/img/avatar-default-svgrepo-com.svg"} 
                      alt="User Avatar" 
                      className="w-full h-full rounded-full object-cover"
                      width={80} 
                      height={80}  
                    />
                  </div>
                )}
              </dd>
            </div>

            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Tên người dùng
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {editMode ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="border px-3 py-2 rounded-md w-full"
                      placeholder="Nhập tên người dùng mới"
                    />
                  </div>
                ) : (
                  <span>{userDetails?.username}</span>
                )}
              </dd>
            </div>

            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Email
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {userDetails?.email}
              </dd>
            </div>

            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Ngày tạo
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {userDetails?.createdAt && new Date(userDetails.createdAt).toLocaleDateString('vi-VN')}
              </dd>
            </div>

            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Ngày cập nhật
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {userDetails?.updatedAt && new Date(userDetails.updatedAt).toLocaleDateString('vi-VN')}
              </dd>
            </div>
          </dl>

          <div className="mt-4 text-center">
            {editMode ? (
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleUpdateUsernameAndAvatar}
                  disabled={isSubmitting}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition duration-200 disabled:bg-blue-400"
                >
                  {isSubmitting ? 'Đang xử lý...' : 'Cập nhật'}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={isSubmitting}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition duration-200"
                >
                  Hủy
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition duration-200"
              >
                Sửa thông tin người dùng
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
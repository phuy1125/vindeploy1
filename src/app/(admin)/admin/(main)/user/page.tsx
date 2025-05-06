'use client'

import { useState, useEffect } from 'react'
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '@/components/ui/table'
import { Button } from "@/components/ui/button" // Đảm bảo import Button đúng

// Define the User interface for the fetched user data
interface User {
  id: string; // Change the id type to string since it will be a string in the response
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminUserPage() {
  const [users, setUsers] = useState<User[]>([])  // State to store the users
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)  // Add loading state
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch('/api/users/users-all'); // Fetch all users from the API
        const data = await res.json(); // Parse the response as JSON

        console.log("API Response:", data); // Log the response for debugging

        if (!res.ok) {
          setError(data.error); // Set the error if response is not OK
        } else {
          setUsers(data); // Set users if response is valid
        }
      } catch (err) {
        setError('Failed to fetch users'); // Handle any fetch errors
        console.error(err); // Log the error for debugging
      } finally {
        setLoading(false);  // Set loading to false once the request is complete
      }
    }

    fetchUsers();  // Fetch users on component mount
  }, []);  // Empty dependency array to run only once on component mount

  // Hàm xóa người dùng
  const handleDelete = async (userId: string) => {
    try {
      const res = await fetch(`/api/users/users-all?userId=${userId}`, {  // Đường dẫn API sửa lại cho đúng
        method: 'DELETE',
      });
  
      const data = await res.json();
  
      if (res.ok) {
        // Nếu xóa thành công, cập nhật lại danh sách người dùng
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
         // Set thông báo thành công
         setSuccessMessage('User deleted successfully');

         // Ẩn thông báo sau 5 giây
         setTimeout(() => {
           setSuccessMessage(null);
         }, 5000);
      } else {
        setError(data.message || 'Failed to delete user');
      }
    } catch (error) {
      setError('Error deleting user');
      console.error('Delete user error:', error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Quản lý Người Dùng</h2>
      
      {/* Show loading message while fetching data */}
      {loading && <div className="text-blue-500 mb-4">Đang tải dữ liệu...</div>}
      
      {/* Display error if any */}
      {error && <div className="text-red-500 mb-4">{error}</div>}

      {/* Show success message if user is deleted */}
      {successMessage && (
        <div className="text-green-500 mb-4">{successMessage}</div>
      )} 
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Ngày tạo</TableHead>
            <TableHead>Ngày cập nhật</TableHead>
            <TableHead>Hành động</TableHead>  
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</TableCell>
              <TableCell>{new Date(user.updatedAt).toLocaleDateString('vi-VN')}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(user.id)} // Gọi hàm handleDelete khi nhấn Xóa
                  >
                    Xóa
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

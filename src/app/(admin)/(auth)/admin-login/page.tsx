"use client";

import { useState } from 'react';
import { useAdminAuth } from '@context/AdminAuthContext'; // Lấy context để cập nhật trạng thái đăng nhập
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function AdminLogin() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const { login } = useAdminAuth(); // Sử dụng context để xử lý login

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
  
    try {
      const res = await fetch('/api/auth/adminLogin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
  
      // Kiểm tra phản hồi của API
      const data = await res.json();
      console.log(data);  // Xem phản hồi trả về từ API
  
      if (!res.ok) {
        setError(data.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
      } else {
        setSuccess('Đăng nhập thành công!');
        if (data.token) {
          login(data.token); // Lưu token vào context
          router.push('/dashboard');  // Chuyển hướng đến trang dashboard sau khi đăng nhập thành công
        }
      }
    } catch (err) {
      setError('Đã xảy ra lỗi bất ngờ.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="py-6 px-4">
        <div className="grid md:grid-cols-2 items-center gap-15 max-w-6xl w-full">
          <div className="border border-slate-300 rounded-lg p-6 max-w-md shadow-[0_2px_22px_-4px_rgba(93,96,127,0.2)] max-md:mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="mb-8">
                <h3 className="text-slate-900 text-center text-3xl font-semibold">Đăng nhập Admin</h3>
                <p className="text-slate-500 text-sm mt-6 leading-relaxed">
                  Đăng nhập vào tài khoản quản trị viên của bạn để quản lý hệ thống.
                </p>
              </div>

              {/* Thông báo lỗi */}
              {error && <div className="text-red-500 text-center mb-2">{error}</div>}

              {/* Thông báo thành công */}
              {success && <div className="text-green-600 text-center mb-2">{success}</div>}

              <div>
                <label className="text-slate-800 text-sm font-medium mb-2 block">Email</label>
                <div className="relative flex items-center">
                  <input
                    name="email"
                    type="email"
                    required
                    className="w-full text-sm text-slate-800 border border-slate-300 pl-4 pr-10 py-3 rounded-lg outline-blue-600"
                    placeholder="Nhập email của bạn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-800 text-sm font-medium mb-2 block">Mật khẩu</label>
                <div className="relative flex items-center">
                  <input
                    name="password"
                    type="password"
                    required
                    className="w-full text-sm text-slate-800 border border-slate-300 pl-4 pr-10 py-3 rounded-lg outline-blue-600"
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 shrink-0 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-3 block text-sm text-slate-500">
                    Ghi nhớ tài khoản
                  </label>
                </div>
              </div>

              <div className="!mt-12">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full shadow-xl py-2.5 px-4 text-[15px] font-medium tracking-wide rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                >
                  {loading ? "Đang xử lý..." : "Đăng nhập"}
                </button>
              </div>
            </form>
          </div>

          <div className="max-md:mt-8">
            <Image
              src="/img/bandovn.jpg"
              alt="Đảo Nam Du, Đồng Bằng Sông Cửu Long, Việt Nam"
              layout="intrinsic"
              width={800}
              height={560}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
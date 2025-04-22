'use client';

import { useState } from 'react';
import { useAuth } from '@context/AuthContext'; // Import context
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function Login() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const { login } = useAuth(); // ✅ Lấy login từ context

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data: { message?: string; token?: string; userId?: string } = await res.json();

      if (!res.ok) {
        setError(data.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
      } else {
        if (data.token) {
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('userId', data.userId || '');

          login(data.token); // ✅ Cập nhật trạng thái vào context

          router.push('/'); // ✅ Điều hướng sau khi context đã có thông tin
        } else {
          setError('Token không hợp lệ.');
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
              <div className="mb-8 ">
                <h3 className="text-slate-900 text-center text-3xl font-semibold">Đăng nhập</h3>
                <p className="text-slate-500 text-sm mt-6 leading-relaxed">
                  Đăng nhập vào tài khoản của bạn và khám phá thế giới đầy cơ hội. Hành trình của bạn bắt đầu tại đây.
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

                <div className="text-sm">
                  <Link href="/forgot-password" className="text-blue-600 hover:underline font-medium">
                    Quên mật khẩu?
                  </Link>
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

                <p className="text-sm !mt-6 text-center text-slate-500">
                  Chưa có tài khoản?{" "}
                  <Link href="/register" className="text-blue-600 font-medium hover:underline ml-1 whitespace-nowrap">
                    Đăng ký tại đây
                  </Link>
                </p>
              </div>
            </form>
          </div>

          <div className="max-md:mt-8">
          <Image
            src="/img/bandovn.jpg"
            // className="w-full aspect-[71/50] max-md:w-4/5 mx-auto block object-cover"
            alt="Đảo Nam Du, Đồng Bằng Sông Cửu Long, Việt Nam"
            layout="intrinsic"
            width={800} // Thay đổi giá trị này tùy theo kích thước ảnh mong muốn
            height={560} // Thay đổi giá trị này tùy theo kích thước ảnh mong muốn
        />
          </div>
        </div>
      </div>
    </div>
  );
}

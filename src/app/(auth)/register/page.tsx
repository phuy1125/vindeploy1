"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Register() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [isChecked, setIsChecked] = useState<boolean>(false); // Thêm state theo dõi checkbox
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);  // Reset lỗi trước khi gửi yêu cầu
    setLoading(true); // Bắt đầu quá trình xử lý
  
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, confirmPassword }),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        // Xử lý các lỗi từ server, có thể là lỗi 400, 409, 500
        setError(data.message || "Something went wrong");
      } else {
        setSuccess(true); // Đăng ký thành công
        console.log("User registered successfully:", data);
        router.push('/login')
      }
    } catch (err) {
      console.error("Error:", err);
      // Xử lý lỗi nếu có vấn đề với yêu cầu API
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false); // Đặt lại trạng thái loading sau khi hoàn thành
    }
  };  

  return (
    <div className="flex flex-col justify-center sm:h-screen p-4">
      <div className="max-w-md w-full mx-auto border-4 border-slate-300 rounded-2xl p-8">
        <div className="text-center mb-8">
            <Image
              src="/img/Logo_merus.png" // Thay đổi đường dẫn tới ảnh trong thư mục public
              alt="Logo"
              width={160} // Adjust width as per your design
              height={40} // Adjust height as per your design
              className="w-40 inline-block"
            />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {error && (
                <div className="text-red-500 text-center mb-4">{error}</div>
            )}
            {success && (
                <div className="text-green-600 text-center mb-4">Đăng ký thành công!</div>
            )}      

            <div>
              <label className="text-slate-800 text-sm font-medium mb-2 block">Email</label>
              <input
                name="email"
                type="email"
                className="text-slate-800 bg-white border border-slate-300 w-full text-sm px-4 py-3 rounded-md outline-blue-500"
                placeholder="Nhập email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-slate-800 text-sm font-medium mb-2 block">Mật khẩu</label>
              <input
                name="password"
                type="password"
                className="text-slate-800 bg-white border border-slate-300 w-full text-sm px-4 py-3 rounded-md outline-blue-500"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-slate-800 text-sm font-medium mb-2 block">Xác nhận mật khẩu</label>
              <input
                name="cpassword"
                type="password"
                className="text-slate-800 bg-white border border-slate-300 w-full text-sm px-4 py-3 rounded-md outline-blue-500"
                placeholder="Nhập lại mật khẩu"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            

            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 shrink-0 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)} // Cập nhật trạng thái của checkbox
              />
              <label htmlFor="remember-me" className="text-slate-800 ml-3 block text-sm">
                Tôi đồng ý với <a href="javascript:void(0);" className="text-blue-600 font-medium hover:underline ml-1">Điều khoản và Điều kiện</a>
              </label>
            </div>
          </div>

          <div className="mt-12">
            <button
              type="submit"
              disabled={loading || !isChecked} // Disable nút submit nếu checkbox chưa được tick
              className="w-full py-3 px-4 text-sm tracking-wider font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
            >
              {loading ? "Đang xử lý..." : "Tạo tài khoản"}
            </button>
          </div>

          <p className="text-slate-800 text-sm mt-6 text-center">
            Đã có tài khoản? <Link href="/login" className="text-blue-600 font-medium hover:underline ml-1">Đăng nhập tại đây</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

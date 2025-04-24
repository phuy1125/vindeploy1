import type { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";

type ResponseData = {
  message: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Chỉ chấp nhận yêu cầu POST" });
  }

  // Tạo cookie hết hạn để xóa cookie auth_token
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge: 0, // Đặt maxAge = 0 để xóa cookie
    path: "/",
  };

  // Serialize cookie với maxAge = 0
  const tokenCookie = serialize("auth_token", "", cookieOptions);

  // Đặt cookie trong response header
  res.setHeader("Set-Cookie", tokenCookie);

  return res.status(200).json({ message: "Đăng xuất thành công" });
}
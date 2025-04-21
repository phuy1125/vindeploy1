import { NextApiRequest, NextApiResponse } from "next";
import connectDb from "@lib/mongoose";  // Sử dụng alias @lib
import User from "@models/user";  // Sử dụng alias @models
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

type SuccessResponse = {
  message: string;
  token: string;
};

type ErrorResponse = {
  message: string;
  error?: unknown;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponse | ErrorResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Chỉ chấp nhận yêu cầu POST" });
  }

  const { email, password } = req.body as {
    email: string;
    password: string;
  };

  try {
    await connectDb();  // Kết nối với database

    const user = await User.findOne({ email });  // Tìm người dùng trong DB

    if (!user) {
      return res.status(400).json({ message: "Thông tin đăng nhập không hợp lệ" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);  // Kiểm tra mật khẩu

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Thông tin đăng nhập không hợp lệ" });
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("JWT_SECRET không được định nghĩa trong biến môi trường");
    }

    const token = jwt.sign({ userId: user._id }, secret, { expiresIn: "1h" });  // Tạo JWT token

    return res.status(200).json({ message: "Đăng nhập thành công", token });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Lỗi đăng nhập:", error.message);
      return res.status(500).json({ message: "Có lỗi xảy ra", error: error.message });
    }

    console.error("Lỗi không xác định:", error);
    return res.status(500).json({ message: "Có lỗi xảy ra", error });
  }
}

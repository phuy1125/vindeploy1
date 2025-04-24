import type { NextApiRequest, NextApiResponse } from 'next';
import connectDb from "@lib/mongoose";
import Admin, { IAdmin } from '@models/admin';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { serialize } from 'cookie'; // 🧁 Thêm dòng này để xử lý cookie

type SuccessResponse = {
  message: string;
  adminId: string;
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
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Chỉ chấp nhận yêu cầu POST' });
  }

  const { email, password } = req.body as {
    email: string;
    password: string;
  };

  try {
    await connectDb();

    const admin: IAdmin | null = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: 'Tài khoản không tồn tại' });
    }

    if (password !== admin.password) {
      return res.status(400).json({ message: 'Mật khẩu không đúng' });
    }

    const adminId = (admin._id as ObjectId).toString();

    const token = jwt.sign(
      { adminId, role: admin.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );

    // 🍪 Set cookie admin_auth_token
    const cookie = serialize("admin_auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/admin", // Có thể đổi thành "/admin" nếu chỉ muốn cookie dùng cho admin route
      maxAge: 60 * 60, // 1h
    });

    res.setHeader("Set-Cookie", cookie);

    return res.status(200).json({
      message: 'Đăng nhập thành công',
      adminId,
      token,
    });

  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    return res.status(500).json({ message: 'Có lỗi xảy ra', error });
  }
}

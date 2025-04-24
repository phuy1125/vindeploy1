import type { NextApiRequest, NextApiResponse } from 'next';
import connectDb from "@lib/mongoose";
import Admin, { IAdmin } from '@models/admin';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

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

    // So sánh mật khẩu trực tiếp (bạn có thể mã hóa mật khẩu trong cơ sở dữ liệu)
    if (password !== admin.password) {
      return res.status(400).json({ message: 'Mật khẩu không đúng' });
    }

    const adminId = (admin._id as ObjectId).toString();
    // Tạo token JWT
    const token = jwt.sign(
      { adminId, role: admin.role }, // payload
      process.env.JWT_SECRET as string, // Sử dụng khóa bí mật từ .env
      { expiresIn: '1h' } // Token hết hạn sau 1 giờ
    );

    // Đăng nhập thành công và trả về token
    return res.status(200).json({
      message: 'Đăng nhập thành công',
      adminId,
      token,  // Trả về token JWT
    });
  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    return res.status(500).json({ message: 'Có lỗi xảy ra', error });
  }
}

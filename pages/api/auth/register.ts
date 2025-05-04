import type { NextApiRequest, NextApiResponse } from "next";
import connectDb from "../../../src/lib/mongoose";
import User from "../../../src/models/user";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import crypto from "crypto";

type SuccessResponse = {
  message: string;
  userId: string;
};

type ErrorResponse = {
  message: string;
  error?: unknown;
};

// Cấu hình Nodemailer
const transporter = nodemailer.createTransport({
  service: "Gmail", // Hoặc bạn có thể sử dụng dịch vụ SMTP khác
  auth: {
    user: process.env.EMAIL_USER, // Đặt email của bạn ở đây
    pass: process.env.EMAIL_PASS, // Đặt mật khẩu hoặc app password
  },
});

const sendVerificationEmail = async (email: string, token: string) => {
  const baseUrl = process.env.BASE_URL || "http://localhost:3000"; // fallback nếu không có BASE_URL
  const verificationLink = `${baseUrl}/api/auth/verify-email?token=${token}`;

  // Email HTML với CSS Inline
  const htmlContent = `
    <html>
      <body>
        <h2 style="font-size: 24px; color: #333333;">Chào mừng bạn đến với VintelliTour!</h2>
        <p style="font-size: 16px; color: #555555;">Vui lòng nhấn vào nút dưới đây để xác thực tài khoản của bạn:</p>
        <a href="${verificationLink}" 
           style="background-color: blue; color: white; padding: 14px 20px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; border-radius: 5px; margin-top: 10px;">
           Xác thực tài khoản
        </a>
        <p style="font-size: 14px; color: #555555; margin-top: 20px;">
          Hoặc bạn có thể sao chép và dán đường link này vào trình duyệt của bạn: <br>
          <a href="${verificationLink}" style="color: #007bff;">${verificationLink}</a>
        </p>
      </body>
    </html>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Xác thực tài khoản của bạn",
    text: `Nhấn vào liên kết để xác thực tài khoản của bạn: ${verificationLink}`,
    html: htmlContent, // Include the HTML content here
  };

  await transporter.sendMail(mailOptions);
};


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponse | ErrorResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Chỉ chấp nhận yêu cầu POST" });
  }

  const { username, email, password, confirmPassword } = req.body as {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  };

  // Kiểm tra nếu tên người dùng trống
  if (!username || username.trim() === "") {
    return res
      .status(400)
      .json({ message: "Tên người dùng không được để trống" });
  }

  // Kiểm tra nếu mật khẩu không khớp
  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Mật khẩu không khớp" });
  }

  try {
    // Kết nối với cơ sở dữ liệu
    await connectDb();

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email này đã được đăng ký, vui lòng chọn email khác" });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo mã xác thực (token)
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Tạo người dùng mới
    const newUser = await new User({
      username,
      email,
      password: hashedPassword,
      isVerified: false,  // Người dùng mới chưa xác thực
      verificationToken,  // Gắn mã xác thực
    }).save();

    // Gửi email xác thực
    await sendVerificationEmail(newUser.email, verificationToken);

    // Trả về thông báo thành công và ID người dùng mới
    return res.status(201).json({
      message: "Đăng ký thành công, vui lòng kiểm tra email để xác thực tài khoản",
      userId: newUser._id.toString(),
    });
  } catch (error) {
    // Log lỗi và trả về lỗi 500
    console.error("Lỗi đăng ký:", error);
    return res.status(500).json({ message: "Có lỗi xảy ra", error });
  }
}

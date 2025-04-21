import type { NextApiRequest, NextApiResponse } from "next";
import connectDb from "../../../src/lib/mongoose";
import User from "../../../src/models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
type SuccessResponse = {
  message: string;
  token: string;
  userId: string; 
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
    return res.status(405).json({ message: "Only POST requests are allowed" });
  }

  const { email, password } = req.body as {
    email: string;
    password: string;
  };

  try {
    await connectDb();

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }
     // Ép kiểu user._id thành string (dùng toString())
    const userId = (user._id as ObjectId).toString();
    const token = jwt.sign({ userId }, secret, { expiresIn: "1h" });

    return res.status(200).json({ message: "Login successful", token, userId });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Login error:", error.message);
      return res.status(500).json({ message: "Something went wrong", error: error.message });
    }
  
    console.error("Unknown error:", error);
    return res.status(500).json({ message: "Something went wrong", error });
  }
}

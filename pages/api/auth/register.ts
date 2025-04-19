import type { NextApiRequest, NextApiResponse } from 'next';
import connectDb from '../../../src/lib/mongoose';
import User from '../../../src/models/user';
import bcrypt from 'bcryptjs';

type SuccessResponse = {
  message: string;
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
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests are allowed' });
  }

  const { email, password, confirmPassword } = req.body as {
    email: string;
    password: string;
    confirmPassword: string;
  };

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  try {
    await connectDb();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Dùng save để đảm bảo newUser có kiểu đầy đủ (_id, v.v.)
    const newUser = (await new User({
        email,
        password: hashedPassword,
      }).save()) as typeof User.prototype;
      
      return res.status(201).json({
        message: 'User registered successfully',
        userId: newUser._id.toString(),
      });
      
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Something went wrong', error });
  }
}

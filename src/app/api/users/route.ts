import type { NextApiRequest, NextApiResponse } from "next";
import User from "@/models/user";
import mongoose from "mongoose";

const connectToDatabase = async () => {
  if (mongoose.connections[0].readyState) return;

  await mongoose.connect(process.env.MONGODB_URI || "your-mongo-db-uri");
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const { email } = req.query as { email: string };
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    try {
      await connectToDatabase();
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      return res
        .status(200)
        .json({ id: user._id, name: user.username, email: user.email });
    } catch (error) {
      console.error("Error fetching user:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}

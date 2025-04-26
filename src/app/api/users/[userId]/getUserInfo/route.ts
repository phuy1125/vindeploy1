import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import User from "@/models/user";

const connectToDatabase = async () => {
  if (mongoose.connections[0].readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI!);
  }
};

export async function GET(
  req: NextRequest,
  context: { params: { userId: string } }
) {
  const { userId } = await context.params;

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    await connectToDatabase();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      userID: user._id.toString(),
      name: user.username,
      email: user.email,
    });
  } catch (error) {
    console.error("Error fetching user info:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

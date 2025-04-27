// src/app/api/admin/post-status/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@lib/mongodb"; // Giả sử bạn dùng mongodb lib connect

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();

    const usersCollection = db.collection("users");
    const postsCollection = db.collection("posts");

    // 1. Lấy tất cả các author_id duy nhất từ posts
    const uniqueAuthors = await postsCollection.distinct("author_id");

    // 2. Đếm tổng số users
    const totalUsers = await usersCollection.countDocuments();

    // 3. Tính số lượng
    const usersWithPosts = uniqueAuthors.length;
    const usersWithoutPosts = totalUsers - usersWithPosts;

    return NextResponse.json({
      usersWithPosts,
      usersWithoutPosts,
    });
  } catch (error: any) {
    console.error("Error in /api/admin/post-status:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import error from "next/error";
import { NextRequest, NextResponse } from "next/server";

// Xử lý yêu cầu POST để tạo thread mới
export async function POST(
  req: NextRequest,
  context: { params: { userId: string } }
) {
  const { userId } = await context.params; // Lấy userId từ URL

  console.log("Received POST request");
  console.log("User ID from URL:", userId); // Log userId từ URL

  try {
    // Lấy dữ liệu từ body của yêu cầu POST
    const threadData = await req.json();
    console.log("Received thread data:", threadData); // Log dữ liệu thread từ body

    // Kiểm tra nếu không có dữ liệu hợp lệ
    if (!threadData) {
      return NextResponse.json(
        { error: "No valid thread data received" },
        { status: 400 }
      );
    }

    // Thêm userId vào metadata
    const metadata = {
      user_id: userId, // Lấy userId từ URL và thêm vào metadata
    };

    // Log metadata sau khi thêm userId
    console.log("Metadata with userId:", metadata);

    // Thực hiện gọi LangGraph API để tạo thread mới
    const response = await fetch("http://localhost:2024/threads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        metadata, // Gửi metadata với userId
      }),
    });

    const data = await response.json();

    // Kiểm tra nếu LangGraph trả về lỗi
    if (!response.ok) {
      throw new Error("Error creating thread in LangGraph");
    }

    // Trả về phản hồi thành công với thread_id và metadata
    return NextResponse.json({
      message: "Thread created successfully",
      thread: {
        thread_id: data.thread_id, // LangGraph tự động tạo thread_id
        metadata,
      },
    });
  } catch (error) {
    console.error("Error processing POST request:", (error as Error).message); // Log lỗi nếu có
    return NextResponse.json(
      { message: (error as Error).message || "Error processing request" },
      { status: 500 }
    );
  }
}

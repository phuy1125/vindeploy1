import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Lấy dữ liệu từ body của yêu cầu POST
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // Log userId để kiểm tra
    console.log("Received userId:", userId);

    // Cấu hình dữ liệu tìm kiếm
    const searchData = {
      metadata: { user_id: userId },
      values: {},
      status: "idle",
      limit: 1000,
      offset: 0,
    };

    // Gọi API LangGraph
    const langGraphApiUrl = "http://localhost:2024/threads/search";
    const response = await fetch(langGraphApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(searchData),
    });

    if (!response.ok) {
      throw new Error("Error calling LangGraph API");
    }

    const data = await response.json();
    return NextResponse.json(data); // Trả về kết quả
  } catch (err) {
    console.error("❌ Error in /api/threads/search:", err);
    return NextResponse.json(
      { error: "Server error when processing thread search" },
      { status: 500 }
    );
  }
}

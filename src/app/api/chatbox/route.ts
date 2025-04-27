import { NextResponse } from "next/server";

// Lấy assistant_id từ biến môi trường .env
const assistantId = process.env.ASSISTANT_ID;

export async function POST(req: Request) {
  try {
    // Lấy dữ liệu từ body của yêu cầu
    const body = await req.json();
    const { messages, threadId } = body;

    // Kiểm tra nếu thiếu dữ liệu (messages hoặc threadId)
    if (!messages || !threadId) {
      console.error("❌ Missing data", { messages, threadId });
      return NextResponse.json(
        { error: "Missing messages or threadId" },
        { status: 400 }
      );
    }

    // Kiểm tra nếu không có assistantId từ .env
    if (!assistantId) {
      return NextResponse.json(
        { error: "Missing assistant_id in environment variables" },
        { status: 500 }
      );
    }

    // Gọi API LangGraph Thread Runs tại endpoint /runs/wait
    const langGraphApiUrl = `http://localhost:2024/threads/${threadId}/runs/wait`;

    // Gửi yêu cầu POST tới LangGraph
    const response = await fetch(langGraphApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        assistant_id: "agent", // Truyền assistant_id từ .env
        input: { messages: messages }, // Truyền messages từ client
      }),
    });

    // Kiểm tra nếu có lỗi khi gọi LangGraph
    if (!response.ok) {
      throw new Error("Error calling LangGraph API");
    }

    // Lấy kết quả từ LangGraph
    const data = await response.json();

    // Trả về dữ liệu từ LangGraph cho client
    return NextResponse.json({ messages: data.messages });
  } catch (err) {
    // Bắt lỗi nếu có và trả về thông báo lỗi
    console.error("❌ Error in /api/chatbox:", err);
    return NextResponse.json(
      { error: "Server error when processing chat" },
      { status: 500 }
    );
  }
}

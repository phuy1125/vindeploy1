import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: { threadId: string } }
) {
  const { threadId } = await context.params;

  if (!threadId) {
    return new Response(JSON.stringify({ error: "Missing threadId" }), {
      status: 400,
    });
  }

  try {
    const response = await fetch(
      `http://localhost:2024/threads/${threadId}/state`
    );
    if (!response.ok) {
      return new Response(JSON.stringify({ error: "LangGraph API failed" }), {
        status: 500,
      });
    }

    const data = await response.json();
    return new Response(
      JSON.stringify({ messages: data.values?.messages || [] }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error fetching thread state:", error);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}

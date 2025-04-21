// components/chat-interface.tsx
"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Mic, Menu } from "lucide-react";
import ReactMarkdown from "react-markdown";

type Message = {
  role: string;
  content: string;
};

export default function ChatInterface() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    []
  );
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsSending(true);

    try {
      const formattedMessages = updatedMessages
        .map((msg) => {
          if (msg.role === "user") {
            return {
              lc: 1,
              type: "constructor",
              id: ["langchain_core", "messages", "HumanMessage"],
              kwargs: { content: msg.content },
            };
          } else if (msg.role === "ai") {
            return {
              lc: 1,
              type: "constructor",
              id: ["langchain_core", "messages", "AIMessage"],
              kwargs: { content: msg.content },
            };
          }
          return null;
        })
        .filter(Boolean);

      const res = await fetch("/api/chatbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: formattedMessages,
          userQuery: input,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("API response error:", errorData);
        throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();

      if (data.messages && data.messages.length > 0) {
        const aiMessages = data.messages.filter(
          (msg: any) => msg.type === "constructor" && msg.id[2] === "AIMessage"
        );

        if (aiMessages.length > 0) {
          const latestAiMessage = aiMessages[aiMessages.length - 1];
          const aiContent = latestAiMessage.kwargs.content;
          setMessages((prev) => [...prev, { role: "ai", content: aiContent }]);
        } else {
          setMessages((prev) => [
            ...prev,
            { role: "ai", content: "Không có phản hồi từ AI." },
          ]);
        }
      } else {
        throw new Error("No messages received from API.");
      }
    } catch (error) {
      console.error("Error during request:", error);
      const errorMsg = {
        role: "ai",
        content: "Xin lỗi, đã xảy ra lỗi khi xử lý yêu cầu của bạn.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "40px";
      textAreaRef.current.style.height = `${Math.min(
        textAreaRef.current.scrollHeight,
        100
      )}px`;
    }
  }, [input]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-[98%] bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      {/* Header - Updated with teal theme */}
      <div className="p-4 bg-gradient-to-r from-teal-600 to-teal-500 flex items-center rounded-t-xl">
        <div className="lg:hidden mr-2">
          <button className="w-8 h-8 flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-full text-white">
            <Menu size={16} />
          </button>
        </div>
        <div className="w-10 h-10 bg-teal-400 rounded-full flex items-center justify-center text-white shadow-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
          </svg>
        </div>
        <div className="ml-4">
          <h2 className="text-xl font-serif tracking-wide text-white font-bold">
            Khám phá Việt Nam
          </h2>
          <p className="text-xs text-teal-50 font-sans">
            Hỏi đáp cùng trợ lý du lịch của bạn
          </p>
        </div>
        <div className="ml-auto">
          <div className="w-3 h-3 bg-emerald-400 rounded-full shadow-sm animate-pulse"></div>
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 bg-gray-50"
        style={{
          height: "calc(100vh - 240px)",
          maxHeight: "500px",
        }}
      >
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6 shadow-inner">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-40"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                  <line x1="9" y1="9" x2="9.01" y2="9"></line>
                  <line x1="15" y1="9" x2="15.01" y2="9"></line>
                </svg>
              </div>
              <p className="text-center max-w-xs font-medium text-gray-500">
                Chào mừng bạn đến với VintelliTour. Hãy đặt câu hỏi về du lịch
                Việt Nam!
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role !== "user" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full mr-2 overflow-hidden bg-gradient-to-br from-teal-600 to-teal-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    AI
                  </div>
                )}
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-md"
                      : "bg-white text-gray-800 shadow-sm border border-gray-100"
                  }`}
                >
                  <div className="prose prose-sm max-w-none text-sm">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
                {msg.role === "user" && (
                  <div className="flex-shrink-0 w-8 h-8 bg-teal-400 rounded-full flex items-center justify-center text-white ml-2 shadow-md">
                    <span className="text-xs font-bold">YOU</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Suggestion Chips */}
      <div
        className="px-4 py-3 bg-white border-t border-gray-100 flex gap-2 overflow-x-auto"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        <button className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm rounded-full whitespace-nowrap transition-colors border border-gray-200 shadow-sm">
          Địa điểm nổi tiếng
        </button>
        <button className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm rounded-full whitespace-nowrap transition-colors border border-gray-200 shadow-sm">
          Du lịch tiết kiệm
        </button>
        <button className="px-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-700 text-sm rounded-full whitespace-nowrap transition-colors border border-teal-200 shadow-sm">
          Hỏi gì bây giờ?
        </button>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex items-center bg-gray-50 rounded-full p-1 shadow-sm border border-gray-200">
          <button className="p-2 text-gray-400 hover:text-teal-500 rounded-full">
            <Paperclip size={18} />
          </button>
          <textarea
            ref={textAreaRef}
            className="flex-1 px-3 py-2 bg-transparent border-none resize-none text-gray-700 focus:outline-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Bạn muốn đi đâu hôm nay?"
            rows={1}
            disabled={isSending}
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          />
          <style jsx>{`
            textarea::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          <button className="p-2 text-gray-400 hover:text-teal-500 rounded-full mr-1">
            <Mic size={18} />
          </button>
          <button
            onClick={handleSend}
            disabled={isSending || !input.trim()}
            className={`p-2.5 rounded-full ${
              input.trim() && !isSending
                ? "bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-md"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isSending ? (
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>
        <div className="text-xs text-gray-400 mt-1 text-center">
          Nhấn Enter để gửi • Shift + Enter để xuống dòng
        </div>
      </div>
    </div>
  );
}

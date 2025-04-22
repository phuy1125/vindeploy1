// components/sidebar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Search,
  Bookmark,
  Bell,
  Lightbulb,
  PenSquare,
  Plus,
  ChevronRight,
  Map,
  Settings,
} from "lucide-react";

export default function Sidebar() {
  const [activeItem, setActiveItem] = useState("chats");

  const navItems = [
    { id: "chats", label: "Trò chuyện", icon: MessageSquare, count: 4 },
    { id: "explore", label: "Khám phá", icon: Search },
    { id: "saved", label: "Đã lưu", icon: Bookmark },
    { id: "maps", label: "Bản đồ", icon: Map },
    { id: "inspiration", label: "Cảm hứng", icon: Lightbulb },
    { id: "create", label: "Tạo lịch trình", icon: PenSquare },
  ];

  return (
    <div className="w-full h-[98%] flex flex-col bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Logo - Updated to match website theme */}

      {/* Navigation Menu */}
      <nav className="flex-1 py-4 px-3">
        <div className="mb-4 px-3">
          <h3 className="text-xs uppercase tracking-wider text-gray-500 font-medium">
            Menu chính
          </h3>
        </div>
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActiveItem(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all duration-200 ${
                  activeItem === item.id
                    ? "bg-gradient-to-r from-teal-600 to-teal-500 text-white font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <div
                  className={`${
                    activeItem === item.id ? "text-teal-100" : "text-gray-400"
                  }`}
                >
                  <item.icon
                    size={18}
                    strokeWidth={activeItem === item.id ? 2.5 : 2}
                  />
                </div>
                <span>{item.label}</span>
                {item.count && (
                  <span className="ml-auto text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium">
                    {item.count}
                  </span>
                )}
                {activeItem === item.id && (
                  <ChevronRight size={16} className="ml-auto text-teal-100" />
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* New Chat Button */}
      <div className="px-4 pb-4">
        <button className="w-full bg-gradient-to-r from-teal-600 to-teal-500 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all hover:shadow-md hover:from-teal-700 hover:to-teal-600">
          <Plus size={16} />
          <span>Cuộc trò chuyện mới</span>
        </button>
      </div>

      {/* User Info Section */}
      <div className="p-4 border-t border-gray-100 mb-0">
        <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-all">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-500 rounded-full flex items-center justify-center text-sm font-medium text-white shadow-md">
            NM
          </div>
          <div className="text-sm">
            <div className="font-medium text-gray-800">Ngọc Minh Lộc</div>
            <div className="text-gray-400 text-xs">@locminh_2809</div>
          </div>
          <div className="ml-auto flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 8.5C8.27614 8.5 8.5 8.27614 8.5 8C8.5 7.72386 8.27614 7.5 8 7.5C7.72386 7.5 7.5 7.72386 7.5 8C7.5 8.27614 7.72386 8.5 8 8.5Z"
                fill="#9CA3AF"
                stroke="#9CA3AF"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 4.5C8.27614 4.5 8.5 4.27614 8.5 4C8.5 3.72386 8.27614 3.5 8 3.5C7.72386 3.5 7.5 3.72386 7.5 4C7.5 4.27614 7.72386 4.5 8 4.5Z"
                fill="#9CA3AF"
                stroke="#9CA3AF"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 12.5C8.27614 12.5 8.5 12.2761 8.5 12C8.5 11.7239 8.27614 11.5 8 11.5C7.72386 11.5 7.5 11.7239 7.5 12C7.5 12.2761 7.72386 12.5 8 12.5Z"
                fill="#9CA3AF"
                stroke="#9CA3AF"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

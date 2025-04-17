"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface Post {
  _id: string;
  title: string;
  content: string;
  timestamp: string;
  author_name: string;
  media: { media_url: string; media_type: string }[];
  tags: string[];
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch("/api/posts");
        const data = await res.json();
        setPosts(data);
      } catch (error) {
        console.error("Lỗi khi fetch posts:", error);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center py-10">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-7xl w-full">
        <h1 className="text-center text-2xl font-semibold mb-6">Danh sách bài viết</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div key={post._id} className="bg-white p-6 rounded-lg shadow-lg">
              {/* Post content */}
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-800">{post.title}</h2>
                <p className="text-gray-500 text-sm mb-1">
                  Đăng lúc: {new Date(post.timestamp).toLocaleString()}
                </p>
                <p className="text-gray-500 text-sm mb-1">
                  Người đăng: {post.author_name || "Không rõ"}
                </p>
                <p className="text-gray-700">{post.content}</p>
              </div>

              {/* Multiple Images */}
              {post.media.length > 0 && (
                <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {post.media.map((m, idx) => (
                    <Image
                      key={idx}
                      src={m.media_url}
                      alt={`Hình ảnh bài viết ${idx + 1}`}
                      width={500}
                      height={500}
                      className="w-full h-48 object-cover rounded-md"
                    />
                  ))}
                </div>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, index) => (
                  <span key={index} className="text-blue-600 text-sm">#{tag}</span>
                ))}
              </div>

              {/* Like and Comment Section */}
              <div className="flex items-center justify-between text-gray-500 mt-4">
                <div className="flex items-center space-x-2">
                  <button className="flex justify-center items-center gap-2 px-2 hover:bg-gray-50 rounded-full p-1">
                    <svg
                      className="w-5 h-5 fill-current"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 21.35l-1.45-1.32C6.11 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-4.11 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                    <span>42 Likes</span>
                  </button>
                </div>
                <button className="flex justify-center items-center gap-2 px-2 hover:bg-gray-50 rounded-full p-1">
                  <svg
                    width="22px"
                    height="22px"
                    viewBox="0 0 24 24"
                    className="w-5 h-5 fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.04346 16.4525C3.22094 16.8088 3.28001 17.2161 3.17712 17.6006L2.58151 19.8267C2.32295 20.793 3.20701 21.677 4.17335 21.4185L6.39939 20.8229C6.78393 20.72 7.19121 20.7791 7.54753 20.9565C8.88837 21.6244 10.4003 22 12 22ZM8 13.25C7.58579 13.25 7.25 13.5858 7.25 14C7.25 14.4142 7.58579 14.75 8 14.75H13.5C13.9142 14.75 14.25 14.4142 14.25 14C14.25 13.5858 13.9142 13.25 13.5 13.25H8ZM7.25 10.5C7.25 10.0858 7.58579 9.75 8 9.75H16C16.4142 9.75 16.75 10.0858 16.75 10.5C16.75 10.9142 16.4142 11.25 16 11.25H8C7.58579 11.25 7.25 10.9142 7.25 10.5Z"
                    ></path>
                  </svg>
                  <span>3 Comments</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


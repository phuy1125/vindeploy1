"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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

export default function LocationPostsPage() {
	const params = useParams<{ id: string }>();
const id = params?.id;

  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchPostsByLocation = async () => {
      try {
        const res = await fetch(`/api/posts?location_id=${id}`);
        const data = await res.json();
        setPosts(data);
      } catch (error) {
        console.error("Lỗi khi fetch posts theo địa điểm:", error);
      }
    };

    if (id) {
      fetchPostsByLocation();
    }
  }, [id]);

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center py-10">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-7xl w-full">
        <h1 className="text-center text-2xl font-semibold mb-6">Bài viết theo địa điểm</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.length > 0 ? (
            posts.map((post) => (
              <div key={post._id} className="bg-white p-6 rounded-lg shadow-lg">
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

                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <span key={index} className="text-blue-600 text-sm">#{tag}</span>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center col-span-full text-gray-600">Không có bài viết nào tại địa điểm này.</p>
          )}
        </div>
      </div>
    </div>
  );
}

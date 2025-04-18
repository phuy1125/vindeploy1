"use client";

import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import jwt from "jsonwebtoken"; // Cần cài thư viện jsonwebtoken

export default function CreatePost() {
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [tags, setTags] = useState<string>("");
  const [images, setImages] = useState<File[]>([]); // Sử dụng mảng để lưu nhiều ảnh
  const [user, setUser] = useState<{ userId: string | null, userName: string | null }>({
    userId: null,
    userName: null,
  });

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const decodedToken = jwt.decode(token) as { userId: string, userName: string };
        setUser({
          userId: decodedToken.userId,
          userName: decodedToken.userName,
        });
      } catch (error) {
        console.error("Lỗi giải mã token:", error);
      }
    }
  }, []);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setImages(Array.from(files)); // Lưu các file ảnh vào state
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!user.userId) {
      alert("Bạn cần đăng nhập để tạo bài viết!");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("author_id", user.userId);
    formData.append("tags", tags.split(",").map((tag) => tag.trim()).join(","));
    images.forEach((image) => formData.append("image", image)); // Gửi tất cả ảnh

    const res = await fetch("/api/posts", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      console.log("Bài viết đã được đăng:", data);
    } else {
      console.error("Lỗi khi đăng bài viết");
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>Tạo Bài Viết Mới</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input
          type="text"
          placeholder="Tiêu đề"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            padding: '10px',
            fontSize: '16px',
            border: '1px solid #ccc',
            borderRadius: '5px',
          }}
        />
        <textarea
          placeholder="Nội dung"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
          style={{
            padding: '10px',
            fontSize: '16px',
            border: '1px solid #ccc',
            borderRadius: '5px',
          }}
        />
        <input
          type="text"
          placeholder="Tags (cách nhau bởi dấu phẩy)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          style={{
            padding: '10px',
            fontSize: '16px',
            border: '1px solid #ccc',
            borderRadius: '5px',
          }}
        />
        <input
          type="file"
          accept="image/*"
          multiple // Cho phép chọn nhiều ảnh
          onChange={handleImageChange}
          style={{
            padding: '10px',
            fontSize: '16px',
            border: '1px solid #ccc',
            borderRadius: '5px',
            backgroundColor: '#f9f9f9',
          }}
        />
        <button
          type="submit"
          style={{
            padding: '12px',
            backgroundColor: '#0070f3',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            fontSize: '16px',
            cursor: 'pointer',
          }}
        >
          Đăng bài
        </button>
      </form>
    </div>
  );
}

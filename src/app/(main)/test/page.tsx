// src\app\(main)\test\page.tsx
'use client';
import { useState } from 'react';

export default function Home() {
  const [validationResults, setValidationResults] = useState<any>(null);

  const validateAllPosts = async () => {
    const res = await fetch('/api/posts/validate-all');
    const data = await res.json();
  
    if (data.success) {
      setValidationResults(data.invalidPosts); // ← đúng key trả về từ API
    }
  };
  
  
  return (
    <div className='mt-10 text-black'>
      <h1>Post Validation</h1>
      <button onClick={validateAllPosts} className="cursor-pointer bg-gray-500">Validate All Posts</button>
      {validationResults && validationResults.length > 0 ? (
  <ul className="mt-4 space-y-4">
    {validationResults.map((result: any) => (
      <li key={result.postId} className="border p-4 bg-red-100 rounded">
        <p><strong>ID:</strong> {result.postId}</p>
        <p><strong>Label:</strong> {result.label}</p>
        <p><strong>Score:</strong> {(result.score * 100).toFixed(2)}%</p>
        <p><strong>Content:</strong> {result.content}</p>
      </li>
    ))}
  </ul>
) : (
  <p className="mt-4 text-gray-500">Không có bài viết vi phạm.</p>
)}

    </div>
  );
}

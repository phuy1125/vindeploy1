"use client";

import React, { useState, useEffect } from "react";
import { AiOutlineHeart, AiOutlineComment, AiFillHeart, AiOutlineDelete, AiOutlineFlag, AiFillFlag } from "react-icons/ai";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { MdHistory } from "react-icons/md";
import Image from "next/image";

interface Post {
  _id: string;
  author_name: string;
  author_avatar?: string;
  content: string;
  media: Array<{ media_type: string; media_url: string }>;
  status: string;
  likes: number;
  comments_count: number;
  timestamp: string;
  tags: string[];
  flagged?: boolean;
  flaggedReason?: string;
  flaggedAt?: string;
}

interface ValidationResult {
  postId: string;
  label: string;
  score: number;
  content: string;
}

const SpaceShare: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndices, setCurrentImageIndices] = useState<Record<string, number>>({});
  const [viewMode, setViewMode] = useState<"normal" | "flagged" | "history">("normal");
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [flaggedPosts, setFlaggedPosts] = useState<Post[]>([]);
  const [flaggedHistory, setFlaggedHistory] = useState<Post[]>([]);
  const [isValidating, setIsValidating] = useState<boolean>(false);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/posts");
        if (!res.ok) {
          throw new Error('Failed to fetch posts');
        }
        const data = await res.json();
        setPosts(data);
      } catch (error) {
        setError('Failed to load posts. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Validate all posts for moderation
  const validateAllPosts = async () => {
    setIsValidating(true);
    try {
      const res = await fetch('/api/posts/validate-all');
      const data = await res.json();
      
      if (data.success && data.invalidPosts) {
        setValidationResults(data.invalidPosts);
        
        // Mark posts as flagged based on validation results
        const flaggedPostIds = data.invalidPosts.map((result: ValidationResult) => result.postId);
        
        const newFlaggedPosts = posts.filter(post => 
          flaggedPostIds.includes(post._id) && !post.flagged
        ).map(post => ({
          ...post,
          flagged: true,
          flaggedReason: data.invalidPosts.find((r: ValidationResult) => r.postId === post._id)?.label || "Inappropriate content",
          flaggedAt: new Date().toISOString()
        }));
        
        // Update posts list
        setPosts(posts.map(post => {
          if (flaggedPostIds.includes(post._id) && !post.flagged) {
            return {
              ...post,
              flagged: true,
              flaggedReason: data.invalidPosts.find((r: ValidationResult) => r.postId === post._id)?.label || "Inappropriate content",
              flaggedAt: new Date().toISOString()
            };
          }
          return post;
        }));
        
        setFlaggedPosts(newFlaggedPosts);
        setViewMode("flagged");
      }
    } catch (error) {
      setError('Failed to validate posts. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  // Manually flag a post
  const flagPost = (postId: string, reason: string = "Manually flagged") => {
    const flaggedPost = posts.find(post => post._id === postId);
    if (flaggedPost && !flaggedPost.flagged) {
      const updatedPost = {
        ...flaggedPost,
        flagged: true,
        flaggedReason: reason,
        flaggedAt: new Date().toISOString()
      };
      
      setPosts(posts.map(post => post._id === postId ? updatedPost : post));
      setFlaggedPosts([...flaggedPosts, updatedPost]);
    }
  };

  // Approve a flagged post (remove flag)
  const approvePost = (postId: string) => {
    const post = posts.find(post => post._id === postId);
    if (post && post.flagged) {
      setPosts(posts.map(p => p._id === postId ? {...p, flagged: false} : p));
      setFlaggedPosts(flaggedPosts.filter(p => p._id !== postId));
    }
  };

  // Move post to history (for permanently flagged posts)
  const moveToHistory = (postId: string) => {
    const post = posts.find(post => post._id === postId);
    if (post && post.flagged) {
      setFlaggedPosts(flaggedPosts.filter(p => p._id !== postId));
      setFlaggedHistory([...flaggedHistory, post]);
    }
  };

  // Delete post
  const deletePost = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setPosts(posts.filter(post => post._id !== postId));
        setFlaggedPosts(flaggedPosts.filter(post => post._id !== postId));
        setFlaggedHistory(flaggedHistory.filter(post => post._id !== postId));
      }
    } catch (error) {
      setError('Failed to delete post. Please try again.');
    }
  };

  // Format post date
  const formatPostDate = (timestamp: string) => {
    const now = new Date();
    const postDate = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} giây trước`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;

    const days = Math.floor(diffInSeconds / 86400);
    const hours = Math.floor((diffInSeconds % 86400) / 3600);
    return `${days} ngày, ${hours} giờ trước`;
  };

  // Next image in carousel
  const nextImage = (postId: string, postIndex: number) => {
    const post = posts[postIndex];
    if (post && post.media.length > 1) {
      setCurrentImageIndices((prevIndices) => {
        const currentIndex = prevIndices[postId] !== undefined ? prevIndices[postId] : 0;
        const newIndices = { ...prevIndices };
        newIndices[postId] = (currentIndex + 1) % post.media.length;
        return newIndices;
      });
    }
  };
  
  // Previous image in carousel
  const prevImage = (postId: string, postIndex: number) => {
    const post = posts[postIndex];
    if (post && post.media.length > 1) {
      setCurrentImageIndices((prevIndices) => {
        const currentIndex = prevIndices[postId] !== undefined ? prevIndices[postId] : 0;
        const newIndices = { ...prevIndices };
        newIndices[postId] = (currentIndex - 1 + post.media.length) % post.media.length;
        return newIndices;
      });
    }
  };

  // Get posts based on current view mode
  const getDisplayPosts = () => {
    switch (viewMode) {
      case "flagged":
        return flaggedPosts;
      case "history":
        return flaggedHistory;
      case "flagged":
      default:
        return posts.filter(post => !post.flagged);
    }
  };

  const displayPosts = getDisplayPosts();

  return (
    <div className="h-full w-full overflow-auto">
      {/* Moderation Controls */}
      <div className="bg-white p-4 sticky top-0 z-10 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-2 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setViewMode("normal")}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                viewMode === "normal" 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              Bài viết thường ({posts.filter(post => !post.flagged).length})
            </button>
            <button 
              onClick={() => setViewMode("flagged")}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1 ${
                viewMode === "flagged" 
                  ? "bg-red-600 text-white" 
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              <AiFillFlag />
              Cần kiểm duyệt ({flaggedPosts.length})
            </button>
            <button 
              onClick={() => setViewMode("history")}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1 ${
                viewMode === "history" 
                  ? "bg-gray-800 text-white" 
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              <MdHistory />
              Lịch sử kiểm duyệt ({flaggedHistory.length})
            </button>
          </div>
          
          <button 
            onClick={validateAllPosts}
            disabled={isValidating}
            className={`px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 flex items-center gap-1 ${
              isValidating ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isValidating ? "Đang kiểm duyệt..." : "Kiểm duyệt tất cả bài viết"}
          </button>
        </div>
      </div>
      
      {/* Post Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 max-w-7xl mx-auto">
        {isLoading ? (
          <div className="col-span-3 text-center py-8">Loading posts...</div>
        ) : error ? (
          <div className="col-span-3 text-center py-8 text-red-500">{error}</div>
        ) : displayPosts.length === 0 ? (
          <div className="col-span-3 text-center py-8 text-gray-500">
            {viewMode === "normal" && "Không có bài viết nào"}
            {viewMode === "flagged" && "Không có bài viết nào cần kiểm duyệt"}
            {viewMode === "history" && "Không có lịch sử kiểm duyệt"}
          </div>
        ) : (
          displayPosts.map((post, postIndex) => (
            <div key={post._id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="relative">
                {/* Post Image */}
                <div className="w-full h-44 relative">
                  <Image
                    src={post.media[currentImageIndices[post._id] || 0]?.media_url || "/img/placeholder.png"}
                    alt={post.author_name}
                    layout="fill"
                    objectFit="cover"
                    objectPosition="center"
                    className="rounded-t-lg"
                  />

                  {/* Image Navigation */}
                  {post.media.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          prevImage(post._id, postIndex);
                        }}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-opacity-50 bg-black/50 text-white p-1 rounded-full hover:bg-black/90"
                      >
                        <IoIosArrowBack className="text-lg" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          nextImage(post._id, postIndex);
                        }}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-opacity-50 bg-black/50 text-white p-1 rounded-full hover:bg-black/90"
                      >
                        <IoIosArrowForward className="text-lg" />
                      </button>
                      
                      {/* Image Counter */}
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/30 bg-opacity-50 text-white text-xs px-2 py-1 rounded-full">
                        {(currentImageIndices[post._id] || 0) + 1} / {post.media.length}
                      </div>
                    </>
                  )}
                </div>

                {/* Flag Badge */}
                {post.flagged && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                    {post.flaggedReason}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="absolute top-2 right-2 flex gap-2">
                  {viewMode === "normal" && (
                    <button
                      onClick={() => flagPost(post._id)}
                      className="bg-yellow-500 text-white p-2 rounded-full hover:bg-yellow-600"
                      title="Flag content"
                    >
                      <AiOutlineFlag className="text-lg" />
                    </button>
                  )}

                  {viewMode === "flagged" && (
                    <>
                      <button
                        onClick={() => approvePost(post._id)}
                        className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600"
                        title="Approve content"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => moveToHistory(post._id)}
                        className="bg-yellow-500 text-white p-2 rounded-full hover:bg-yellow-600"
                        title="Move to history"
                      >
                        <MdHistory className="text-lg" />
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => deletePost(post._id)}
                    className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                    title="Delete post"
                  >
                    <AiOutlineDelete className="text-lg" />
                  </button>
                </div>
              </div>

              <div className="p-4">
                {/* Author Info */}
                <div className="flex items-center gap-2">
                  <Image
                    src={post.author_avatar || "/img/VN.jpg"}
                    alt={post.author_name}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{post.author_name}</p>
                    <p className="text-xs text-gray-500">{formatPostDate(post.timestamp)}</p>
                    {post.flaggedAt && viewMode !== "normal" && (
                      <p className="text-xs text-red-500">Đã đánh dấu: {formatPostDate(post.flaggedAt)}</p>
                    )}
                  </div>
                </div>

                {/* Post Content */}
                <p className="text-xs text-gray-800 mt-2">{post.content}</p>

                {/* Post Status */}
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-gray-500">{post.status}</span>
                  <div className="flex items-center gap-2">
                    {/* Like Button */}
                    <button className="flex items-center gap-1">
                      {post.likes > 0 ? (
                        <AiFillHeart className="text-red-500 text-lg" />
                      ) : (
                        <AiOutlineHeart className="text-gray-500 text-lg" />
                      )}
                      <span className="text-xs text-gray-600">{post.likes}</span>
                    </button>
                    {/* Comment Button */}
                    <div className="flex items-center gap-1">
                      <AiOutlineComment className="text-gray-500 text-lg" />
                      <span className="text-xs text-gray-600">{post.comments_count}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SpaceShare;
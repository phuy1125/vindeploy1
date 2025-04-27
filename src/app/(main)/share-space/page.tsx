'use client';

import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { AiOutlineHeart, AiOutlineComment, AiFillHeart } from 'react-icons/ai';

interface MediaItem {
  media_url: string;
  media_type?: string;
}

interface Comment {
  _id: string;
  username: string;
  avatar: string;
  text: string;
  timestamp: string;
}

interface CommentModalProps {
  onClose: () => void;
  postId: string;
  postMedia?: MediaItem[];
  author_name: string;
  author_avatar: string;
}

interface Post {
  _id: string;
  title: string;
  content: string;
  timestamp: string;
  author_name: string;
  author_avatar: string;
  media: MediaItem[];
  tags: string[];
  likes: number;
  comments_count: number;
  usersLiked?: string[];
  provinceGid: number;
}

interface Province {
  _id: number;
  name: string;
}


function CommentModal({ onClose, postId, postMedia = [],author_name, author_avatar }: CommentModalProps) {
  const [comment, setComment] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Default media if none is provided
  const media = postMedia.length > 0 ? postMedia : [{ media_url: '/img/placeholder.png' }];

  // Fetch comments from the database
  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/comments?postId=${postId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setComments(data);
      } else {
        throw new Error('Invalid comment data structure');
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      setError('Failed to load comments. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Handle submitting a comment
  const handleSubmit = async () => {
    if (!comment.trim()) return;
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setError('Bạn cần đăng nhập để bình luận.');
      return;
    }
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, text: comment, userId }),
      });
      if (!response.ok) throw new Error('Failed to post comment');
      setComment('');
      fetchComments();
    } catch (error) {
      console.error('Error posting comment:', error);
      setError('Không thể gửi bình luận.');
    }
  };

  // Format timestamp to a more readable format
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const commentDate = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - commentDate.getTime()) / 1000);
    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)}w`;
    return `${Math.floor(diffInSeconds / 2592000)}mo`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center min-h-screen">
    <div className="bg-white text-black w-full max-w-4xl h-auto rounded-lg flex overflow-hidden relative">
      {/* Left - Images Section */}
      <div className="w-1/2 bg-black flex items-center justify-center overflow-hidden rounded-l-lg relative">
        <div className="w-full h-[600px] relative">
          <Image
            src={media[currentImageIndex].media_url}
            alt="post"
            layout="fill"
            objectFit="cover"
            className="rounded-l-lg"
          />
        </div>
        {media.length > 1 && (
          <>
            <button 
              onClick={() => setCurrentImageIndex(prevIndex => (prevIndex - 1 + media.length) % media.length)}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
            >
              &#10094;
            </button>
            <button 
              onClick={() => setCurrentImageIndex(prevIndex => (prevIndex + 1) % media.length)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
            >
              &#10095;
            </button>
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1">
              {media.map((_, idx) => (
                <div 
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`w-2 h-2 rounded-full cursor-pointer ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
  
      {/* Right - Comments */}
      <div className="w-1/2 p-4 flex flex-col h-[600px]">
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-gray-700 pb-2 relative">
          <Image src={author_avatar} alt="avatar" width={32} height={32} className="rounded-full" />
          <p className="font-semibold">{author_name}</p>
          <button 
            onClick={onClose} 
            className="absolute top-2 right-2 text-black/50 hover:text-indigo-700 cursor-pointer font-bold">
            ✕
          </button>
        </div>
  
        {/* Comments */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 text-sm">
          {isLoading ? (
            <p className="text-center py-4">Loading comments...</p>
          ) : error ? (
            <p className="text-center py-4 text-red-500">{error}</p>
          ) : comments.length === 0 ? (
            <p className="text-center py-4 text-gray-500">No comments yet. Be the first to comment!</p>
          ) : (
            comments.map((commentItem) => (
              <div key={commentItem._id} className="flex items-start gap-3">
                <Image
                  src={commentItem.avatar}
                  alt={commentItem.username}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <div>
                  <p className="text-gray-800">
                    <span className="font-bold">{commentItem.username}</span> {commentItem.text}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatTimeAgo(commentItem.timestamp)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
  
        {/* Footer */}
        <div className="border-t border-gray-700 pt-3 mt-auto">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Add a comment..."
              value={comment}
              onChange={e => setComment(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-sm text-black placeholder-gray-400"
              onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
            />
            <button
              className="text-sm text-blue-500 font-semibold"
              onClick={handleSubmit}
              disabled={!comment.trim()}
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  );
}


export default function SpaceShare() {
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndices, setCurrentImageIndices] = useState<Record<string, number>>({});
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(null);


  const filteredPosts = selectedProvinceId
  ? posts.filter(post => post.provinceGid === selectedProvinceId)
  : posts;

  // Fetch posts from the database
  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/posts");
        
        if (!res.ok) {
          throw new Error('Failed to fetch posts');
        }
        
        const data = await res.json();
        
        // Lọc những bài post có status không phải là "flagged"
        const filteredPosts = data.filter((post: { status: string }) => post.status !== "flagged");
        setPosts(filteredPosts);
      } catch (error) {
        console.error("Error fetching posts:", error);
        setError('Failed to load posts. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchPosts();
  }, []);

////////////////// Like

  useEffect(() => {
    // Lấy thông tin người dùng từ sessionStorage hoặc localStorage
    const userId = localStorage.getItem("userId"); // Giả sử bạn đã lưu userId ở đây khi người dùng đăng nhập

    if (userId) {
      setCurrentUserId(userId);
    }
  }, []);

  useEffect(() => {
    // Lấy likedPosts từ localStorage
    const storedLikedPosts = localStorage.getItem("likedPosts");
    
    if (storedLikedPosts) {
      setLikedPosts(JSON.parse(storedLikedPosts)); // Cập nhật trạng thái likedPosts
    }
  }, []);
  

// Toggle like for a post
const toggleLike = async (postId: string) => {
  try {
    const response = await fetch(`/api/posts/${postId}/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentUserId }),
    });

    if (!response.ok) {
      throw new Error("Failed to update like");
    }

    const data = await response.json();

    if (data.success) {
      setLikedPosts((prev) => ({
        ...prev,
        [postId]: data.liked,
      }));

      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post._id === postId) {
            const updatedUsersLiked = post.usersLiked ? [...post.usersLiked] : [];

            if (data.liked) {
              // Nếu đã like
              if (!updatedUsersLiked.includes(currentUserId!)) {
                updatedUsersLiked.push(currentUserId!);
              }
            } else {
              // Nếu đã unlike
              const index = updatedUsersLiked.indexOf(currentUserId!);
              if (index !== -1) {
                updatedUsersLiked.splice(index, 1);
              }
            }

            return {
              ...post,
              usersLiked: updatedUsersLiked,
            };
          }
          return post;
        })
      );
    }
  } catch (error) {
    console.error("Error updating like:", error);
  }
};




/////////////////////// Like
  // Format the post date
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



  useEffect(() => {
    if (posts.length > 0) {
      const initialIndices: Record<string, number> = {};
      posts.forEach(post => {
        initialIndices[post._id] = 0; // Đặt index mặc định là 0 cho mỗi post
      });
      setCurrentImageIndices(initialIndices);
    }
  }, [posts]);


  // Navigation functions for post images
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
  

  // Open comment modal for a specific post
  const openCommentModal = (post: Post) => {
    setSelectedPost(post);
    setShowCommentModal(true);
  };

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await fetch('/api/provinces');
        const data = await res.json();
        if (data.success) {
          setProvinces(data.provinces);
        }
      } catch (error) {
        console.error('Error fetching provinces:', error);
      }
    };
  
    fetchProvinces();
  }, []);
  

  return (
    <div className="flex flex-col md:flex-row px-4 md:px-16 py-8 gap-8">
      {/* LEFT COLUMN */}
      <div className="flex-1">
      <h2 className="text-xl text-gray-700 font-semibold border-b pb-2 border-gray-300 mb-6">
          {selectedProvinceId
            ? `Tỉnh: ${provinces.find(p => p._id === selectedProvinceId)?.name || ''}`
            : "Tất cả tỉnh"}
          <div className="w-25 h-1 bg-purple-500 mt-1 rounded-full" />
        </h2>

        {isLoading ? (
          <div className="text-center py-8">Loading posts...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No posts available</div>
        ) : (
          <>
            {selectedProvinceId && (
              <div className="mb-4 text-sm text-gray-600">
                Đang lọc theo tỉnh:{" "}
                <strong className="text-purple-600">
                  #{provinces.find(p => p._id === selectedProvinceId)?.name || ""}
                </strong>
                <button
                  onClick={() => setSelectedProvinceId(null)}
                  className="ml-2 text-blue-500 underline text-[14px] cursor-pointer"
                >
                  Xoá lọc
                </button>
              </div>
            )}
          {filteredPosts.map((post, index) => (
            <div key={post._id} className="mb-12">
              {/* User Info */}
              <div className="flex items-center gap-3 mb-2">
                <Image 
                  src={post.author_avatar || "/img/VN.jpg"} 
                  alt={post.author_name} 
                  width={50} 
                  height={50} 
                  className="rounded-full" 
                />
                <div>
                  <p className="text-sm font-bold text-orange-600">{post.author_name || "Hello World"}</p>
                  <p className="text-xs text-gray-500">{formatPostDate(post.timestamp)}</p>
                  <p className="text-xs text-gray-400">đã đăng 1 bài</p>
                </div>
              </div>

              {/* Content */}
              <p className="mb-3 text-gray-500">{post.content}</p>

              {/* Show media if available */}
              {post.media && post.media.length > 0 && (
                <div className="mb-4 w-[600px] h-[700px] relative">
                  {/* Main displayed image */}
                  <div className="w-[600px] h-full relative">
                    <Image
                      src={post.media[currentImageIndices[post._id] || 0]?.media_url || "/img/placeholder.png"}
                      alt={`Image of post by ${post.author_name}`}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-md"
                    />
                  </div>

                  {/* Navigation controls - only show if there are multiple images */}
                  {post.media.length > 1 && (
                    <>
                      {/* Left arrow */}
                      <button
                        onClick={() => prevImage(post._id, index)}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                      >
                        &#10094;
                      </button>

                      {/* Right arrow */}
                      <button
                        onClick={() => nextImage(post._id, index)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                      >
                        &#10095;
                      </button>

                      {/* Image thumbnails/indicators */}
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1">
                          {post.media.map((_, idx) => (
                            <div
                              key={idx}
                              onClick={() => {
                                setCurrentImageIndices((prevIndices) => {
                                  const newIndices = { ...prevIndices };
                                  newIndices[post._id] = idx; // Set the index for this specific post
                                  return newIndices;
                                });
                              }}
                              className={`w-2 h-2 rounded-full cursor-pointer ${idx === currentImageIndices[post._id] ? 'bg-white' : 'bg-white/50'}`}
                            />
                          ))}
                        </div>
                    </>
                  )}
                </div>
              )}

              {/* Reactions */}
              <div className="flex gap-6 mt-3 text-gray-700">
              <div
                  className="flex items-center gap-1 cursor-pointer"
                  onClick={() => toggleLike(post._id)}
                >
                  {likedPosts[post._id] ? (
                    <AiFillHeart className="text-2xl text-red-500" />
                  ) : (
                    <AiOutlineHeart className="text-2xl" />
                  )}
                  <span>{post.usersLiked?.length ?? post.likes ?? 0}</span>
              </div>
                <div
                  onClick={() => openCommentModal(post)}
                  className="flex items-center gap-1 cursor-pointer"
                >
                  <AiOutlineComment className="text-2xl" />
                  <span>{post.comments_count}</span>
                </div>
              </div>
            </div>
          ))}
          </>  
        )}
      </div>

      <div className="hidden md:block w-px bg-gray-300"></div> 

      {/* RIGHT COLUMN */}
      <div className="w-full md:w-64">
        <div className="bg-purple-100 p-4 rounded-lg">
        <h2 className="text-xl text-gray-700 font-semibold border-b pb-2 border-gray-300 mb-6">
          {selectedProvinceId
            ? `Tỉnh: ${provinces.find(p => p._id === selectedProvinceId)?.name || ''}`
            : "Tất cả tỉnh"}
          <div className="w-25 h-1 bg-purple-500 mt-1 rounded-full" />
        </h2>

          <div className="w-12 h-1 bg-purple-500 mb-4 rounded-full" />

          {/* List tags */}
          <ul className="space-y-3 text-gray-800 max-h-[500px] overflow-y-auto">
              {provinces.map((province) => (
                <li
                  key={province._id}
                  className={`flex justify-between bg-purple-400 text-sm rounded-full px-4 py-1 cursor-pointer hover:bg-purple-600 ${
                    selectedProvinceId === province._id ? "ring-2 ring-white" : ""
                  }`}
                  onClick={() =>
                    setSelectedProvinceId(
                      selectedProvinceId === province._id ? null : province._id
                    )
                  }
                >
                  <span>#{province.name}</span>
                </li>
              ))}
            </ul>

        </div>
      </div>

      {/* Comment Modal */}
      {showCommentModal && selectedPost && (
        <CommentModal 
          onClose={() => setShowCommentModal(false)} 
          postId={selectedPost._id}
          postMedia={selectedPost.media} 
          author_name={selectedPost.author_name}
          author_avatar={selectedPost.author_avatar}
        />
      )}
    </div>
  );
}
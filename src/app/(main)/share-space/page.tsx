'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
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
  replies: Comment[];
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
}

function CommentModal({ onClose, postId, postMedia = [] }: { onClose: () => void; postId: string; postMedia?: MediaItem[] }) {
  const [replyTo, setReplyTo] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Default media if none is provided
  const media = postMedia.length > 0 ? postMedia : [{ media_url: '/img/placeholder.png' }];

  // Fetch comments from the database
  useEffect(() => {
    const fetchComments = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/comments?postId=${postId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch comments');
        }

        const data = await response.json();
        if (Array.isArray(data)) {
          setComments(data);  // Assume the response returns an array of comments
        } else {
          throw new Error('Invalid comment data structure');
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
        setError('Failed to load comments. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [postId]);

  const handleReply = (username: string) => {
    setReplyTo(username);
  };

  // const handleSubmit = async () => {
  //   if (!comment.trim()) return;

  //   // Create new comment data
  //   const newCommentData = {
  //     postId,
  //     text: comment,
  //     parentId: replyTo ? comments.find(c => c.username === replyTo)?._id : null,
  //   };

  //   try {
  //     // Send the comment to the API
  //     const response = await fetch('/api/comments', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(newCommentData),
  //     });

  //     if (!response.ok) {
  //       throw new Error('Failed to post comment');
  //     }

  //     // Get the newly created comment from the response
  //     const newComment = await response.json();

  //     // Update the comments state based on whether it's a reply or a new comment
  //     if (replyTo) {
  //       setComments(prevComments => 
  //         prevComments.map(cmnt => {
  //           if (cmnt.username === replyTo) {
  //             return {
  //               ...cmnt,
  //               replies: [...cmnt.replies, newComment]
  //             };
  //           }
  //           return cmnt;
  //         })
  //       );
  //     } else {
  //       setComments(prevComments => [...prevComments, newComment]);
  //     }

  //     // Reset input fields
  //     setComment('');
  //     setReplyTo('');
  //   } catch (error) {
  //     console.error('Error posting comment:', error);
  //     // You might want to show an error message to the user here
  //   }
  // };

  const inputDisplayValue = replyTo ? `Replying to @${replyTo}: ${comment}` : comment;

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const replyPrefix = `Replying to @${replyTo}: `;
    
    if (replyTo) {
      if (inputValue.length < replyPrefix.length) {
        setReplyTo('');
        setComment(inputValue);
      } else if (inputValue.startsWith(replyPrefix)) {
        setComment(inputValue.substring(replyPrefix.length));
      } else {
        setComment(inputValue);
      }
    } else {
      setComment(inputValue);
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
          {/* Main displayed image */}
          <div className="w-full h-[600px] relative">
            <Image
              src={media[currentImageIndex].media_url}
              alt="post"
              layout="fill"
              objectFit="cover"
              className="rounded-l-lg"
            />
          </div>
          
          {/* Navigation controls - only show if there are multiple images */}
          {media.length > 1 && (
            <>
              {/* Left arrow */}
              <button 
                onClick={() => setCurrentImageIndex(prevIndex => (prevIndex - 1 + media.length) % media.length)}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
              >
                &#10094;
              </button>
              
              {/* Right arrow */}
              <button 
                onClick={() => setCurrentImageIndex(prevIndex => (prevIndex + 1) % media.length)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
              >
                &#10095;
              </button>
              
              {/* Image thumbnails/indicators */}
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
        <div className="w-1/2 p-4 flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-2 border-b border-gray-700 pb-2 relative">
              <Image src="/img/man.png" alt="avatar" width={32} height={32} className="rounded-full" />
              <p className="font-semibold">gin.agg</p>

              {/* Close button at the top-right */}
              <button 
                  onClick={onClose} 
                  className="absolute top-2 right-2 text-black/50 hover:text-indigo-700 cursor-pointer font-bold">
                  ✕
              </button>
          </div>
          
          {/* Comments */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4 text-sm max-h-[400px]">
            {isLoading ? (
              <p className="text-center py-4">Loading comments...</p>
            ) : error ? (
              <p className="text-center py-4 text-red-500">{error}</p>
            ) : comments.length === 0 ? (
              <p className="text-center py-4 text-gray-500">No comments yet. Be the first to comment!</p>
            ) : (
              comments.map((commentItem) => (
                <div key={commentItem._id} className="space-y-2">
                  <div className="flex items-start gap-3">
                    <Image
                      src={commentItem.avatar || "/img/man.png"}
                      alt={"hello"}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                    <div>
                      <p className="text-gray-800">
                        <span className="font-bold">{commentItem.username|| "hello"}</span> {commentItem.text || "Heloooooooo"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatTimeAgo(commentItem.timestamp)} ·
                        <button
                          className="text-blue-500 cursor-pointer ml-1"
                          onClick={() => handleReply(commentItem.username)}>
                          Reply
                        </button>
                      </p>
                    </div>
                  </div>

                  {/* Replies for this comment */}
                  {commentItem.replies && commentItem.replies.length > 0 && (
                    <div className="pl-10 space-y-2">
                      {commentItem.replies.map((reply) => (
                        <div key={reply._id} className="flex items-start gap-3">
                          <Image
                            src={reply.avatar}
                            alt={reply.username}
                            width={28}
                            height={28}
                            className="rounded-full"
                          />
                          <div>
                            <p>
                              <span className="font-bold">{reply.username}</span>{' '}
                              <span className="text-blue-500">@{commentItem.username}</span>{' '}
                              {reply.text}
                            </p>
                            <p className="text-xs text-gray-400">
                              {formatTimeAgo(reply.timestamp)} ·
                              <button
                                className="text-blue-500 cursor-pointer ml-1"
                                onClick={() => handleReply(reply.username)}>
                                Reply
                              </button>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-700 pt-3 mt-auto">
            <div className="flex items-center justify-between mb-1">
              <AiOutlineHeart className="text-xl" />
              <p className="text-xs text-gray-400">March 11, 2024</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Add a comment..."
                value={inputDisplayValue}
                onChange={handleCommentChange}
                className="flex-1 bg-transparent border-none outline-none text-sm text-black placeholder-gray-400"
              />

              <button
                className="text-sm text-blue-500 font-semibold"
                // onClick={handleSubmit}
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
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    // Lấy thông tin người dùng từ sessionStorage hoặc localStorage
    const userId = localStorage.getItem("userId"); // Giả sử bạn đã lưu userId ở đây khi người dùng đăng nhập

    if (userId) {
      setCurrentUserId(userId);
    }
  }, []);
  
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
        setPosts(data);
      } catch (error) {
        console.error("Error fetching posts:", error);
        setError('Failed to load posts. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);



  useEffect(() => {
    // Lấy likedPosts từ localStorage
    const storedLikedPosts = localStorage.getItem("likedPosts");
    
    if (storedLikedPosts) {
      setLikedPosts(JSON.parse(storedLikedPosts)); // Cập nhật trạng thái likedPosts
    }
  }, []);
  


  // Toggle like for a post
// Toggle like for a post
const toggleLike = async (postId: string) => {
  // Optimistically update UI
  setLikedPosts((prev) => {
    const newLikedPosts = { ...prev, [postId]: !prev[postId] };

    // Save the updated likes status to localStorage
    localStorage.setItem("likedPosts", JSON.stringify(newLikedPosts));

    return newLikedPosts;
  });

  // Update the post likes in the local state
  setPosts((prevPosts) =>
    prevPosts.map((post) => {
      if (post._id === postId) {
        return {
          ...post,
          likes: likedPosts[postId] ? post.likes - 1 : post.likes + 1,
        };
      }
      return post;
    })
  );

  try {
    // Send request to backend to update like count
    const response = await fetch(`/api/posts/${postId}/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentUserId }),
    });

    if (!response.ok) {
      throw new Error("Failed to update like");
    }

    // Process response
    const data = await response.json();

    // Update UI with the result from server
    if (data.success) {
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post._id === postId) {
            return {
              ...post,
              likes: data.likesCount,
            };
          }
          return post;
        })
      );

      setLikedPosts((prev) => ({
        ...prev,
        [postId]: data.liked,
      }));
    }
  } catch (error) {
    console.error("Error updating like:", error);
    // Revert optimistic update if there was an error
    setLikedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));

    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post._id === postId) {
          return {
            ...post,
            likes: likedPosts[postId] ? post.likes + 1 : post.likes - 1,
          };
        }
        return post;
      })
    );
  }
};


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

  // Navigation functions for post images
  const nextImage = (postIndex: number) => {
    if (posts[postIndex] && posts[postIndex].media.length > 1) {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % posts[postIndex].media.length);
    }
  };

  const prevImage = (postIndex: number) => {
    if (posts[postIndex] && posts[postIndex].media.length > 1) {
      setCurrentImageIndex((prevIndex) => (prevIndex - 1 + posts[postIndex].media.length) % posts[postIndex].media.length);
    }
  };

  // Open comment modal for a specific post
  const openCommentModal = (post: Post) => {
    setSelectedPost(post);
    setShowCommentModal(true);
  };

  return (
    <div className="flex flex-col md:flex-row px-4 md:px-16 py-8 gap-8">
      {/* LEFT COLUMN */}
      <div className="flex-1">
        <h2 className="text-xl text-gray-700 font-semibold border-b pb-2 border-gray-300 mb-6">
          Tất cả tỉnh
          <div className="w-16 h-1 bg-purple-500 mt-1 rounded-full" />
        </h2>

        {isLoading ? (
          <div className="text-center py-8">Loading posts...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No posts available</div>
        ) : (
          posts.map((post, index) => (
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
                      src={post.media[currentImageIndex]?.media_url || "/img/placeholder.png"}
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
                        onClick={() => prevImage(index)}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                      >
                        &#10094;
                      </button>

                      {/* Right arrow */}
                      <button
                        onClick={() => nextImage(index)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                      >
                        &#10095;
                      </button>

                      {/* Image thumbnails/indicators */}
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1">
                        {post.media.map((_, idx) => (
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
                  <span>{post.likes}</span>
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
          ))
        )}
      </div>

      <div className="hidden md:block w-px bg-gray-300"></div> 

      {/* RIGHT COLUMN */}
      <div className="w-full md:w-64">
        <div className="bg-purple-100 p-4 rounded-lg">
          <h3 className="text-lg text-black font-semibold mb-2">Địa điểm</h3>
          <div className="w-12 h-1 bg-purple-500 mb-4 rounded-full" />

          {/* List tags */}
          <ul className="space-y-3 text-gray-800 max-h-[500px] overflow-y-auto">
            {/* This would ideally be populated from your database */}
            <li className="flex justify-between bg-purple-400 text-sm rounded-full px-4 py-1">
              <span># Bắc Ninh</span><span className="bg-white rounded-full px-2">3</span>
            </li>
            <li className="flex justify-between bg-purple-400 text-sm rounded-full px-4 py-1">
              <span># Hưng Yên</span><span className="bg-white rounded-full px-2">7</span>
            </li>
            <li className="flex justify-between bg-purple-400 text-sm rounded-full px-4 py-1">
              <span># Thái Nguyên</span><span className="bg-white rounded-full px-2">4</span>
            </li>
            <li className="flex justify-between bg-purple-400 text-sm rounded-full px-4 py-1">
              <span># Đắk Lắk</span><span className="bg-white rounded-full px-2">10</span>
            </li>
            {/* Add more tags as needed */}
          </ul>
        </div>
      </div>

      {/* Comment Modal */}
      {showCommentModal && selectedPost && (
        <CommentModal 
          onClose={() => setShowCommentModal(false)} 
          postId={selectedPost._id}
          postMedia={selectedPost.media} 
        />
      )}
    </div>
  );
}
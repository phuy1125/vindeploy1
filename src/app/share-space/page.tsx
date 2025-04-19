'use client';

import Image from 'next/image';
import { AiOutlineHeart, AiOutlineComment, AiFillHeart } from 'react-icons/ai';
import { useState } from 'react';


function CommentModal({ onClose }: { onClose: () => void }) {
    const [replyTo, setReplyTo] = useState<string>('');
    const [comment, setComment] = useState<string>('');
  
    // Define the comment structure with TypeScript interface
    interface CommentType {
      id: number;
      username: string;
      avatar: string;
      text: string;
      timeAgo: string;
      replies: CommentType[];
    }
  
    const [comments, setComments] = useState<CommentType[]>([
      {
        id: 1,
        username: 'gin.agg',
        avatar: '/img/woman.png',
        text: 'Đẹp quáaaaaaaaaaaaaaaaaaaaa',
        timeAgo: '57w',
        replies: []
      },
      {
        id: 2,
        username: 'xiaohong291098',
        avatar: '/img/woman.png',
        text: 'Đẹp quá ag',
        timeAgo: '56w',
        replies: []
      },
      {
        id: 3,
        username: 'linh_ily',
        avatar: '/img/woman.png',
        text: 'Xink đẹp ở 1 nơi xaa',
        timeAgo: '57w',
        replies: []
      }
    ]);
  
    const handleReply = (username: string) => {
      setReplyTo(username);
    };
  
    const handleSubmit = () => {
      if (!comment.trim()) return;
  
      const newReply: CommentType = {
        id: Date.now(),
        username: 'current_user', // Replace with the current user's username
        avatar: '/img/man.png', // Replace with the current user's avatar
        text: comment,
        timeAgo: 'Just now',
        replies: []
      };
  
      // Find the comment to reply to and add the reply
      if (replyTo) {
        const updatedComments = comments.map(cmnt => {
          if (cmnt.username === replyTo) {
            return {
              ...cmnt,
              replies: cmnt.replies ? [...cmnt.replies, newReply] : [newReply]
            };
          }
          return cmnt;
        });
  
        setComments(updatedComments);
      } else {
        // Add a new comment if not replying
        setComments(prevComments => [...prevComments, newReply]);
      }
  
      console.log(`${replyTo ? `Replying to ${replyTo}` : 'Posted comment'}: ${comment}`);
      setComment('');
      setReplyTo('');
    };
  
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
  
    return (
      <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center min-h-screen">
        <div className="bg-white text-black w-full max-w-4xl h-auto rounded-lg flex overflow-hidden relative">
          {/* Left - Image */}
          <div className="w-1/2 bg-black flex items-center justify-center overflow-hidden rounded-l-lg">
            <Image
              src="/img/sky.png"
              alt="post"
              width={600}
              height={600}
              className="object-cover h-full w-full rounded-l-lg"
            />
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
            <div className="flex-1 overflow-y-auto py-4 space-y-4 text-sm max-h-[400px]"> {/* Set max-height and scroll */}
              {comments.map((commentItem) => (
                <div key={commentItem.id} className="space-y-2">
                  <div className="flex items-start gap-3">
                    <Image
                      src={commentItem.avatar}
                      alt={commentItem.username}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                    <div>
                      <p>
                        <span className="font-bold">{commentItem.username}</span> {commentItem.text}
                      </p>
                      <p className="text-xs text-gray-400">
                        {commentItem.timeAgo} ·
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
                        <div key={reply.id} className="flex items-start gap-3">
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
                              {reply.timeAgo} ·
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
              ))}
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
                  onClick={handleSubmit}
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
  
export default function spaceShare(){
    const [showCommentModal, setShowCommentModal] = useState(false);

    const [liked, setLiked] = useState(false);  // State to track if the heart is clicked

  // Toggle the like state
        function toggleLike() {
        setLiked(!liked);
    }
        
    return(
        <div className="flex flex-col md:flex-row px-4 md:px-16 py-8 gap-8">
      {/* LEFT COLUMN */}
      <div className="flex-1">
        <h2 className="text-xl text-gray-700 font-semibold border-b pb-2 border-gray-300 mb-6">
          Tất cả tỉnh
          <div className="w-16 h-1 bg-purple-500 mt-1 rounded-full" />
        </h2>

        {/* POST ITEM */}
        <div className="mb-12">
          {/* User Info */}
          <div className="flex items-center gap-3 mb-2">
            <Image src="/img/man.png" alt="Lucas" width={50} height={50} className="rounded-full" />
            <div>
              <p className="text-sm font-bold text-orange-600">Lucas</p>
              <p className="text-xs text-gray-500">3 ngày, 16 giờ trước</p>
              <p className="text-xs text-gray-400">đã đăng 1 bài</p>
            </div>
          </div>

          {/* Content */}
          <p className="mb-3 text-gray-500">Setup vibe 🧘‍♂️</p>
          <Image src="/img/sky.png" alt="post image" width={500} height={0} className="rounded-xl max-h-full " />

          {/* Reactions */}
          <div className="flex gap-6 mt-3 text-gray-700">
            <div className="flex items-center gap-1 cursor-pointer" onClick={toggleLike}>
            {liked ? (
                <AiFillHeart className="text-2xl text-red-500" /> // Filled heart with red color
              ) : (
                <AiOutlineHeart className="text-2xl" />
              )}
              <span>6,2K</span>
            </div>
            <div
                    onClick={() => setShowCommentModal(true)}
                    className="flex items-center gap-1 cursor-pointer">
                    <AiOutlineComment className="text-2xl" />
                    <span>50</span>
            </div>
          </div>
        </div>
         
        {/* SECOND POST */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <Image src="/img/woman.png" alt="Hindi" width={50} height={50} className="rounded-full" />
            <div>
              <p className="text-sm font-bold text-pink-600">Hindi</p>
              <p className="text-xs text-gray-500">1 ngày, 16 giờ trước</p>
              <p className="text-xs text-gray-400">đã đăng 1 bài</p>
            </div>
          </div>
          <p className="mb-3 text-gray-700">Welcome India &lt;3</p>
          <Image src="/img/setup vibe.jpeg" alt="post image" width={500} height={0} className="rounded-xl max-h-full" />
        </div>
      </div>
      <div className="hidden md:block w-px bg-gray-300" />  
      {/* RIGHT COLUMN */}
      <div className="w-full md:w-64">
        <div className="bg-purple-100 p-4 rounded-lg">
          <h3 className="text-lg text-black font-semibold mb-2">Địa điểm</h3>
          <div className="w-12 h-1 bg-purple-500 mb-4 rounded-full" />

          {/* List tags */}
          <ul className="space-y-3 text-gray-800">
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
            <li className="flex justify-between bg-purple-400 text-sm rounded-full px-4 py-1">
              <span># Đắk Lắk</span><span className="bg-white rounded-full px-2">10</span>
            </li>
            <li className="flex justify-between bg-purple-400 text-sm rounded-full px-4 py-1">
              <span># Đắk Lắk</span><span className="bg-white rounded-full px-2">10</span>
            </li>
            <li className="flex justify-between bg-purple-400 text-sm rounded-full px-4 py-1">
              <span># Đắk Lắk</span><span className="bg-white rounded-full px-2">10</span>
            </li>
            <li className="flex justify-between bg-purple-400 text-sm rounded-full px-4 py-1">
              <span># Đắk Lắk</span><span className="bg-white rounded-full px-2">10</span>
            </li>
            <li className="flex justify-between bg-purple-400 text-sm rounded-full px-4 py-1">
              <span># Đắk Lắk</span><span className="bg-white rounded-full px-2">10</span>
            </li>
            <li className="flex justify-between bg-purple-400 text-sm rounded-full px-4 py-1">
              <span># Đắk Lắk</span><span className="bg-white rounded-full px-2">10</span>
            </li>
            <li className="flex justify-between bg-purple-400 text-sm rounded-full px-4 py-1">
              <span># Đắk Lắk</span><span className="bg-white rounded-full px-2">10</span>
            </li>
            <li className="flex justify-between bg-purple-400 text-sm rounded-full px-4 py-1">
              <span># Đắk Lắk</span><span className="bg-white rounded-full px-2">10</span>
            </li>
            <li className="flex justify-between bg-purple-400 text-sm rounded-full px-4 py-1">
              <span># Đắk Lắk</span><span className="bg-white rounded-full px-2">10</span>
            </li>
            <li className="flex justify-between bg-purple-400 text-sm rounded-full px-4 py-1">
              <span># Đắk Lắk</span><span className="bg-white rounded-full px-2">10</span>
            </li>
          </ul>
        </div>
      </div>
      {showCommentModal && <CommentModal onClose={() => setShowCommentModal(false)} />}
    </div>
    );
}
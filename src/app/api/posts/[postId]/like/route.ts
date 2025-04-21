// file: app/api/posts/[postId]/like/route.ts
import { NextResponse } from 'next/server';
import clientPromise from '../../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params;
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    // Kết nối tới MongoDB
    const client = await clientPromise;
    const db = client.db();
    const postsCollection = db.collection('posts');

    // Tìm post hiện tại
    const post = await postsCollection.findOne({
      _id: new ObjectId(postId)
    });

    if (!post) {
      return NextResponse.json(
        { success: false, message: 'Post not found' },
        { status: 404 }
      );
    }

    // Kiểm tra xem user đã có trong mảng usersLiked chưa
    const usersLiked = post.usersLiked || [];
    const userIndex = usersLiked.indexOf(userId);
    let updatedLikeCount;
    let isLiked;

    if (userIndex !== -1) {
      // User đã like trước đó, cần xóa khỏi mảng và giảm like
      usersLiked.splice(userIndex, 1);
      updatedLikeCount = post.likes - 1;
      isLiked = false;
    } else {
      // User chưa like, thêm vào mảng và tăng like
      usersLiked.push(userId);
      updatedLikeCount = post.likes + 1;
      isLiked = true;
    }

    // Cập nhật post với mảng usersLiked mới và số lượng likes mới
    const result = await postsCollection.updateOne(
      { _id: new ObjectId(postId) },
      { 
        $set: { 
          usersLiked: usersLiked,
          likes: updatedLikeCount 
        } 
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Failed to update post like count' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      liked: isLiked,
      likesCount: updatedLikeCount
    });
  } catch (error) {
    console.error('Error handling like:', error);
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { success: false, message: 'Server error', error: message },
      { status: 500 }
    );
  }
}

// API để lấy tất cả posts mà user đã like
// GET API để lấy trạng thái like của người dùng khi đăng nhập
export async function GET(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params;
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    // Kết nối tới MongoDB
    const client = await clientPromise;
    const db = client.db();
    const postsCollection = db.collection('posts');

    // Kiểm tra xem user có like bài viết này không
    const post = await postsCollection.findOne({
      _id: new ObjectId(postId),
      usersLiked: userId, // Kiểm tra trong mảng usersLiked
    });

    return NextResponse.json({
      liked: !!post, // Nếu bài viết có trong mảng usersLiked, trả về true
    });
  } catch (error) {
    console.error('Error checking like status:', error);
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { success: false, message: 'Server error', error: message },
      { status: 500 }
    );
  }
}

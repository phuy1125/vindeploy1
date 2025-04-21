// file: app/api/users/[userId]/likes/route.ts
import { NextResponse } from 'next/server';
import clientPromise from '../../../../../lib/mongodb';

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    
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
    
    // Tìm tất cả post mà userId nằm trong mảng usersLiked
    const likedPosts = await postsCollection.find({ 
      usersLiked: userId 
    }).project({ 
      _id: 1  // Chỉ lấy ID của các bài post
    }).toArray();
    
    // Trả về danh sách ID của các bài post mà user đã like
    const likedPostIds = likedPosts.map(post => post._id.toString());
    
    return NextResponse.json({ 
      success: true,
      likedPostIds 
    });
  } catch (error) {
    console.error('Error fetching user likes:', error);
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { success: false, message: 'Failed to fetch user likes', error: message },
      { status: 500 }
    );
  }
}
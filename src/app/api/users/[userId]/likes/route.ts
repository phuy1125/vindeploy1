import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb'; // hoặc '../../../lib/mongodb' nếu bạn không dùng alias

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  const { userId } = params;

  if (!userId) {
    return NextResponse.json(
      { success: false, message: 'User ID is required' },
      { status: 400 }
    );
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    const postsCollection = db.collection('posts');

    const likedPosts = await postsCollection
      .find({ usersLiked: userId })
      .project({ _id: 1 })
      .toArray();

    const likedPostIds = likedPosts.map((p) => p._id.toString());

    return NextResponse.json({ success: true, likedPostIds });
  } catch (error) {
    console.error('Error fetching liked posts:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Server error',
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

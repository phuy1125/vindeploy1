import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '../../../lib/mongodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    if (!postId) {
      return NextResponse.json({ message: 'Post ID is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const postsCollection = db.collection('posts');
    const usersCollection = db.collection('users');

    const post = await postsCollection.findOne({ _id: new ObjectId(postId) });
    if (!post) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    }

    const comments = post.comments || [];

    const enrichedComments = await Promise.all(
      comments.map(async (comment: any) => {
        const user = await usersCollection.findOne({ _id: new ObjectId(comment.user_id) });
        return {
          _id: comment._id.toString(),
          username: user?.username || 'Unknown',
          avatar: user?.avatar || '/img/default-avatar.png',
          text: comment.content,
          timestamp: comment.created_at,
        };
      })
    );

    return NextResponse.json(enrichedComments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ message: 'Failed to fetch comments' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { postId, text, userId } = body;

    if (!postId || !text || !userId) {
      return NextResponse.json({ message: 'Thiếu thông tin' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const postsCollection = db.collection('posts');

    const newComment = {
      _id: new ObjectId(),
      user_id: new ObjectId(userId as string),
      content: text,
      created_at: new Date(),
    };

    const result = await postsCollection.updateOne(
      { _id: new ObjectId(postId as string) },
      { $push: { comments: newComment } as any } // bypass TS type error
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ message: 'Không thể thêm bình luận' }, { status: 500 });
    }

    return NextResponse.json({ success: true, comment: newComment });
  } catch (error) {
    console.error('Error posting comment:', error);
    return NextResponse.json({ message: 'Lỗi khi thêm bình luận' }, { status: 500 });
  }
}

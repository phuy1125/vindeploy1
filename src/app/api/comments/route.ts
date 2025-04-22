import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '../../../lib/mongodb'; // Import MongoDB connection utility

interface Comment {
  _id: ObjectId;  // This should match your actual MongoDB ObjectId type
  user_id: string | ObjectId;  // Define as the correct type from your DB
  content: string;
  created_at: string | Date;
  // Add any other fields that exist in your actual comments
}

export async function GET(request: Request) {
  try {
    // Query post by ID from MongoDB
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    
    if (!postId) {
      return NextResponse.json({ message: 'Post ID is required' }, { status: 400 });
    }

    // Connect to MongoDB and get the posts collection
    const client = await clientPromise;
    const db = client.db();
    const postsCollection = db.collection('posts');

    const post = await postsCollection.findOne({ _id: new ObjectId(postId) });

    if (!post) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    }

    // Format comments for frontend
    const formattedComments = post.comments?.map((comment: Comment) => ({
      _id: comment._id.toString(),
      username: comment.user_id ? comment.user_id.toString() : "Anonymous", // Using user_id
      avatar: "/img/man.png", // Placeholder or query user for avatar
      text: comment.content, // Ensure you're using 'content' here
      timestamp: comment.created_at, // Ensure you're using 'created_at' for the timestamp
      replies: [] // Handle replies logic here
    })) || [];

    return NextResponse.json(formattedComments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ message: 'Failed to fetch comments' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import clientPromise from '@lib/mongodb';
import { ObjectId } from 'mongodb';

export const config = {
  api: {
    bodyParser: false, // Optional, depends on whether you're expecting a request body
  },
};

// Define the User interface for MongoDB response
interface UserFromDB {
  _id: ObjectId;
  username: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

// GET handler to fetch users
export async function GET(req: Request) {
  try {
    // Connect to the database
    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection<UserFromDB>('users');

    // Fetch all users from MongoDB
    const users = await usersCollection.find().toArray();

    // If users are found, return them as JSON
    if (users && users.length > 0) {
      // Convert ObjectId to string for JSON serialization
      const usersWithStringId = users.map((user) => ({
        id: user._id.toString(),  // Convert ObjectId to string
        name: user.username,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }));

      return NextResponse.json(usersWithStringId); // Return users as JSON
    } else {
      return NextResponse.json({ error: 'No users found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { message: 'Failed to fetch users', error: error instanceof Error ? error.message : error },
      { status: 500 }
    );
  }
}

// DELETE handler to delete a user
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId'); // Extract userId from query params

    if (!userId) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    // Connect to the database
    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection('users');

    // Delete the user from the database
    const result = await usersCollection.deleteOne({ _id: new ObjectId(userId) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'User not found or could not be deleted' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting user:', error);
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ message: 'Server error', error: message }, { status: 500 });
  }
}

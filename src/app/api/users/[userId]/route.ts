import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';

// Interface for the update object
interface UserUpdateFields {
  username?: string;
  avatar?: string;
  updatedAt: Date;
}

// Handle file upload
async function saveFile(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  // Create directory if it doesn't exist
  const uploadDir = path.join(process.cwd(), 'public/img');
  try {
    await fs.access(uploadDir);
  } catch {
    await fs.mkdir(uploadDir, { recursive: true });
  }
  
  // Generate unique filename
  const fileName = `${Date.now()}-${file.name.replace(/\s/g, '-')}`;
  const filePath = path.join(uploadDir, fileName);
  
  // Write file to disk
  await fs.writeFile(filePath, buffer);
  
  return `/img/${fileName}`;
}

export async function PUT(req: Request, context: { params: { userId: string } }) {
  const { userId } = context.params;

  try {
    const formData = await req.formData();
    const username = formData.get('username') as string | null;
    const avatarFile = formData.get('avatar') as File | null;
    
    let avatarUrl: string | null = null;
    if (avatarFile && avatarFile instanceof File) {
      avatarUrl = await saveFile(avatarFile);
    }
    
    if (!username && !avatarUrl) {
      return NextResponse.json({ error: 'Username or avatar is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection('users');

    // Create update object with proper typing
    const updateObject: UserUpdateFields = {
      updatedAt: new Date()
    };
    
    if (username) {
      updateObject.username = username;
    }
    
    if (avatarUrl) {
      updateObject.avatar = avatarUrl;
    }

    // Update the user
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateObject }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: 'User not found or could not be updated' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'User updated successfully',
      avatarUrl 
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request, context: { params: { userId: string } }) {
  // Await the params before destructuring
  const params = await context.params;
  const { userId } = params;

  try {
    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Define a type for the response to avoid any
    interface UserResponse {
      username: string;
      email: string;
      avatar: string | null;
      createdAt: string | Date;
      updatedAt: string | Date;
    }

    const userResponse: UserResponse = {
      username: user.username,
      email: user.email,
      avatar: user.avatar || null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return NextResponse.json(userResponse);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user details', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
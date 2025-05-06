//  src\app\api\posts\route.ts
  import { NextResponse } from 'next/server';
  import formidable, { File as FormidableFile, Files } from 'formidable';
  import path from 'path';
  import fs from 'fs';
  import clientPromise from '../../../lib/mongodb';
  import { Readable } from 'stream';
  import type { IncomingMessage } from 'http';
  import { ObjectId } from 'mongodb';

  export const config = {
    api: {
      bodyParser: false, // Disable Next.js default body parser
    },
  };
  interface PostFromDB {
    _id: ObjectId;
    title: string;
    content: string;
    author_id: string;
    locationRaw: string;
    provinceGid: number | null; 
    timestamp: Date;
    tags: string[];
    media: {
      media_type: string;
      media_url: string;
    }[];
  }
  

  export async function POST(req: Request) {
    try {
      if (!req.body) {
        return NextResponse.json({ message: 'Request body is null' }, { status: 400 });
      }
      // Read body into a Buffer
      const arrayBuffer = await req.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Create a fake IncomingMessage for formidable
      const mockReq = Object.assign(Readable.from(buffer), {
        headers: Object.fromEntries(req.headers.entries()),
        method: req.method,
      }) as IncomingMessage;

      const form = formidable({ multiples: true, keepExtensions: true });

      return new Promise((resolve) => {
        form.parse(mockReq, async (err, fields, files: Files) => {
          if (err) {
            console.error('Form parse error:', err);
            return resolve(
              NextResponse.json({ message: 'Form parse failed', error: err }, { status: 500 })
            );
          }

          try {
            // Normalize fields (each may be string or string[])
            const title = Array.isArray(fields.title) ? fields.title[0] : fields.title ?? '';
            const content = Array.isArray(fields.content) ? fields.content[0] : fields.content ?? '';
            const tagsRaw = Array.isArray(fields.tags) ? fields.tags[0] : fields.tags ?? '';
            const author_id = Array.isArray(fields.author_id) ? fields.author_id[0] : fields.author_id ?? '';
            const locationRaw = Array.isArray(fields.location) ? fields.location[0] : fields.location ?? '{}';
             // Add provinceGid parsing
            const provinceGidRaw = Array.isArray(fields.provinceGid) ? fields.provinceGid[0] : fields.provinceGid ?? null;
            // Convert to number or null
            const provinceGid = provinceGidRaw ? parseInt(provinceGidRaw, 10) : null;
            const tags = tagsRaw.split(',').map((tag) => tag.trim());
            console.log(locationRaw);
            const newPost = {
              title,
              content,
              author_id: new ObjectId(author_id),
              locationRaw,
              provinceGid,
              timestamp: new Date(),
              status: 'active',
              tags,
              media: [] as { media_type: string; media_url: string }[],
            };

            // Helper to add image metadata
            const addImageToPost = (filename: string) => {
              newPost.media.push({ media_type: 'image', media_url: `/uploads/${filename}` });
            };

            // Normalize files.image into an array of FormidableFile
            const imageField = files.image;
            const images: FormidableFile[] = [];
            if (Array.isArray(imageField)) {
              images.push(...imageField);
            } else if (imageField) {
              images.push(imageField);
            }

            // Process each image
            for (const image of images) {
              if (!image.mimetype?.startsWith('image/')) {
                return resolve(
                  NextResponse.json({ message: 'Only image files are allowed.' }, { status: 400 })
                );
              }

              const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
              if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
              }

              const filename = `${Date.now()}_${image.originalFilename}`;
              const uploadPath = path.join(uploadsDir, filename);

              if (image.filepath) {
                // Copy the file into public/uploads
                fs.copyFileSync(image.filepath, uploadPath);
                addImageToPost(filename);
              } else {
                console.error('No filepath for image:', image);
              }
            }

            // Save post to MongoDB
            const client = await clientPromise;
            const db = client.db();
            await db.collection('posts').insertOne(newPost);

            return resolve(NextResponse.json(newPost, { status: 201 }));
          } catch (error) {
            console.error('Internal error:', error);
            const message = error instanceof Error ? error.message : 'Unknown error occurred';
            return resolve(
              NextResponse.json({ message: 'Server error', error: message }, { status: 500 })
            );
          }
        });
      });
    } catch (error) {
      console.error('Unexpected error:', error);
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      return NextResponse.json({ message: 'Unhandled server error', error: message }, { status: 500 });
    }
  }

  export async function GET(req: Request) {
    try {
      const client = await clientPromise;
      const db = client.db();
      const postsCollection = db.collection<PostFromDB>('posts');
      const usersCollection = db.collection('users');
  
      const { searchParams } = new URL(req.url);
      const locationId = searchParams.get("location_id");
  
      const query: Record<string, any> = {
        status: { $ne: '' },
      };
    
      if (locationId) {
        query.locationRaw = locationId;
      }
    
      const posts = await postsCollection.find(query).toArray();
      const enrichedPosts = await Promise.all(
        posts.map(async (post: PostFromDB) => {
          try {
            const author = await usersCollection.findOne({ _id: new ObjectId(post.author_id) });
  
            return {
              ...post,
              author_name: author?.username || 'Unknown',
              author_avatar: author?.avatar || '/img/default-avatar.png',
            };
          } catch (userError) {
            console.warn(`Lỗi khi tìm user với ID: ${post.author_id}`, userError);
            return {
              ...post,
              author_name: 'Unknown',
              author_avatar: '/img/default-avatar.png',
            };
          }
        })
      );
  
      return NextResponse.json(enrichedPosts);
    } catch (error) {
      console.error('❌ Error fetching posts:', error);
      return NextResponse.json(
        { message: 'Failed to fetch posts', error: error instanceof Error ? error.message : error },
        { status: 500 }
      );
    }
  }

  export async function PATCH(req: Request) {
    try {
      // Lấy URL từ request
      const url = new URL(req.url);
      // Lấy postId từ query parameters
      const postId = url.searchParams.get('postId');
    
      if (!postId) {
        return NextResponse.json({ message: 'Post ID is required' }, { status: 400 });
      }
    
      // Đọc body từ request
      const body = await req.json();
      const { status } = body;
    
      if (!status || status !== 'active') {
        return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
      }
    
      // Kết nối đến MongoDB và cập nhật trạng thái bài viết
      const client = await clientPromise;
      const db = client.db();
      const postsCollection = db.collection('posts');
    
      // Cập nhật trạng thái của bài viết thành 'active'
      const result = await postsCollection.updateOne(
        { _id: new ObjectId(postId) },
        { $set: { status: 'active' } }
      );
    
      if (result.modifiedCount === 0) {
        return NextResponse.json({ message: 'Failed to update post status' }, { status: 400 });
      }
    
      return NextResponse.json({ message: 'Post status updated to active' }, { status: 200 });
    } catch (error) {
      console.error('Error updating post status:', error);
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      return NextResponse.json({ message: 'Server error', error: message }, { status: 500 });
    }
  }
  
  export async function DELETE(req: Request) {
    try {
      const { searchParams } = new URL(req.url);
      const postId = searchParams.get('postId');
  
      if (!postId) {
        return NextResponse.json({ message: 'Post ID is required' }, { status: 400 });
      }
  
      const client = await clientPromise;
      const db = client.db();
      const postsCollection = db.collection('posts');
  
      // Xóa bài viết từ database
      const result = await postsCollection.deleteOne({ _id: new ObjectId(postId) });
  
      if (result.deletedCount === 0) {
        return NextResponse.json({ message: 'Post not found or could not be deleted' }, { status: 404 });
      }
  
      return NextResponse.json({ message: 'Post deleted successfully' }, { status: 200 });
    } catch (error) {
      console.error('Error deleting post:', error);
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      return NextResponse.json({ message: 'Server error', error: message }, { status: 500 });
    }
  }
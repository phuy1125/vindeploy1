  import { NextResponse } from 'next/server';
  import formidable, { File as FormidableFile, Files } from 'formidable';
  import path from 'path';
  import fs from 'fs';
  import clientPromise from '../../../lib/mongodb';
  import { Readable } from 'stream';
  import type { IncomingMessage } from 'http';

  export const config = {
    api: {
      bodyParser: false, // Disable Next.js default body parser
    },
  };
  

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
            const location = JSON.parse(locationRaw);
            const tags = tagsRaw.split(',').map((tag) => tag.trim());

            const newPost = {
              title,
              content,
              author_id,
              location,
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
    const client = await clientPromise;
    const db = client.db();
    const { searchParams } = new URL(req.url);
    const locationId = searchParams.get("location_id");
  
    let query = {};
  
    if (locationId) {
      query = { locationRaw: locationId };
    }
  
    const posts = await db.collection("posts").find(query).toArray();
  
    return Response.json(posts);
  }


import { NextRequest, NextResponse } from 'next/server';
import { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import formidable, { File as FormidableFile, Files } from 'formidable';
import path from 'path';
import fs from 'fs';
import { Readable } from 'stream';
import type { IncomingMessage } from 'http';


 
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ message: 'ID không hợp lệ' }, { status: 400 });
    }

    // Kết nối đến MongoDB
    const client = await clientPromise;
    const db = client.db();
    const locationsCollection = db.collection('locations');

    // Tìm địa điểm theo ID
    const location = await locationsCollection.findOne({ _id: new ObjectId(id) });

    if (!location) {
      return NextResponse.json({ message: 'Không tìm thấy địa điểm' }, { status: 404 });
    }

    // Trả về thông tin địa điểm
    return NextResponse.json(location);
  } catch (error) {
    console.error('Lỗi khi lấy thông tin địa điểm:', error);
    const message = error instanceof Error ? error.message : 'Lỗi không xác định';
    return NextResponse.json({ message: 'Không thể lấy thông tin địa điểm', error: message }, { status: 500 });
  }
}
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('locations');

    const { id } = await params;
    
    // Kiểm tra nếu id không hợp lệ
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'ID không hợp lệ' }, { status: 400 });
    }

    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Không tìm thấy địa điểm cần xóa.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Địa điểm đã được xóa thành công.' }, { status: 200 });
  } catch (error) {
    console.error('[DELETE /api/locations/:id]', error);
    return NextResponse.json({ error: 'Lỗi server.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, context: { params: { id: string } }) {
  try {
    const { id } = await context.params;  // Đảm bảo await params
    const { name, description, coordinates } = await req.json();

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'ID không hợp lệ' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('locations');

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { name, description, coordinates } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Không tìm thấy địa điểm cần cập nhật.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Địa điểm đã được cập nhật thành công.' }, { status: 200 });
  } catch (error) {
    console.error('[PUT /api/locations/:id]', error);
    return NextResponse.json({ error: 'Lỗi server.' }, { status: 500 });
  }
}


export const config = {
  api: {
    bodyParser: false, // Disable Next.js default body parser
  },
};

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params; // id được lấy từ URL params
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ message: 'Invalid location ID' }, { status: 400 });
    }

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
          const name = Array.isArray(fields.name) ? fields.name[0] : fields.name ?? '';
          const description = Array.isArray(fields.description) ? fields.description[0] : fields.description ?? '';
          const description_history = Array.isArray(fields.description_history) ? fields.description_history[0] : fields.description_history ?? '';
          const address = Array.isArray(fields.address) ? fields.address[0] : fields.address ?? '';
          const openTime = Array.isArray(fields.openTime) ? fields.openTime[0] : fields.openTime ?? '';
          const price = Array.isArray(fields.price) ? fields.price[0] : fields.price ?? '';
          const streetViewUrlsRaw = Array.isArray(fields.streetViewUrls) ? fields.streetViewUrls[0] : fields.streetViewUrls ?? '[]';
          const tagsRaw = Array.isArray(fields.tags) ? fields.tags[0] : fields.tags ?? '';
          
          const streetViewUrls = typeof streetViewUrlsRaw === 'string' ? JSON.parse(streetViewUrlsRaw) : streetViewUrlsRaw;
          const tags = typeof tagsRaw === 'string' ? tagsRaw.split(',').map((tag) => tag.trim()) : tagsRaw;

          const updateData: Record<string, any> = {
            name,
            description,
            description_history,
            address,
            openTime,
            price,
            streetViewUrls,
            tags,
          };

          // Process image uploads
          // Normalize files.image into an array of FormidableFile
          const imageField = files.image;
          const images: FormidableFile[] = [];
          if (Array.isArray(imageField)) {
            images.push(...imageField);
          } else if (imageField) {
            images.push(imageField);
          }

          if (images.length > 0) {
            // Process each image
            const imageUrls: string[] = [];
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
                imageUrls.push(`/uploads/${filename}`);
              } else {
                console.error('No filepath for image:', image);
              }
            }

            // Update the image field with new URLs
            if (imageUrls.length > 0) {
              updateData.image = imageUrls;
            }
          }

          // Update location in MongoDB
          const client = await clientPromise;
          const db = client.db();
          const locationsCollection = db.collection('locations');

          const result = await locationsCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
          );

          if (result.modifiedCount === 0) {
            return resolve(
              NextResponse.json({ message: 'Location not found or no changes made' }, { status: 404 })
            );
          }

          return resolve(
            NextResponse.json({ message: 'Location updated successfully', data: updateData }, { status: 200 })
          );
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
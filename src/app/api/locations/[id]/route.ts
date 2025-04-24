import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';

 
  export async function GET(req: NextRequest, context: { params: { id: string } }) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('locations');
    const { id } = await context.params;  // Đảm bảo await params
  const location = await collection.findOne({ _id: new ObjectId(id) });

    if (!location) {
      return NextResponse.json({ error: 'Không tìm thấy địa điểm.' }, { status: 404 });
    }

    return NextResponse.json({ data: location }, { status: 200 });
  } catch (error) {
    console.error('[GET /api/locations/:id]', error);
    return NextResponse.json({ error: 'Lỗi server.' }, { status: 500 });
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

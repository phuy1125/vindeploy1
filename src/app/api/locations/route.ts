import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb'; 

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const gidParam = url.searchParams.get('gid');

  if (!gidParam) {
    return NextResponse.json({ error: 'Missing province gid' }, { status: 400 });
  }

  const gid = parseInt(gidParam, 10);
  if (isNaN(gid)) {
    return NextResponse.json({ error: 'Invalid province gid' }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db(); // lấy db từ URI: mongodb://localhost:27017/testbando
    const collection = db.collection('locations');

    const locations = await collection.find({ provinceGid: gid }).toArray();

    return NextResponse.json({ data: locations }, { status: 200 });
  } catch (error) {
    console.error('[LOCATIONS API ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

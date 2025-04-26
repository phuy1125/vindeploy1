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
export async function POST(req: NextRequest) {
  try {
    // Get the data from the request body
    const { lat, lng, provinceGid } = await req.json();

    if (!lat || !lng || !provinceGid) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();  // Connect to the MongoDB database
    const collection = db.collection('locations');  // Access the locations collection

    // Create a new location document
    const newLocation = {
      coordinates: { lat, lng },
      provinceGid,
    };

    // Insert the new location document into the collection
    const result = await collection.insertOne(newLocation);

    // Retrieve the inserted document using insertedId
    const insertedDocument = await collection.findOne({ _id: result.insertedId });

    // Return the inserted document as a response
    return NextResponse.json({ data: insertedDocument }, { status: 201 });

  } catch (error) {
    console.error('[ADD LOCATION API ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

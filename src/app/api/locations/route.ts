//src\app\api\locations\route.ts
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb'; 
import { ObjectId } from 'mongodb';
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const idParam = url.searchParams.get('id');
  const gidParam = url.searchParams.get('gid') || url.searchParams.get('provinceGid'); // ✅ Ưu tiên gid hoặc provinceGid

  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('locations');

    if (idParam) {
      // 🔥 Nếu có id => tìm chi tiết 1 location
      const location = await collection.findOne({ _id: new ObjectId(idParam) });

      if (!location) {
        return NextResponse.json({ error: 'Location not found' }, { status: 404 });
      }

      return NextResponse.json({ data: location }, { status: 200 });
    }

    if (gidParam) {
      // 🔥 Nếu có gid => tìm danh sách locations theo provinceGid
      const gid = parseInt(gidParam, 10);
      if (isNaN(gid)) {
        return NextResponse.json({ error: 'Invalid province gid' }, { status: 400 });
      }

      const locations = await collection.find({ provinceGid: gid }).toArray();

      // ✨ enrich thêm slug nếu cần
      const enrichedLocations = locations.map((loc) => ({
        ...loc,
        slug: loc.slug || loc.tags?.[0] || "",
      }));

      return NextResponse.json({ data: enrichedLocations }, { status: 200 });
    }

    // ❌ Nếu không có id hoặc gid
    return NextResponse.json({ error: 'Missing query parameters' }, { status: 400 });

  } catch (error) {
    console.error('[LOCATIONS GET API ERROR]', error);
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

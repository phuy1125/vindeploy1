import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
//bang_fix
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const client = new MongoClient(uri);

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const gid = pathParts[pathParts.length - 1];

    console.log('Received gid:', gid);

    await client.connect();
    const database = client.db('Vintellitour');
    const provinces = database.collection('provinces');

    // Option 1: Test cả kiểu string và number
    const numericGid = parseInt(gid);
    const query = isNaN(numericGid)
      ? { id_map: gid } // gid là string
      : {
          $or: [
            { id_map: numericGid }, // nếu là number
            { id_map: gid },        // nếu lưu là string
          ]
        };

    console.log('Query condition:', query);

    const province = await provinces.findOne(query);
    console.log('Result from DB:', province);

    if (!province) {
      return NextResponse.json(
        { error: 'Province not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(province);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

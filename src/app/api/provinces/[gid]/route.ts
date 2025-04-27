// src\app\api\provinces\[gid]\route.ts


import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';



interface Province {
    _id: number; // 👈 _id kiểu number (khác với mặc định ObjectId)
    name: string;
    description: string;
    cuisine: {
      title: string;
      description: string;
    };
    culture: {
      title: string;
      description: string;
    };
  }

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const gid = pathParts[pathParts.length - 1];

    console.log('Received gid:', gid);

    const numericGid = parseInt(gid);

    const client = await clientPromise;
    const db = client.db('Vintellitour');
    const provinces = db.collection<Province>('provinces'); 
    // 👆 khai báo rõ collection có kiểu Province, tránh lỗi type

    const province = await provinces.findOne({ _id: numericGid });

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
  }
}

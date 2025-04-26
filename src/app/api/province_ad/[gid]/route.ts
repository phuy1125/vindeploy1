import { NextResponse } from 'next/server';
import clientPromise from '@lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(req: Request, { params }: { params: { gid: string } }) {
  const { gid } = params;

  try {
    const client = await clientPromise;
    const db = client.db();
    
    // First try to find the province by numeric ID
    let province;
    let numericGid;
    
    try {
      // Try to convert gid to a number
      numericGid = parseInt(gid, 10);
      if (!isNaN(numericGid)) {
        province = await db.collection('provinces').findOne({ _id: numericGid });
      }
    } catch (err) {
      console.log("Error converting ID to number:", err);
    }
    
    // If not found by numeric ID, try by name or slug
    if (!province) {
      province = await db.collection('provinces').findOne({ 
        $or: [
          { name: gid },
          { slug: gid }
        ]
      });
    }
    
    if (!province) {
      return NextResponse.json({ error: "Province not found" }, { status: 404 });
    }

    // Find all locations associated with this province
    const locations = await db.collection('locations').find({ 
      provinceGid: province._id
    }).toArray();
    
    // Return province data with its locations
    return NextResponse.json({
      ...province,
      locations,
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Error fetching data" }, { status: 500 });
  }
}


export async function POST(req: Request, { params }: { params: { gid: string } }) {
  const { gid } = params;
  const { name, description, culture, cuisine } = await req.json(); // Get the updated data from the request body

  if (!name || !description) {
    return NextResponse.json({ message: "Name and description are required" }, { status: 400 });
  }

  // Optionally validate the culture and cuisine fields
  if (culture && (!culture.title || !culture.description)) {
    return NextResponse.json({ message: "Culture title and description are required" }, { status: 400 });
  }

  if (cuisine && (!cuisine.title || !cuisine.description)) {
    return NextResponse.json({ message: "Cuisine title and description are required" }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    
    // Try to find the province by its numeric ID
    let province;
    
    try {
      const numericGid = parseInt(gid, 10);
      if (!isNaN(numericGid)) {
        province = await db.collection('provinces').findOne({ _id: numericGid });
      }
    } catch (err) {
      console.log("Error converting ID to number:", err);
    }

    // If province is not found by numeric ID, return an error
    if (!province) {
      return NextResponse.json({ message: "Province not found" }, { status: 404 });
    }

    // Prepare the update data
    const updateData: any = {
      name,
      description,
    };

    // Include culture and cuisine if they are provided
    if (culture) {
      updateData.culture = culture;
    }

    if (cuisine) {
      updateData.cuisine = cuisine;
    }

    // Update the province in the database
    const result = await db.collection("provinces").updateOne(
      { _id: province._id }, // Match the province by its ObjectId
      {
        $set: updateData,
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "Province not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Province updated successfully" });
  } catch (error) {
    console.error("Error updating province:", error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}

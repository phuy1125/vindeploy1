// src/app/api/attractions/[slug]/route.ts

import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb"; // 🔥 Thêm import ObjectId

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const client = await clientPromise;
    const db = client.db();

    // 🔥 Tìm location theo _id (phải convert ObjectId)
    const location = await db.collection("locations").findOne({
      _id: new ObjectId(params.slug)
    });

    if (!location) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 }
      );
    }

    // 🔥 Enrich tabs từ dữ liệu location
    const enrichedLocation = {
      ...location,
      image: location.image?.[0] || "/img/VN.jpg", // Lấy ảnh đại diện
      slug: params.slug, // Trả luôn slug (chính là _id)
      tabs: [
        {
          id: "overview",
          label: "Tổng quan",
          content: {
            title: "Giới thiệu",
            description: location.description || "Đang cập nhật mô tả địa điểm.",
            image: location.image?.[0] || "/img/VN.jpg"
          }
        },
        {
          id: "history",
          label: "Lịch sử",
          content: {
            title: "Lịch sử phát triển",
            description: location.description_history || "Chưa có thông tin lịch sử.",
            items: [
              "Gắn liền với lịch sử phát triển địa phương",
              "Điểm đến mang đậm dấu ấn văn hóa",
              "Địa danh nổi bật khu vực"
            ],
            image: location.image?.[0] || "/img/VN.jpg"
          }
        },
        {
          id: "streetview",
          label: "Street View & 360°",
          content: {
            title: "Khám phá 360°",
            description: "Trải nghiệm toàn cảnh 360° sống động.",
            streetViewUrl: location.streetViewUrls || [],
            panoramaUrl: location.image?.[0] || "/img/test.png"
          }
        }
      ]
    };

    return NextResponse.json(enrichedLocation);

  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

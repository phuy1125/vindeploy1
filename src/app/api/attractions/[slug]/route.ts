import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const client = await clientPromise;
    const db = client.db("Vintellitour");

    // Find the province that contains the attraction
    const province = await db.collection("provinces").findOne(
      { "attractions.slug": params.slug },
      {
        projection: {
          "attractions.$": 1
        }
      }
    );

    if (!province || !province.attractions || !province.attractions[0]) {
      return NextResponse.json(
        { error: "Attraction not found" },
        { status: 404 }
      );
    }

    // Get the matched attraction
    const attraction = province.attractions[0];

    // Add tabs data based on the attraction
    const enrichedAttraction = {
      ...attraction,
      tabs: [
        {
          id: "overview",
          label: "Tổng quan",
          content: {
            title: "Giới thiệu",
            description: attraction.description,
            image: attraction.image || "/img/VN.jpg"
          }
        },
        {
          id: "history",
          label: "Lịch sử",
          content: {
            title: "Lịch sử phát triển",
            description: "Địa điểm này có một lịch sử phát triển lâu đời, gắn liền với sự phát triển của Thủ đô Hà Nội.",
            items: [
              "Được xây dựng từ thời kỳ lịch sử",
              "Trải qua nhiều giai đoạn phát triển",
              "Là chứng nhân của nhiều sự kiện lịch sử quan trọng"
            ],
            image: "/img/VN.jpg"
          }
        },
        {
          id: "streetview",
          label: "Street View & 360°",
          content: {
            title: "Khám phá 360°",
            description: "Trải nghiệm địa điểm này qua góc nhìn 360° và Street View:",
            items: [
              "Xem toàn cảnh địa điểm từ mọi góc độ",
              "Khám phá chi tiết kiến trúc và cảnh quan",
              "Trải nghiệm như đang thực tế tại địa điểm"
            ],
            streetViewUrl: attraction.streetViewUrls || [],
            panoramaUrl: "/img/test.png"
          }
        }
      ]
    };

    return NextResponse.json(enrichedAttraction);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

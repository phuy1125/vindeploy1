import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const client = await clientPromise;
    const db = client.db("Vintellitour");

    // Find the province that contains the attraction with the given slug
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
          id: "visit",
          label: "Tham quan",
          content: {
            title: "Thông tin tham quan",
            description: "Thông tin hữu ích khi tham quan địa điểm này:",
            items: [
              "Mở cửa: 6:00 - 22:00 hàng ngày",
              "Giá vé: Miễn phí",
              "Thời gian tham quan lý tưởng: 1-2 giờ",
              "Nên đi vào buổi sáng sớm hoặc chiều tối"
            ]
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

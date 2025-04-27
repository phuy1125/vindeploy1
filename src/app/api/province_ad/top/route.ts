import { NextResponse } from "next/server";
import { getTopProvinces } from "@lib/CareLikeComment/provinceEngagement";

export async function GET() {
  try {
    const provinces = await getTopProvinces();
    return NextResponse.json(provinces);
  } catch (error: any) {
    console.error("🔥🔥🔥 API lỗi rồi:", error);  // IN ERROR RA
    return NextResponse.json(
      { error: "Failed to fetch provinces data", message: error?.message, stack: error?.stack },
      { status: 500 }
    );
  }
}

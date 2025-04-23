import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export interface AuthRequest extends NextRequest {
  user?: {
    userId: string;
  };
}

export async function authMiddleware(req: NextRequest) {
  try {
    // Đường dẫn không cần xác thực
    const publicPaths = ["/api/auth/login", "/api/auth/register", "/login", "/register", "/","/admin/locations"];
    const path = req.nextUrl.pathname;
    
    // Nếu là đường dẫn public thì cho đi tiếp
    if (publicPaths.includes(path)) {
      return NextResponse.next();
    }
    
    // Lấy token từ cookie
    const token = req.cookies.get("auth_token")?.value;
    
    if (!token) {
      // Nếu là API request, trả về lỗi 401
      if (path.startsWith("/api/")) {
        return new NextResponse(
          JSON.stringify({ message: "Không có quyền truy cập" }),
          { status: 401, headers: { "content-type": "application/json" } }
        );
      }
      
      // Nếu là page request, chuyển hướng về trang login
      return NextResponse.redirect(new URL("/login", req.url));
    }
    
    // Kiểm tra token hợp lệ
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    
    // Tạo request mới với thông tin user
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-id", payload.userId as string);
    
    // Trả về response với headers mới
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    
  } catch (error) {
    // Nếu token không hợp lệ hoặc hết hạn
    const path = req.nextUrl.pathname;
    
    // Nếu là API request, trả về lỗi 401
    if (path.startsWith("/api/")) {
      return new NextResponse(
        JSON.stringify({ message: "Token không hợp lệ hoặc đã hết hạn" }),
        { status: 401, headers: { "content-type": "application/json" } }
      );
    }
    
    // Nếu là page request, chuyển hướng về trang login
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

// Để sử dụng middleware này, tạo file middleware.ts ở thư mục gốc của dự án
// Với nội dung:
// export { authMiddleware as middleware } from "./path/to/authMiddleware";
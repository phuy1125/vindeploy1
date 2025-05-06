import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export interface AuthRequest extends NextRequest {
  user?: {
    userId: string;
  };
}

export async function authMiddleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // ✅ Ưu tiên xử lý route /admin
  if (path.startsWith("/admin")) {
    const adminToken = req.cookies.get("admin_auth_token")?.value;
    if (!adminToken) {
      return NextResponse.redirect(new URL("/admin-login", req.url));
    }

    try {
      const adminSecret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(adminToken, adminSecret); // ✅ Hợp lệ thì cho qua
      return NextResponse.next();
    } catch (err) {
      return NextResponse.redirect(new URL("/admin-login", req.url));
    }
  }

  try {
    // ✅ Các đường public
    const publicPaths = [
      "/api/auth/login",
      "/api/auth/register",
      "/login", "/register", "/",
      "/admin/locations",
      "/admin-login"
    ];
    if (publicPaths.includes(path)) {
      return NextResponse.next();
    }

    // ✅ Lấy token người dùng thường
    const token = req.cookies.get("auth_token")?.value;
    if (!token) {
      if (path.startsWith("/api/")) {
        return new NextResponse(
          JSON.stringify({ message: "Không có quyền truy cập" }),
          { status: 401, headers: { "content-type": "application/json" } }
        );
      }
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // ✅ Kiểm tra token người dùng
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-id", payload.userId as string);

    return NextResponse.next({ request: { headers: requestHeaders } });

  } catch (error) {
    if (path.startsWith("/api/")) {
      return new NextResponse(
        JSON.stringify({ message: "Token không hợp lệ hoặc đã hết hạn" }),
        { status: 401, headers: { "content-type": "application/json" } }
      );
    }

    return NextResponse.redirect(new URL("/login", req.url));
  }
}

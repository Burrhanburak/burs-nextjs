import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const protectedRoutes = [
  "/user/dashboard",
  "/user/profile",
  "/user/applications",
  "/user/notifications",
  "/user/scholarships",
  "/user/documents",
];

const adminRoutes = [
  "/admin",
  "/admin/dashboard",
  "/admin/applications",
  "/admin/interviews",
  "/admin/notifications",
  "/admin/documents",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Token alınması
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET!,
    secureCookie: process.env.NEXTAUTH_URL?.startsWith("https://"),
  });
  
  // Sadece debug için
  console.log("Middleware Çalıştı:", { path: pathname, role: token?.role });

  // 1. Auth sayfalarına giriş yapılmışsa, role göre yönlendirme
  if (pathname.startsWith("/auth")) {
    if (token) {
      const redirectPath = token.role === "ADMIN" ? "/admin/dashboard" : "/user/dashboard";
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }
    return NextResponse.next();
  }

  // 2. Admin rotaları için kontrol
  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    if (!token) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (token.role !== "ADMIN") {
      console.log("Admin erişim reddedildi - Rol:", token.role);
      return NextResponse.redirect(new URL("/user/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // 3. Kullanıcı rotaları için kontrol
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!token) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 4. Diğer tüm rotalar
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|_static|_vercel|[\\w-]+\\.\\w+).*)"],
};
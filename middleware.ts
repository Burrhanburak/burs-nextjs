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

  // Static resource paths - skip middleware processing
  if (pathname.includes('.svg') || 
      pathname.includes('.png') || 
      pathname.includes('.jpg') || 
      pathname.includes('.css') || 
      pathname.includes('.js') ||
      pathname.includes('favicon.ico')) {
    return NextResponse.next();
  }

  // Token alınması
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET!,
    secureCookie: process.env.NEXTAUTH_URL?.startsWith("https://"),
  });
  
  // Debug için daha detaylı log
  console.log("Middleware Çalıştı:", { 
    path: pathname, 
    role: token?.role, 
    isAuthenticated: !!token,
    tokenKeys: token ? Object.keys(token) : null,
    tokenJSON: token ? JSON.stringify(token) : null
  });

  // 1. Auth sayfalarına giriş yapılmışsa, role göre yönlendirme
  if (pathname.startsWith("/auth")) {
    if (token) {
      const redirectPath = token.role === "ADMIN" ? "/admin/dashboard" : "/user/dashboard";
      console.log(`Auth sayfasından yönlendirme: ${redirectPath}, token:`, JSON.stringify(token));
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }
    return NextResponse.next();
  }

  // 2. Admin rotaları için kontrol
  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    if (!token) {
      console.log("Admin erişimi için oturum açılmamış");
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    console.log("Admin token check:", { 
      role: token.role, 
      isAdmin: token.role === "ADMIN",
      tokenStr: JSON.stringify(token)
    });
    
    if (token.role !== "ADMIN") {
      console.log(`Admin erişim reddedildi - Rol: ${token.role}`);
      return NextResponse.redirect(new URL("/user/dashboard", request.url));
    }
    
    console.log("Admin erişimi onaylandı");
    return NextResponse.next();
  }

  // 3. Kullanıcı rotaları için kontrol
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!token) {
      console.log("Kullanıcı erişimi için oturum açılmamış");
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    console.log(`Kullanıcı erişimi onaylandı - Rol: ${token.role}`);
    return NextResponse.next();
  }

  // 4. Ana sayfa yönlendirmesi - giriş yapıldıysa rolüne göre dashboard'a yönlendir
  if (pathname === "/") {
    if (token) {
      const redirectPath = token.role === "ADMIN" ? "/admin/dashboard" : "/user/dashboard";
      console.log(`Ana sayfadan yönlendirme: ${redirectPath}`);
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }
  }

  // 5. Diğer tüm rotalar
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|_static|_vercel|[\\w-]+\\.\\w+).*)"],
};
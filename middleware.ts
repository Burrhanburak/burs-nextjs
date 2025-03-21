import { NextResponse } from "next/server" 
import type { NextRequest } from "next/server" 
import { getToken } from "next-auth/jwt"  

const protectedRoutes = [
  "/user/dashboard",
  "/user/profile",
  "/user/applications",
  "/user/notifications",
  "/user/scholarships",
  "/user/documents", 
]  

const adminRoutes = [
  "/admin",
  "/admin/dashboard",
  "/admin/applications",
  "/admin/interviews",
  "/admin/notifications",
  "/admin/documents", 
]  

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl  
  // const token = await getToken({ req: request, secret: process.env.AUTH_SECRET })
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET!,
    secureCookie: process.env.NEXTAUTH_URL?.startsWith("https://"),
  });
  const session = token // Session ve token aynı yapıda

    // 1. Debug için (Production'da kapatın)
    if (protectedRoutes.some(route => pathname.startsWith(route)) || 
        adminRoutes.some(route => pathname.startsWith(route)) || 
        process.env.NODE_ENV === 'development') {
      console.log('Middleware Çalıştı:', { path: pathname, role: token?.role })
    }
  // Debug için (production'da kaldırın)
  if (process.env.NODE_ENV === 'development') {
    console.log('Path:', pathname)
    console.log('Session:', session)
  }
   // 2. Admin rotaları için katı kontrol
   if (pathname.startsWith('/admin')) {
    if (!token) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
    
    if (token.role !== 'ADMIN') {
      console.log('Admin Erişim Reddedildi:', token.email)
      return NextResponse.redirect(new URL('/user/dashboard', request.url))
    }
    
    return NextResponse.next()
  }


  // 1. Auth sayfalarına erişim kontrolü
  if (pathname.startsWith("/auth")) {
    if (session) {
      const redirectPath = session.role === "ADMIN" 
        ? "/admin/dashboard" 
        : "/user/dashboard"
      return NextResponse.redirect(new URL(redirectPath, request.url))
    }
    return NextResponse.next()
  }

  // 2. Korumalı rotalar kontrolü
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!session) {
      const loginUrl = new URL("/auth/login", request.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // 3. Admin rotaları kontrolü
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    if (!session) {
      const loginUrl = new URL("/auth/login", request.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }
    
    if (session.role !== "ADMIN") {
      console.log('Admin erişim reddedildi - Rol:', session.role)
      return NextResponse.redirect(new URL("/user/dashboard", request.url))
    }
  }

  // 4. Tüm geçerli isteklere izin ver
  return NextResponse.next()
}  

export const config = {
  matcher: [
    "/((?!api|_next|_static|_vercel|[\\w-]+\\.\\w+).*)",
  ], 
}
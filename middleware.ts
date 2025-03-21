import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

// Define protected routes that require authentication
const protectedRoutes = [
  "/user/dashboard",
  "/user/profile",
  "/user/applications",
  "/user/notifications",
  "/user/scholarships",
  "/user/documents",
]

// Define admin routes
const adminRoutes = [
  "/admin",
  "/admin/login",
  "/admin/dashboard",
  "/admin/applications",
  "/admin/interviews",
  "/admin/notifications",
  "/admin/documents",
]

// Middleware without using auth() to fix the exec() error
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get session
  const session = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  })

  // Handle protected routes
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    // If not logged in, redirect to login
    if (!session) {
      const url = new URL("/auth/login", request.url)
      url.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(url)
    }

    // Temporarily disabled email verification check
    // to allow access to dashboard while fixing email verification
    /* 
    if (!session.emailVerified) {
      const url = new URL("/auth/verify", request.url)
      url.searchParams.set("email", session.email as string)
      return NextResponse.redirect(url)
    }
    */
  }

  // Handle admin routes
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    // If not logged in, redirect to admin login
    if (!session) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }

    // If not admin, redirect to dashboard
    if (session.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/user/dashboard", request.url))
    }
  }

  // If user is already logged in, redirect from auth pages to dashboard
  if (pathname.startsWith("/auth") && session) {
    return NextResponse.redirect(new URL("/user/dashboard", request.url))
  }

  return NextResponse.next()
}

// Add config for matcher
export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public) 
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    "/((?!api|_next|_static|_vercel|[\\w-]+\\.\\w+).*)",
  ],
} 
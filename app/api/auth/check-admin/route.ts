import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { 
          isAuthenticated: false,
          isAdmin: false,
          message: "Kullanıcı oturumu bulunamadı"
        },
        { status: 401 }
      )
    }
    
    // Check if user has admin role
    const isAdmin = session.user.role === 'ADMIN'
    
    return NextResponse.json({
      isAuthenticated: true,
      isAdmin,
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role
      }
    })
  } catch (error) {
    console.error("Admin check error:", error)
    return NextResponse.json(
      { 
        isAuthenticated: false,
        isAdmin: false,
        message: "Yetki kontrolü yapılırken bir hata oluştu"
      },
      { status: 500 }
    )
  }
} 
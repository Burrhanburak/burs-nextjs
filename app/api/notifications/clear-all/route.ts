import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/session"
import { db } from "@/lib/db"

export async function POST() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Delete all user notifications
    const result = await db.notification.deleteMany({
      where: {
        userId: user.id,
      },
    })

    return NextResponse.json({ 
      success: true, 
      deletedCount: result.count
    })
  } catch (error) {
    console.error("[NOTIFICATIONS_CLEAR_ALL]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 
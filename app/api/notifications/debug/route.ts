import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/session"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Get all user notifications
    const notifications = await db.notification.findMany({
      where: {
        userId: user.id,
      },
    })

    return NextResponse.json({ count: notifications.length, notifications })
  } catch (error) {
    console.error("[NOTIFICATIONS_DEBUG_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

// Delete notifications with specific text
export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { text } = body

    if (!text) {
      return new NextResponse("Text to search is required", { status: 400 })
    }

    // Find notifications containing the specific text
    const notifications = await db.notification.findMany({
      where: {
        userId: user.id,
        message: {
          contains: text,
        },
      },
    })

    // Delete them
    if (notifications.length > 0) {
      await db.notification.deleteMany({
        where: {
          id: {
            in: notifications.map(n => n.id),
          },
        },
      })
    }

    return NextResponse.json({ 
      deleted: notifications.length,
      notifications 
    })
  } catch (error) {
    console.error("[NOTIFICATIONS_DEBUG_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 
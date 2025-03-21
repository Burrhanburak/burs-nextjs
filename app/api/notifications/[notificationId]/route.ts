import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/session"
import { db } from "@/lib/db"

export async function PATCH(
  req: Request,
  { params }: { params: { notificationId: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const notificationId = params.notificationId
    
    const body = await req.json()
    
    if (!notificationId) {
      return new NextResponse("Notification ID is required", { status: 400 })
    }

    const notification = await db.notification.update({
      where: {
        id: notificationId,
        userId: user.id,
      },
      data: {
        read: body.read || true,
      },
    })

    return NextResponse.json(notification)
  } catch (error) {
    console.error("[NOTIFICATION_PATCH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 
import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/session"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const documents = await db.document.findMany({
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        scholarshipApplication: {
          include: {
            application: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(documents)
  } catch (error) {
    console.error("[ADMIN_DOCUMENTS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { documentId, status, rejectionReason } = body

    if (!documentId || !status) {
      return new NextResponse("Document ID and status are required", { status: 400 })
    }

    const document = await db.document.update({
      where: {
        id: documentId,
      },
      data: {
        status,
        rejectionReason: status === "REJECTED" ? rejectionReason : null,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            tcKimlikNo: true,
          },
        },
        scholarshipApplication: {
          include: {
            application: true,
          },
        },
      },
    })

    // Create notification for the user
    await db.notification.create({
      data: {
        userId: document.userId,
        message: `Belgenizin durumu güncellendi: ${status}`,
        type: "DOCUMENT_STATUS",
      },
    })

    return NextResponse.json(document)
  } catch (error) {
    console.error("[ADMIN_DOCUMENTS_PATCH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}


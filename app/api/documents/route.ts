import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/session"
import { db } from "@/lib/db"
import { DocumentStatus } from "@prisma/client"

// GET /api/documents - Get all documents for the current user
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const documents = await db.document.findMany({
      where: {
        userId: user.id,
      },
      include: {
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
    console.error("[DOCUMENTS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { url, type, scholarshipApplicationId } = body

    if (!url || !type) {
      return new NextResponse("URL and type are required", { status: 400 })
    }

    const document = await db.document.create({
      data: {
        url,
        type,
        userId: user.id,
        scholarshipApplicationId,
        status: DocumentStatus.PENDING,
      },
      include: {
        scholarshipApplication: {
          include: {
            application: true,
          },
        },
      },
    })

    return NextResponse.json(document)
  } catch (error) {
    console.error("[DOCUMENTS_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await request.json()
    const { documentId, status, rejectionReason } = body

    if (!documentId || !status) {
      return new NextResponse("Document ID and status are required", { status: 400 })
    }

    const document = await db.document.update({
      where: { id: documentId },
      data: {
        status: status as DocumentStatus,
        rejectionReason: status === DocumentStatus.REJECTED ? rejectionReason : null,
        verificationDate: new Date(),
      },
      include: {
        scholarshipApplication: {
          include: {
            application: true,
          },
        },
      },
    })

    return NextResponse.json(document)
  } catch (error) {
    console.error("[DOCUMENTS_PATCH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}


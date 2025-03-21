import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

// GET /api/documents/required - Get all required documents
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const requiredDocuments = await db.requiredDocument.findMany({
      where: {
        isRequired: true,
      },
      select: {
        id: true,
        type: true,
        name: true,
        description: true,
      },
      orderBy: {
        name: "asc",
      },
    })

    // Format the required documents
    const formattedDocuments = requiredDocuments.map((doc) => ({
      id: doc.id,
      type: doc.type,
      name: doc.name,
      description: doc.description,
    }))

    return NextResponse.json(formattedDocuments)
  } catch (error) {
    console.error("[REQUIRED_DOCUMENTS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 
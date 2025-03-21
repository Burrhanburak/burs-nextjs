import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/session"
import { db } from "@/lib/db"

// DELETE /api/documents/[id] - Delete a document
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check if user is authenticated
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const documentId = params.id

    // Get document
    const document = await db.document.findUnique({
      where: { id: documentId },
    })

    if (!document) {
      return NextResponse.json({ error: "Belge bulunamadı." }, { status: 404 })
    }

    // Check if the document belongs to the current user
    if (document.userId !== user.id) {
      return NextResponse.json({ error: "Bu belgeyi silme yetkiniz yok." }, { status: 403 })
    }

    // Check if the document is already approved
    if (document.status === "APPROVED") {
      return NextResponse.json({ error: "Onaylanmış belgeler silinemez." }, { status: 400 })
    }

    // Delete document
    await db.document.delete({
      where: { id: documentId },
    })

    return NextResponse.json({ success: true, message: "Belge başarıyla silindi." })
  } catch (error) {
    console.error("Error deleting document:", error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Bir hata oluştu." 
    }, { status: 500 })
  }
}


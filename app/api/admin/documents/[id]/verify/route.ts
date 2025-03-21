import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { PrismaClient, DocumentStatus, ApplicationStatus } from "@prisma/client"
import { sendDocumentStatusEmail } from "@/lib/services/email-service"

const prisma = new PrismaClient()

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check if user is authenticated and is an admin
    const session = await getServerSession()

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const documentId = params.id

    // Get request body
    const body = await request.json()
    const { status, rejectionReason } = body

    // Validate status
    if (status !== "approved" && status !== "rejected") {
      return NextResponse.json({ error: "Geçersiz durum." }, { status: 400 })
    }

    // If status is rejected, rejection reason is required
    if (status === "rejected" && !rejectionReason) {
      return NextResponse.json({ error: "Red nedeni belirtilmelidir." }, { status: 400 })
    }

    // Get document
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: { user: true },
    })

    if (!document) {
      return NextResponse.json({ error: "Belge bulunamadı." }, { status: 404 })
    }

    // Update document
    const updatedDocument = await prisma.document.update({
      where: { id: documentId },
      data: {
        status: status as DocumentStatus,
        verifiedBy: session.user.id,
        rejectionReason: status === "rejected" ? rejectionReason : null,
      },
    })

    // Send email notification
    await sendDocumentStatusEmail({
      to: document.user.email,
      firstName: document.user.firstName,
      documentName: document.user.firstName, // Using firstName as documentName
      status: status as "approved" | "rejected",
      rejectionReason: rejectionReason,
      dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/documents`,
    })

    // Check if all documents are approved for this user
    if (status === "approved") {
      const userDocuments = await prisma.document.findMany({
        where: { userId: document.userId },
      })

      const allApproved = userDocuments.every((doc) => doc.status === "approved")

      if (allApproved && userDocuments.length >= 4) {
        // Assuming 4 required documents
        // Update application status to document_review
        await prisma.scholarshipApplication.updateMany({
          where: {
            userId: document.userId,
            status: "PRE_APPROVED" as ApplicationStatus,
          },
          data: { status: "DOCUMENTS_APPROVED" as ApplicationStatus },
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Belge başarıyla ${status === "approved" ? "onaylandı" : "reddedildi"}.`,
      document: updatedDocument,
    })
  } catch (error) {
    console.error("Error verifying document:", error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Bir hata oluştu." 
    }, { status: 500 })
  }
}


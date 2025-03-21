import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"
import { sendApplicationStatusEmail } from "@/lib/services/email-service"

const prisma = new PrismaClient()

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check if user is authenticated and is an admin
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const interviewId = params.id

    // Get request body
    const body = await request.json()
    const { result, notes } = body

    // Validate result
    if (result !== "approved" && result !== "rejected") {
      return NextResponse.json({ error: "Geçersiz sonuç." }, { status: 400 })
    }

    // Get interview
    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
      include: {
        application: true,
        user: true,
      },
    })

    if (!interview) {
      return NextResponse.json({ error: "Mülakat bulunamadı." }, { status: 404 })
    }

    // Update interview
    const updatedInterview = await prisma.interview.update({
      where: { id: interviewId },
      data: {
        status: "completed",
        result,
        resultNotes: notes,
      },
    })

    // Update application status
    await prisma.scholarshipApplication.update({
      where: { id: interview.applicationId },
      data: {
        status: result,
        approvalDate: result === "approved" ? new Date() : null,
        rejectionDate: result === "rejected" ? new Date() : null,
        rejectionReason: result === "rejected" ? notes : null,
      },
    })

    // Update user status if approved
    if (result === "approved") {
      await prisma.user.update({
        where: { id: interview.userId },
        data: { status: "active" },
      })
    }

    // Send email notification
    await sendApplicationStatusEmail({
      to: interview.user.email,
      firstName: interview.user.firstName,
      status: result as "approved" | "rejected",
      rejectionReason: result === "rejected" ? notes : undefined,
      dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    })

    return NextResponse.json({
      success: true,
      message: `Mülakat sonucu başarıyla kaydedildi ve başvurana bildirim gönderildi.`,
      interview: updatedInterview,
    })
  } catch (error: any) {
    console.error("Error recording interview result:", error)
    return NextResponse.json({ error: error.message || "Bir hata oluştu." }, { status: 500 })
  }
}


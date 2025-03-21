import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { PrismaClient, ApplicationStatus, UserRole } from "@prisma/client"
import { sendApplicationStatusEmail } from "@/lib/services/email-service"

const prisma = new PrismaClient()

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check if user is authenticated and is an admin
    const session = await auth()

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
        status: result as ApplicationStatus,
        ...(result === "approved" ? { approvalDate: new Date() } : {}),
        ...(result === "rejected" ? { rejectionDate: new Date() } : {}),
        ...(result === "rejected" ? { rejectionReason: notes } : {}),
      },
    })

    // Update user status if approved
    if (result === "approved") {
      await prisma.user.update({
        where: { id: interview.userId },
        data: { 
          role: "USER" as UserRole 
        },
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
  } catch (error) {
    console.error("Error updating interview result:", error);
    return NextResponse.json(
      { 
        error: "Failed to update interview result",
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}


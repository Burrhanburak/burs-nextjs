import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"
import { sendInterviewInvitationEmail } from "@/lib/services/email-service"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { getInterviews } from "@/lib/server-actions"

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    // Check if user is authenticated and is an admin
    const session = await auth()

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get request body
    const body = await request.json()
    const { applicantId, date, time, location, notes } = body

    // Validate required fields
    if (!applicantId || !date || !time || !location) {
      return NextResponse.json({ error: "Tüm zorunlu alanları doldurunuz." }, { status: 400 })
    }

    // Get application
    const application = await prisma.scholarshipApplication.findFirst({
      where: {
        userId: applicantId,
        status: "document_review",
      },
      include: { user: true },
    })

    if (!application) {
      return NextResponse.json({ error: "Başvuru bulunamadı veya belge inceleme aşamasında değil." }, { status: 404 })
    }

    // Combine date and time
    const interviewDate = new Date(`${date}T${time}:00`)

    // Create interview
    const interview = await prisma.interview.create({
      data: {
        userId: applicantId,
        applicationId: application.id,
        date: interviewDate,
        location,
        notes,
        status: "scheduled",
        interviewerId: session.user.id,
      },
    })

    // Update application status
    await prisma.scholarshipApplication.update({
      where: { id: application.id },
      data: {
        status: "interview",
        interviewDate,
      },
    })

    // Send email notification
    await sendInterviewInvitationEmail({
      to: application.user.email,
      firstName: application.user.firstName,
      interviewDate: format(interviewDate, "PPP", { locale: tr }),
      interviewTime: format(interviewDate, "HH:mm"),
      interviewLocation: location,
      dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    })

    return NextResponse.json({
      success: true,
      message: "Mülakat başarıyla planlandı ve başvurana bildirim gönderildi.",
      interview,
    })
  } catch (error) {
    console.error("Error scheduling interview:", error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Bir hata oluştu." 
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Oturum kontrolü
    const session = await auth()
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Mülakatları getir
    const interviews = await getInterviews()
    
    return NextResponse.json(interviews)
  } catch (error) {
    console.error("API route error:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}


import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

// GET: Admin tüm başvuruları getirme
export async function GET(request: Request) {
  try {
    // Oturum kontrolü
    const session = await auth()
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // URL'den filtreleme parametrelerini al
    const url = new URL(request.url)
    const status = url.searchParams.get("status")
    
    // Sorgu parametrelerine göre where koşulunu ayarla
    const where = status ? { status } : {}
    
    console.log("API sorgusu:", { where, status })
    
    // Başvuruları getir
    const applications = await db.scholarshipApplication.findMany({
      where,
      include: {
        user: {
          select: {
            id: true, 
            firstName: true,
            lastName: true,
            email: true,
            tcKimlikNo: true,
            mobilePhone: true,
            university: true,
            grade: true
          }
        },
        documents: true
      },
      orderBy: {
        updatedAt: "desc",
      }
    })
    
    console.log(`Bulunan başvuru sayısı: ${applications.length}`)
    
    // Tüm başvuru durumları için özet sayıları
    const statusCounts = await db.scholarshipApplication.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    })
    
    console.log("Başvuru durumları istatistikleri:", statusCounts)
    
    // API yanıtını forma
    const formattedData = applications.map(app => ({
      id: app.id,
      userId: app.userId,
      status: app.status,
      date: app.applicationDate,
      applicant: {
        id: app.user?.id,
        name: `${app.user?.firstName} ${app.user?.lastName}`,
        email: app.user?.email,
        tcKimlikNo: app.user?.tcKimlikNo,
        phone: app.user?.mobilePhone,
        university: app.user?.university,
        grade: app.user?.grade
      },
      documents: app.documents.map(doc => ({
        id: doc.id,
        type: doc.type,
        status: doc.status,
        url: doc.url
      })),
      interviewDate: app.interviewDate,
      approvalDate: app.finalApprovalDate,
      rejectionReason: app.finalRejectionReason
    }))
    
    return NextResponse.json(formattedData)
  } catch (error) {
    console.error("Admin applications GET error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { applicationId, status, notes } = body

    if (!applicationId || !status) {
      return new NextResponse("Application ID and status are required", { status: 400 })
    }

    const application = await db.scholarshipApplication.update({
      where: {
        id: applicationId,
      },
      data: {
        status,
        notes,
        ...(status === "PRE_APPROVED" && { preApprovalDate: new Date() }),
        ...(status === "PRE_REJECTED" && { preRejectionDate: new Date() }),
        ...(status === "DOCUMENTS_APPROVED" && { documentApprovalDate: new Date() }),
        ...(status === "DOCUMENTS_REJECTED" && { documentRejectionDate: new Date() }),
        ...(status === "FINAL_APPROVED" && { finalApprovalDate: new Date() }),
        ...(status === "FINAL_REJECTED" && { finalRejectionDate: new Date() }),
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
        application: true,
        documents: true,
      },
    })

    // Create notification for the user
    await db.notification.create({
      data: {
        userId: application.userId,
        message: `Başvurunuzun durumu güncellendi: ${status}`,
        type: "APPLICATION_STATUS",
      },
    })

    return NextResponse.json(application)
  } catch (error) {
    console.error("[ADMIN_APPLICATIONS_PATCH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 
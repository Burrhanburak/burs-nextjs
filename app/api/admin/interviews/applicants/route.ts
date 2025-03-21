import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/session"
import { db } from "@/lib/db"
import { ApplicationStatus } from "@prisma/client"

// Belgelerin durumunu kontrol et
function getDocumentsStatus(documents: { status: string }[]) {
  if (documents.length === 0) return "incomplete"
  
  const allApproved = documents.every(doc => doc.status === "APPROVED")
  return allApproved ? "complete" : "incomplete"
}

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Toplam kullanıcı ve başvuru sayılarını al - diagnostic için
    const totalUsers = await db.user.count()
    const totalApplications = await db.scholarshipApplication.count()
    
    // Mülakata uygun statüler
    const validStatuses: ApplicationStatus[] = [
      "DOCUMENTS_APPROVED", 
      "DOCUMENTS_SUBMITTED", 
      "PRE_APPROVED", 
      "INTERVIEW_SCHEDULED"
    ]
    
    // Mülakata uygun başvuruları çek
    const applications = await db.scholarshipApplication.findMany({
      where: {
        status: {
          in: validStatuses
        }
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true, 
            lastName: true,
            email: true
          }
        },
        documents: {
          select: {
            id: true,
            status: true,
            type: true
          }
        }
      }
    })

    // Bulunan başvuruları formatlayıp döndür
    const formattedApplicants = applications.map(app => {
      // Belge durumunu kontrol et
      const documentsStatus = getDocumentsStatus(app.documents)
      // Sadece belgeleri tam olanlar mülakata hazır
      const isReadyForInterview = documentsStatus === "complete"
      
      return {
        id: app.id,
        userId: app.user.id,
        firstName: app.user.firstName,
        lastName: app.user.lastName,
        email: app.user.email,
        status: app.status,
        readyForInterview: isReadyForInterview
      }
    })

    // Kaç tane mülakata uygun başvuru var?
    const readyCount = formattedApplicants.filter(app => app.readyForInterview).length
    
    return NextResponse.json({
      applicants: formattedApplicants,
      message: formattedApplicants.length > 0 
        ? `${formattedApplicants.length} başvuru bulundu. ${readyCount} tanesi mülakata uygun.` 
        : "Mülakata uygun başvuru bulunamadı.",
      debug: {
        userCount: totalUsers,
        applicationCount: totalApplications,
        availableStatuses: validStatuses,
        readyForInterviewCount: readyCount,
        testMode: false
      }
    })
  } catch (error) {
    console.error("[INTERVIEW_APPLICANTS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 
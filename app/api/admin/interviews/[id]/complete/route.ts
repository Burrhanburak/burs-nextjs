import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { interviewResult, interviewNotes } = body;

    if (!interviewResult) {
      return new NextResponse("Interview result is required", { status: 400 });
    }

    const applicationId = params.id;

    // Update the application status to INTERVIEW_COMPLETED
    const updatedApplication = await db.scholarshipApplication.update({
      where: {
        id: applicationId,
      },
      data: {
        status: "INTERVIEW_COMPLETED",
        interviewResult,
        interviewNotes: interviewNotes || undefined,
      },
      include: {
        user: true,
        application: true,
      },
    });

    // Create a notification for the user
    await db.notification.create({
      data: {
        userId: updatedApplication.userId,
        message: interviewResult === "passed" 
          ? `Mülakatınızı başarıyla tamamladınız: ${updatedApplication.application.title}. Sonraki adımlar için bildirimlerinizi takip edin.` 
          : `Maalesef mülakatınız başarısız oldu: ${updatedApplication.application.title}. ${interviewNotes ? `Not: ${interviewNotes}` : ""}`,
        type: "APPLICATION_STATUS",
        read: false,
      },
    });

    // If passed, move to final approval
    if (interviewResult === "passed") {
      await db.scholarshipApplication.update({
        where: {
          id: applicationId,
        },
        data: {
          status: "FINAL_APPROVED",
          finalApprovalDate: new Date(),
        },
      });

      // Create notification about final approval
      await db.notification.create({
        data: {
          userId: updatedApplication.userId,
          message: `Tebrikler! Başvurunuz kesin olarak onaylandı: ${updatedApplication.application.title}. Burs detayları yakında size iletilecektir.`,
          type: "APPLICATION_STATUS",
          read: false,
        },
      });
    } else {
      // If failed, move to final rejection
      await db.scholarshipApplication.update({
        where: {
          id: applicationId,
        },
        data: {
          status: "FINAL_REJECTED",
          finalRejectionDate: new Date(),
          finalRejectionReason: interviewNotes || "Mülakat başarısız",
        },
      });

      // Create notification about final rejection
      await db.notification.create({
        data: {
          userId: updatedApplication.userId,
          message: `Üzgünüz, başvurunuz reddedildi: ${updatedApplication.application.title}. Neden: Mülakat sonucu.`,
          type: "APPLICATION_STATUS",
          read: false,
        },
      });
    }

    return NextResponse.json(updatedApplication);
  } catch (error) {
    console.error("[INTERVIEW_COMPLETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 
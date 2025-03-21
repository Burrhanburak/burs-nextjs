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
    const { interviewDate, interviewNotes } = body;

    if (!interviewDate) {
      return new NextResponse("Interview date is required", { status: 400 });
    }

    const applicationId = params.id;

    // Update the application status to INTERVIEW_SCHEDULED
    const updatedApplication = await db.scholarshipApplication.update({
      where: {
        id: applicationId,
      },
      data: {
        status: "INTERVIEW_SCHEDULED",
        interviewDate: new Date(interviewDate),
        interviewNotes,
      },
      include: {
        user: true,
        application: true,
      },
    });

    // Format date for notification
    const dateObj = new Date(interviewDate);
    const formattedDate = `${dateObj.toLocaleDateString("tr-TR")} ${dateObj.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}`;

    // Create a notification for the user
    await db.notification.create({
      data: {
        userId: updatedApplication.userId,
        message: `Mülakatınız planlandı: ${formattedDate}. ${interviewNotes ? `Not: ${interviewNotes}` : ""}`,
        type: "INTERVIEW_INVITATION",
        read: false,
      },
    });

    return NextResponse.json(updatedApplication);
  } catch (error) {
    console.error("[INTERVIEW_SCHEDULE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 
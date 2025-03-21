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
    const { rejectionReason } = body;

    if (!rejectionReason) {
      return new NextResponse("Rejection reason is required", { status: 400 });
    }

    const applicationId = params.id;

    // Update the application status to PRE_REJECTED
    const updatedApplication = await db.scholarshipApplication.update({
      where: {
        id: applicationId,
      },
      data: {
        status: "PRE_REJECTED",
        preRejectionDate: new Date(),
        preRejectionReason: rejectionReason,
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
        message: `Başvurunuz reddedildi: ${updatedApplication.application.title}. Reddetme nedeni: ${rejectionReason}`,
        type: "APPLICATION_STATUS",
        read: false,
      },
    });

    return NextResponse.json(updatedApplication);
  } catch (error) {
    console.error("[APPLICATION_PRE_REJECT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 
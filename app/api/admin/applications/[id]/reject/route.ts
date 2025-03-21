import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { reason } = body;

    if (!reason) {
      return new NextResponse("Rejection reason is required", { status: 400 });
    }

    const applicationId = params.id;

    // Update the application status to rejected
    const updatedApplication = await db.scholarshipApplication.update({
      where: {
        id: applicationId,
      },
      data: {
        status: "FINAL_REJECTED",
        finalRejectionReason: reason,
        finalRejectionDate: new Date(),
      },
      include: {
        user: true,
      },
    });

    // Create a notification for the user
    await db.notification.create({
      data: {
        userId: updatedApplication.userId,
        message: `Başvurunuz reddedildi. Sebep: ${reason}`,
        type: "APPLICATION_REJECTED",
        read: false,
      },
    });

    return NextResponse.json(updatedApplication);
  } catch (error) {
    console.error("[APPLICATION_REJECT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 
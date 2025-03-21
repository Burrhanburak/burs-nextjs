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
    const { status, rejectionReason } = body;

    if (!status) {
      return new NextResponse("Status is required", { status: 400 });
    }

    const documentId = params.id;

    // Update the document status
    const updatedDocument = await db.document.update({
      where: {
        id: documentId,
      },
      data: {
        status,
        rejectionReason: status === "REJECTED" ? rejectionReason : null,
        updatedAt: new Date(),
      },
      include: {
        user: true,
        scholarshipApplication: {
          include: {
            application: true,
          },
        },
      },
    });

    // Create a notification for the user
    await db.notification.create({
      data: {
        userId: updatedDocument.userId,
        message: status === "APPROVED" 
          ? `Evrakınız onaylandı: ${updatedDocument.type}` 
          : `Evrakınız reddedildi: ${updatedDocument.type}. Neden: ${rejectionReason}`,
        type: "DOCUMENT_STATUS",
        read: false,
      },
    });

    // Check if all documents for this application are approved and update application status
    if (status === "APPROVED" && updatedDocument.scholarshipApplicationId && updatedDocument.scholarshipApplication) {
      const pendingDocuments = await db.document.findMany({
        where: {
          scholarshipApplicationId: updatedDocument.scholarshipApplicationId,
          status: "PENDING",
        },
      });

      if (pendingDocuments.length === 0) {
        // All documents are approved, update application status
        await db.scholarshipApplication.update({
          where: {
            id: updatedDocument.scholarshipApplicationId,
          },
          data: {
            status: "DOCUMENTS_APPROVED",
            documentApprovalDate: new Date(),
          },
        });

        // Create notification about all documents being approved
        await db.notification.create({
          data: {
            userId: updatedDocument.userId,
            message: `Tüm evraklarınız onaylandı: ${updatedDocument.scholarshipApplication.application.title}. Görüşme için bir davetiye bekleyin.`,
            type: "APPLICATION_STATUS",
            read: false,
          },
        });
      }
    }

    return NextResponse.json(updatedDocument);
  } catch (error) {
    console.error("[DOCUMENT_UPDATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 
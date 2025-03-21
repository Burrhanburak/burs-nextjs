import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";
import { scheduleInterview } from "@/lib/server-actions";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const applicationId = params.id;
    const body = await request.json();
    const { interviewDate, notes } = body;

    if (!interviewDate) {
      return new NextResponse("Interview date is required", { status: 400 });
    }

    // Belgeleri kontrol et
    const application = await db.scholarshipApplication.findUnique({
      where: { id: applicationId },
      include: { documents: true }
    });

    if (!application) {
      return new NextResponse("Application not found", { status: 404 });
    }

    // Belge durumunu kontrol et
    const allDocumentsApproved = application.documents.every(doc => doc.status === "APPROVED");
    if (application.documents.length === 0 || !allDocumentsApproved) {
      return new NextResponse("Belgeleri eksik olan başvuru için mülakat planlanamaz. Lütfen önce tüm belgelerin onaylandığından emin olun.", 
        { status: 400 });
    }

    // Server action'ı çağır
    const result = await scheduleInterview({
      applicationId,
      interviewDate,
      notes,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[SCHEDULE_INTERVIEW]", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Error";
    return new NextResponse(errorMessage, { status: 500 });
  }
} 
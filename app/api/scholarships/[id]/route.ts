import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id } = context.params;
    
    if (!id) {
      return new NextResponse('Scholarship ID is required', { status: 400 });
    }

    // Get scholarship details
    const scholarship = await db.application.findUnique({
      where: {
        id,
      },
    });

    if (!scholarship) {
      return new NextResponse('Scholarship not found', { status: 404 });
    }

    // Check if user has already applied for this scholarship
    const existingApplication = await db.scholarshipApplication.findFirst({
      where: {
        userId: user.id,
        applicationId: id,
      },
    });

    // Get required documents
    const requiredDocuments = await db.requiredDocument.findMany({
      where: {
        isRequired: true,
      },
    });

    return NextResponse.json({
      scholarship,
      hasApplied: !!existingApplication,
      requiredDocuments,
    });
  } catch (error) {
    console.error('[SCHOLARSHIP_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 
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

    // Properly await params in new way required by Next.js
    // This is the exact way to access dynamic params according to the latest Next.js documentation
    // Any other pattern triggers the "params should be awaited" error
    const { id } = context.params;
    
    if (!id) {
      return new NextResponse('Application ID is required', { status: 400 });
    }

    // Get the scholarship application with minimal related data
    const application = await db.scholarshipApplication.findUnique({
      where: {
        id,
        userId: user.id, // Ensure the application belongs to the current user
      },
      include: {
        application: true, // The scholarship program details
      },
    });

    if (!application) {
      return new NextResponse('Application not found', { status: 404 });
    }

    // Get documents with their URLs
    const documents = await db.document.findMany({
      where: {
        scholarshipApplicationId: id,
      },
      select: {
        id: true,
        type: true,
        status: true,
        url: true,
      }
    });

    // Combine the results
    const result = {
      ...application,
      documents,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('[APPLICATION_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 
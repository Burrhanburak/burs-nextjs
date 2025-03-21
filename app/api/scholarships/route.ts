import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get current date to filter out expired applications
    const currentDate = new Date();

    // Get all available applications with deadlines in the future
    const scholarships = await db.application.findMany({
      where: {
        deadline: {
          gte: currentDate,
        },
      },
      orderBy: {
        deadline: 'asc',
      },
    });

    return NextResponse.json(scholarships);
  } catch (error) {
    console.error('[SCHOLARSHIPS_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 
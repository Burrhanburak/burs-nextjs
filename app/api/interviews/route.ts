import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const session = await auth();
  
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const interviews = await db.scholarshipApplication.findMany({
      where: {
        status: {
          in: ['INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED'],
        },
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            mobilePhone: true,
          },
        },
      },
      orderBy: {
        interviewDate: 'asc',
      },
    });

    return NextResponse.json(interviews);
  } catch (error) {
    console.error('Error fetching interviews:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
    const { applicationId, interviewDate } = body;

    const application = await db.scholarshipApplication.update({
      where: { id: applicationId },
      data: {
        status: 'INTERVIEW_SCHEDULED',
        interviewDate: new Date(interviewDate),
      },
      include: {
        user: true,
      },
    });

    // TODO: Send email notification to the applicant
    // await sendEmail({
    //   to: application.user.email,
    //   subject: 'Mülakat Tarihi Belirlendi',
    //   template: 'interview-scheduled',
    //   data: {
    //     name: `${application.user.firstName} ${application.user.lastName}`,
    //     interviewDate: interviewDate,
    //   },
    // });

    return NextResponse.json(application);
  } catch (error) {
    console.error('Error scheduling interview:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await auth();
  
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
    const { applicationId, interviewResult, interviewNotes } = body;

    const application = await db.scholarshipApplication.update({
      where: { id: applicationId },
      data: {
        status: interviewResult === 'passed' ? 'FINAL_APPROVED' : 'FINAL_REJECTED',
        interviewResult,
        interviewNotes,
        ...(interviewResult === 'passed' 
          ? { finalApprovalDate: new Date() }
          : { finalRejectionDate: new Date() }
        ),
      },
      include: {
        user: true,
      },
    });

    // TODO: Send email notification to the applicant
    // await sendEmail({
    //   to: application.user.email,
    //   subject: 'Mülakat Sonucu',
    //   template: 'interview-result',
    //   data: {
    //     name: `${application.user.firstName} ${application.user.lastName}`,
    //     result: interviewResult,
    //     notes: interviewNotes,
    //   },
    // });

    return NextResponse.json(application);
  } catch (error) {
    console.error('Error updating interview result:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 
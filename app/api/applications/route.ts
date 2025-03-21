import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const applications = await db.scholarshipApplication.findMany({
      where: {
        userId: user.id,
      },
      include: {
        application: true,
        documents: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error('[APPLICATIONS_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { applicationId, notes, customScholarship } = body;

    if (!applicationId && !customScholarship) {
      return new NextResponse('Application ID or custom scholarship title is required', { status: 400 });
    }

    const applicationData = {
      userId: user.id,
      status: 'PENDING',
      notes: notes || undefined
    };

    if (applicationId) {
      applicationData.applicationId = applicationId;
    } else if (customScholarship) {
      const defaultApplication = await db.application.findFirst({
        where: {
          title: "Özel Burs Başvurusu"
        }
      });

      let applicationForCustom;
      if (defaultApplication) {
        applicationForCustom = defaultApplication;
      } else {
        applicationForCustom = await db.application.create({
          data: {
            title: "Özel Burs Başvurusu",
            description: "Kullanıcı tarafından oluşturulan özel burs başvurusu",
            requirements: "Özel burs gereksinimleri",
            deadline: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
          }
        });
      }

      applicationData.applicationId = applicationForCustom.id;
      applicationData.notes = `Özel Burs: ${customScholarship}${notes ? ` - ${notes}` : ''}`;
    }

    const application = await db.scholarshipApplication.create({
      data: applicationData,
      include: {
        application: true,
      },
    });

    return NextResponse.json(application);
  } catch (error) {
    console.error('[APPLICATIONS_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 
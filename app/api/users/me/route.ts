import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";

// Kullanıcının kendi bilgilerini almak için
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const userDetails = await db.user.findUnique({
      where: {
        id: user.id,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        birthDate: true,
        profession: true,
        mobilePhone: true,
        university: true,
        department: true,
        grade: true,
        otherScholarship: true,
        otherScholarshipDetails: true,
        nationality: true,
        image: true,
      },
    });

    return NextResponse.json(userDetails);
  } catch (error) {
    console.error('[USER_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

// Kullanıcının kendi bilgilerini güncellemek için
export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    
    // Güncellenebilecek alanlar
    const {
      firstName,
      lastName,
      birthDate,
      profession,
      mobilePhone,
      university,
      department,
      grade,
      otherScholarship,
      otherScholarshipDetails,
      nationality,
      image,
    } = body;

    // Kullanıcı bilgilerini güncelle
    const updatedUser = await db.user.update({
      where: {
        id: user.id,
      },
      data: {
        firstName: firstName !== undefined ? firstName : undefined,
        lastName: lastName !== undefined ? lastName : undefined,
        birthDate: birthDate !== undefined ? new Date(birthDate) : undefined,
        profession: profession !== undefined ? profession : undefined,
        mobilePhone: mobilePhone !== undefined ? mobilePhone : undefined,
        university: university !== undefined ? university : undefined,
        department: department !== undefined ? department : undefined,
        grade: grade !== undefined ? grade : undefined,
        otherScholarship: otherScholarship !== undefined ? otherScholarship : undefined,
        otherScholarshipDetails: otherScholarshipDetails !== undefined ? otherScholarshipDetails : undefined,
        nationality: nationality !== undefined ? nationality : undefined,
        image: image !== undefined ? image : undefined,
      },
    });

    // Hassas bilgileri içermeyen kullanıcı verisi oluştur
    const userResponse = {
      id: updatedUser.id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      birthDate: updatedUser.birthDate,
      profession: updatedUser.profession,
      mobilePhone: updatedUser.mobilePhone,
      university: updatedUser.university,
      department: updatedUser.department,
      grade: updatedUser.grade,
      otherScholarship: updatedUser.otherScholarship,
      otherScholarshipDetails: updatedUser.otherScholarshipDetails,
      nationality: updatedUser.nationality,
      image: updatedUser.image,
      role: updatedUser.role,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt
    };

    return NextResponse.json(userResponse);
  } catch (error) {
    console.error('[USER_PATCH]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 
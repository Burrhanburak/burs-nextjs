import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id
    
    if (!userId) {
      return NextResponse.json(
        { error: "Kullanıcı ID'si belirtilmedi" },
        { status: 400 }
      )
    }
    
    const data = await request.json()
    const { gpa, grade, graduationYear } = data
    
    // Kullanıcının varlığını kontrol et
    const user = await db.user.findUnique({
      where: { id: userId }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      )
    }
    
    // Kullanıcı akademik bilgilerini güncelle
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        grade: grade || user.grade,
        // Diğer akademik bilgiler eklenebilir
      }
    })
    
    // Bursiyerin başvurusunu bulalım
    const latestApplication = await db.scholarshipApplication.findFirst({
      where: { userId: userId },
      orderBy: { applicationDate: 'desc' }
    })
    
    // GPA ve diğer bilgileri güncellemek için notes alanını kullanacağız
    // ScholarshipApplication'da doğrudan gpa alanı olmadığı için
    if (latestApplication) {
      // Mevcut notları parse et veya yeni bir obje oluştur
      let noteObj = {}
      try {
        if (latestApplication.notes) {
          noteObj = JSON.parse(latestApplication.notes)
        }
      } catch (error) {
        // Parse hatası durumunda yeni bir obje başlat
        noteObj = {}
      }
      
      // Akademik bilgileri ekle
      noteObj = {
        ...noteObj,
        academicInfo: {
          gpa: gpa || (noteObj?.academicInfo?.gpa || 0),
          graduationYear: graduationYear || noteObj?.academicInfo?.graduationYear,
          updatedAt: new Date().toISOString()
        }
      }
      
      // JSON string olarak kaydet
      await db.scholarshipApplication.update({
        where: { id: latestApplication.id },
        data: {
          notes: JSON.stringify(noteObj)
        }
      })
    }
    
    return NextResponse.json({
      success: true,
      message: "Akademik bilgiler güncellendi",
      user: {
        id: updatedUser.id,
        grade: updatedUser.grade,
      },
      academicInfo: {
        gpa: gpa,
        graduationYear: graduationYear
      }
    })
    
  } catch (err) {
    console.error("Error updating academic information:", err);
    return NextResponse.json(
      { error: "Akademik bilgiler güncellenirken bir hata oluştu." },
      { status: 500 }
    );
  }
} 
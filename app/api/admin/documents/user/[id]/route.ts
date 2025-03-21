import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET /api/admin/documents/user/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }
    
    // Kullanıcının belgelerini getir
    const documents = await db.document.findMany({
      where: {
        OR: [
          { userId: userId },  // Kullanıcının direk kendisine ait belgeler
          { scholarshipApplication: { userId: userId } }  // Başvuru üzerinden bağlı belgeler
        ]
      },
      include: {
        scholarshipApplication: true
      }
    })
    
    // Ayrıca aplikasyon üzerinden de getirmeyi deneyelim
    const scholarshipApplication = await db.scholarshipApplication.findFirst({
      where: {
        userId: userId
      },
      include: {
        documents: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    // İki sonucu birleştir ve benzersiz yap
    let allDocuments = documents
    
    if (scholarshipApplication?.documents) {
      // Mevcut belgeleri ID'ye göre takip et
      const existingDocIds = new Set(documents.map(doc => doc.id))
      
      // Scholarshipdaki belgeleri ekle eğer zaten yoksa
      scholarshipApplication.documents.forEach(doc => {
        if (!existingDocIds.has(doc.id)) {
          allDocuments.push(doc)
        }
      })
    }
    
    // Belgeleri formatla - URL, tip ve durum bilgilerini döndür
    const formattedDocuments = allDocuments.map(doc => ({
      id: doc.id,
      type: doc.type,
      status: doc.status,
      url: doc.url,
      name: getDocumentTypeName(doc.type)
    }))
    
    console.log(`Kullanıcı ${userId} için ${formattedDocuments.length} belge bulundu`)
    
    return NextResponse.json({
      documents: formattedDocuments
    })
  } catch (error) {
    console.error("Belgeleri getirme hatası:", error)
    return NextResponse.json(
      { error: "Belgeleri getirirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// Belge tiplerini formatlama
function getDocumentTypeName(type: string): string {
  const typeMap: Record<string, string> = {
    'transcript': 'Transkript',
    'id_card': 'Kimlik Kartı',
    'income_statement': 'Gelir Belgesi',
    'student_certificate': 'Öğrenci Belgesi',
    'residence_document': 'İkametgah Belgesi'
  }
  return typeMap[type] || type
} 
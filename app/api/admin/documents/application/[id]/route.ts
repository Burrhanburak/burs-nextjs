import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET /api/admin/documents/application/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    let applicationId = params.id
    
    if (!applicationId) {
      return NextResponse.json(
        { error: "Application ID is required" },
        { status: 400 }
      )
    }
    
    console.log(`Başvuru ID: ${applicationId} için belgeleri getiriliyor`)
    
    // Önce başvuruyu bulalım
    const application = await db.scholarshipApplication.findFirst({
      where: {
        id: applicationId
      }
    })
    
    if (!application) {
      console.log(`Başvuru bulunamadı: ${applicationId}`)
      // Eğer başvuru bulunamazsa, belki bu bir kullanıcı ID'sidir
      const scholarshipApplication = await db.scholarshipApplication.findFirst({
        where: {
          userId: applicationId
        }
      })
      
      if (!scholarshipApplication) {
        console.log(`Kullanıcı için başvuru bulunamadı: ${applicationId}`)
        return NextResponse.json(
          { error: "Başvuru bulunamadı" },
          { status: 404 }
        )
      }
      
      // Kullanıcı ID ile başvuru bulduysak, başvuru ID'sini güncelleyelim
      applicationId = scholarshipApplication.id
    }
    
    // Başvurunun dokümanlarını getir
    const documents = await db.document.findMany({
      where: {
        OR: [
          { scholarshipApplicationId: applicationId },
          { scholarshipApplication: { id: applicationId } }
        ]
      }
    })
    
    // Ayrıca başvuruya ait kullanıcının dokümanlarını da getir
    const userDocuments = await db.document.findMany({
      where: {
        userId: application?.userId || ""
      }
    })
    
    // Belgeleri birleştir ve birleşik listeyi oluştur
    const existingDocIds = new Set(documents.map(doc => doc.id))
    const allDocuments = [...documents]
    
    // Kullanıcı belgelerini ekle (zaten eklenmemiş olanları)
    userDocuments.forEach(doc => {
      if (!existingDocIds.has(doc.id)) {
        allDocuments.push(doc)
      }
    })
    
    // Belgeleri formatla
    const formattedDocuments = allDocuments.map(doc => ({
      id: doc.id,
      type: doc.type,
      status: doc.status,
      url: doc.url,
      name: getDocumentTypeName(doc.type)
    }))
    
    console.log(`Başvuru ${applicationId} için ${formattedDocuments.length} belge bulundu`)
    
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
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { firstName, lastName, email, tcKimlikNo, mobilePhone, university, department, grade } = data
    
    console.log("Bursiyer ekleme isteği alındı:", { firstName, lastName, email, tcKimlikNo, department })
    
    // Gerekli alanları kontrol et
    if (!firstName || !lastName || !email || !tcKimlikNo) {
      console.log("Eksik alanlar var:", { firstName, lastName, email, tcKimlikNo })
      return NextResponse.json(
        { 
          error: "Lütfen zorunlu alanları doldurun (Ad, Soyad, E-posta, TC Kimlik No)",
          details: {
            firstName: !firstName ? "Ad alanı zorunludur" : null,
            lastName: !lastName ? "Soyad alanı zorunludur" : null,
            email: !email ? "E-posta alanı zorunludur" : null,
            tcKimlikNo: !tcKimlikNo ? "TC Kimlik No alanı zorunludur" : null
          }
        },
        { status: 400 }
      )
    }
    
    // TC Kimlik No formatını kontrol et
    if (tcKimlikNo.length !== 11 || !/^\d+$/.test(tcKimlikNo)) {
      console.log("Geçersiz TC Kimlik No formatı:", tcKimlikNo)
      return NextResponse.json(
        { error: "TC Kimlik No 11 haneli ve sadece rakamlardan oluşmalıdır" },
        { status: 400 }
      )
    }
    
    // Kullanıcı zaten var mı kontrol et
    const existingUser = await db.user.findFirst({
      where: {
        OR: [
          { email },
          { tcKimlikNo }
        ]
      }
    })
    
    if (existingUser) {
      const isDuplicateEmail = existingUser.email === email
      const isDuplicateTcKimlik = existingUser.tcKimlikNo === tcKimlikNo
      
      console.log("Mevcut kullanıcı bulundu:", { 
        isDuplicateEmail, 
        isDuplicateTcKimlik, 
        existingUserEmail: existingUser.email,
        existingUserTcKimlik: existingUser.tcKimlikNo
      })
      
      return NextResponse.json(
        { 
          error: "Bu kullanıcı zaten mevcut", 
          details: {
            email: isDuplicateEmail ? "Bu e-posta adresi zaten kullanılıyor" : null,
            tcKimlikNo: isDuplicateTcKimlik ? "Bu TC Kimlik No zaten kayıtlı" : null
          }
        },
        { status: 400 }
      )
    }
    
    // Geçici şifre oluştur
    const tempPassword = Math.random().toString(36).slice(-8)
    
    // Kullanıcıyı oluştur
    const user = await db.user.create({
      data: {
        firstName,
        lastName,
        email,
        tcKimlikNo,
        mobilePhone: mobilePhone || "",
        university: university || "",
        department: department || "",
        grade: grade || "",
        password: tempPassword, // Gerçek uygulamada şifrelenmeli
        isActive: true,
        role: "APPLICANT"
      }
    })
    
    // Varsayılan bir başvuru oluştur
    const application = await db.application.findFirst({
      orderBy: { createdAt: 'desc' }
    })
    
    if (application) {
      await db.scholarshipApplication.create({
        data: {
          userId: user.id,
          applicationId: application.id,
          status: "FINAL_APPROVED",
          applicationDate: new Date(),
          finalApprovalDate: new Date()
        }
      })
    }
    
    console.log("Bursiyer başarıyla eklendi:", user.id)
    
    return NextResponse.json({
      success: true,
      message: "Bursiyer başarıyla eklendi",
      user: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        tcKimlikNo: user.tcKimlikNo,
        university: user.university,
        department: user.department,
        grade: user.grade,
        password: tempPassword // Gerçek uygulamada dönmemeli
      }
    })
    
  } catch (error) {
    console.error("Bursiyer ekleme hatası:", error)
    return NextResponse.json(
      { error: "Bursiyer eklenirken bir hata oluştu", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
} 
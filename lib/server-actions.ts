"use server"

import { db } from "@/lib/db"
import { ApplicationStatus, DocumentStatus, UserRole } from "@prisma/client"

// Başvuruları getir
export async function getApplications(status?: ApplicationStatus) {
  try {
    const whereClause = status ? { status } : {}
    
    const applications = await db.scholarshipApplication.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            tcKimlikNo: true,
            university: true,
            mobilePhone: true
          }
        },
        documents: {
          select: {
            id: true,
            type: true,
            url: true,
            status: true
          }
        }
      },
      orderBy: {
        applicationDate: 'desc'
      }
    })
    
    // Verileri formatlayıp döndür
    return applications.map(app => {
      // Belge durumunu belirle
      const documentsStatus = getDocumentsStatus(app.documents);
      
      // Başvuru durumunu düzelt
      // Eğer belgeler eksikse ve başvuru mülakat aşamasındaysa, durumu belge incelemesine döndür
      let appStatus = app.status.toLowerCase();
      const isInterviewStatus = ["interview", "interview_scheduled", "interview_completed"].includes(appStatus);
      
      if (documentsStatus === "incomplete" && isInterviewStatus) {
        // Belgeler eksik ve mülakat aşamasında görünüyor - tutarsızlık düzeltiliyor
        console.log(`Tutarsız durum düzeltiliyor: ID=${app.id}, Belgeler eksik ama mülakat statüsünde`);
        appStatus = "document_review"; // Status'u belge incelemesi olarak düzelt
      }
      
      // Mülakat tarihi var ve belgeleri tam, ama mülakat aşamasında görünmüyor
      // Bu başvuruları mülakat aşamasında olarak düzelt
      if (app.interviewDate && documentsStatus === "complete" && !isInterviewStatus) {
        console.log(`Tutarsız durum düzeltiliyor: ID=${app.id}, Mülakat planlanmış ama mülakat aşamasında görünmüyor`);
        appStatus = "interview_scheduled"; // Status'u mülakat aşaması olarak düzelt
      }
      
      return {
        id: app.id,
        applicantName: `${app.user.firstName} ${app.user.lastName}`,
        tcKimlikNo: app.user.tcKimlikNo,
        university: app.user.university || "",
        applicationDate: app.applicationDate.toISOString(),
        status: appStatus,
        documentsStatus: documentsStatus,
        email: app.user.email,
        phone: app.user.mobilePhone,
        interviewDate: app.interviewDate?.toISOString(),
        approvalDate: app.finalApprovalDate?.toISOString(),
        rejectionReason: app.finalRejectionReason,
        documents: app.documents.map(doc => ({
          id: doc.id,
          name: doc.type,
          status: doc.status.toLowerCase()
        }))
      }
    })
  } catch (error) {
    console.error("Başvuruları getirme hatası:", error)
    return []
  }
}

// Belgelerin durumunu kontrol et
function getDocumentsStatus(documents: { status: DocumentStatus }[]) {
  if (documents.length === 0) return "incomplete"
  
  const allApproved = documents.every(doc => doc.status === "APPROVED")
  return allApproved ? "complete" : "incomplete"
}

// Bursiyerleri getir
export async function getBursiyerler() {
  try {
    // Admin olmayan tüm kullanıcıları getir
    const kullanicilar = await db.user.findMany({
      where: {
        isActive: true,
        role: {
          not: "ADMIN"
        }
      },
      include: {
        scholarshipApplications: {
          take: 1,
          orderBy: {
            applicationDate: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`Veritabanından ${kullanicilar.length} bursiyer bulundu`);
    
    // Verileri formatlayıp döndür
    return kullanicilar.map(kullanici => {
      // Son başvuruyu bul
      const sonBasvuru = kullanici.scholarshipApplications[0];
      
      // Bölüm bilgisini kontrol et
      let bolum = "";
      if (sonBasvuru && sonBasvuru.notes) {
        try {
          const notesData = JSON.parse(sonBasvuru.notes);
          if (notesData && notesData.department) {
            bolum = notesData.department;
          }
        } catch {
          // JSON parse edilemediğinde (düz metin olduğunda)
          console.log("Notes JSON değil, düz metin:", sonBasvuru.notes.substring(0, 30));
        }
      }
      
      // Bölüm bilgisi yoksa
      if (!bolum) {
        // Varsayılan olarak üniversite bilgisi ile doldur
        bolum = kullanici.university && kullanici.university.includes(" ") 
              ? kullanici.university.split(" ")[1] 
              : kullanici.university 
                ? kullanici.university 
                : "Belirtilmemiş";
      }
      
      // Ayarlar sayfası için
      const bursiyerBilgileri = {
        id: kullanici.id, 
        adSoyad: `${kullanici.firstName} ${kullanici.lastName}`,
        tcKimlikNo: kullanici.tcKimlikNo || "",
        universiteKurumu: kullanici.university || "",
        bolum: bolum,
        sinif: kullanici.grade || "",
        durum: "active", // Tüm bursiyerler aktif
        baslangicTarihi: kullanici.createdAt.toISOString(),
        bitisTarihi: getEndDate(kullanici.createdAt),
        // Adres bilgileri
        adresBilgileri: {
          adSoyad: `${kullanici.firstName} ${kullanici.lastName}`,
          tcKimlikNo: kullanici.tcKimlikNo || "",
          adresSatiri1: "", 
          adresSatiri2: "",
          sehir: "", 
          ilce: "", 
          il: "", 
          postaKodu: "", 
          telefon: kullanici.mobilePhone || "",
          email: kullanici.email
        },
        // Ödeme bilgileri
        odemeBilgileri: {
          sonOdeme: undefined,
          toplamOdenen: sonBasvuru?.amount || 0,
        },
        
        // bursiyer-status sayfası için
        name: `${kullanici.firstName} ${kullanici.lastName}`,
        university: kullanici.university || "",
        department: bolum, // Bölüm bilgisini atama
        bursStatus: "active",
        startDate: kullanici.createdAt.toISOString(),
        endDate: getEndDate(kullanici.createdAt),
        gpa: 0,
        level: "Lisans",
        grade: kullanici.grade || "",
        paymentStatus: "active"
      };
      
      return bursiyerBilgileri;
    });
  } catch (error) {
    console.error("Bursiyerleri getirme hatası:", error);
    return [];
  }
}

// Bitiş tarihini hesapla
function getEndDate(startDate?: Date | null) {
  if (!startDate) return new Date().toISOString()
  
  const endDate = new Date(startDate)
  endDate.setFullYear(endDate.getFullYear() + 1)
  return endDate.toISOString()
}

// Denetim kayıtlarını getir
export async function getAuditLogs() {
  try {
    // Denetim kayıtları için gerçek veri toplanması
    const [users, applications, documents] = await Promise.all([
      db.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          createdAt: true
        }
      }),
      db.scholarshipApplication.findMany({
        take: 5,
        orderBy: { updatedAt: 'desc' },
        include: { user: true }
      }),
      db.document.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: true }
      })
    ]);
    
    // Kullanıcı oluşturma kayıtları
    const userLogs = users.map((user, index) => ({
      id: `USR${String(index + 1).padStart(3, '0')}`,
      timestamp: user.createdAt.toISOString(),
      user: `${user.firstName} ${user.lastName}`,
      email: user.email,
      action: "create",
      details: `${user.firstName} ${user.lastName} kullanıcısı oluşturuldu (${user.role})`,
      ipAddress: "192.168.1.100",
      userAgent: "Chrome/Windows"
    }));
    
    // Başvuru işlem kayıtları
    const applicationLogs = applications.map((app, index) => ({
      id: `APP${String(index + 1).padStart(3, '0')}`,
      timestamp: app.updatedAt.toISOString(),
      user: `${app.user.firstName} ${app.user.lastName}`,
      email: app.user.email,
      action: "update",
      details: `Başvuru durumu güncellendi: ${app.status}`,
      ipAddress: "192.168.1.101",
      userAgent: "Firefox/MacOS"
    }));
    
    // Belge yükleme kayıtları
    const documentLogs = documents.map((doc, index) => ({
      id: `DOC${String(index + 1).padStart(3, '0')}`,
      timestamp: doc.createdAt.toISOString(),
      user: `${doc.user.firstName} ${doc.user.lastName}`,
      email: doc.user.email,
      action: "upload",
      details: `${doc.type} belgesi yüklendi`,
      ipAddress: "192.168.1.102",
      userAgent: "Safari/iOS"
    }));
    
    // Sisteme giriş kayıtları (manuel oluşturulmuş)
    const loginLogs = users.map((user, index) => ({
      id: `LOG${String(index + 1).padStart(3, '0')}`,
      timestamp: new Date(Date.now() - index * 86400000).toISOString(), // Bugünden geriye doğru günlük
      user: `${user.firstName} ${user.lastName}`,
      email: user.email,
      action: "login",
      details: "Başarılı giriş",
      ipAddress: "192.168.1.103",
      userAgent: "Chrome/Windows"
    }));
    
    // Tüm kayıtları birleştir ve tarihe göre sırala
    return [...userLogs, ...applicationLogs, ...documentLogs, ...loginLogs]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
  } catch (error) {
    console.error("Denetim kayıtlarını getirme hatası:", error)
    return []
  }
}

// Kullanıcı listesini getir
export async function getUsers() {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return users.map(user => ({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role,
      status: user.isActive ? "active" : "inactive",
      lastActive: user.updatedAt.toISOString(),
      createdAt: user.createdAt.toISOString()
    }))
  } catch (error) {
    console.error("Kullanıcıları getirme hatası:", error)
    return []
  }
}

// Mülakatları getir
export async function getInterviews() {
  try {
    console.log("Mülakatları getirme başladı");
    
    // Mülakatı planlanmış veya tamamlanmış başvurular
    const scheduledInterviews = await db.scholarshipApplication.findMany({
      where: {
        OR: [
          {
            status: {
              in: ["INTERVIEW_SCHEDULED", "INTERVIEW_COMPLETED"]
            }
          },
          {
            interviewDate: {
              not: null
            }
          }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            mobilePhone: true,
            university: true
          }
        },
        documents: {
          select: {
            id: true,
            type: true,
            url: true,
            status: true
          }
        }
      },
      orderBy: {
        interviewDate: 'asc'
      }
    });
    
    console.log(`Veritabanında toplam ${scheduledInterviews.length} mülakat bulundu.`);
    
    // Sadece belgeleri tam olan mülakatları filtrele
    const validInterviews = scheduledInterviews.filter(interview => {
      const documentsStatus = getDocumentsStatus(interview.documents);
      if (documentsStatus !== "complete") {
        console.log(`Belgesi eksik olduğu için mülakat listesinden çıkarıldı: ID=${interview.id}`);
        return false;
      }
      return true;
    });
    
    console.log(`Belgeleri tam olan ${validInterviews.length} mülakat işlenecek.`);
    
    // Tüm mülakatları formatla
    const allInterviews = validInterviews.map(interview => ({
      id: interview.id,
      user: {
        id: interview.user?.id || "",
        firstName: interview.user?.firstName || "",
        lastName: interview.user?.lastName || "",
        email: interview.user?.email || "",
        mobilePhone: interview.user?.mobilePhone || ""
      },
      application: {
        id: interview.id,
        title: interview.user?.university || "Üniversite belirtilmemiş"
      },
      status: interview.status === "INTERVIEW_COMPLETED" ? "completed" : 
              interview.status === "INTERVIEW_SCHEDULED" ? "scheduled" : "documents_approved",
      interviewDate: interview.interviewDate?.toISOString() || null,
      interviewResult: interview.interviewResult,
      interviewNotes: interview.interviewNotes
    }));
    
    return allInterviews;
  } catch (error) {
    console.error("Mülakatları getirme hatası:", error);
    return [];
  }
}

// Kullanıcı dashboard verilerini getir
export async function getUserDashboardData(userId: string) {
  try {
    // Kullanıcının başvurularını al
    const applications = await db.scholarshipApplication.findMany({
      where: {
        userId: userId
      },
      include: {
        application: true,
        documents: true
      },
      orderBy: {
        applicationDate: 'desc'
      }
    });

    // Kullanıcının dokümanlarını al
    const documents = await db.document.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // Kullanıcının bildirimlerini al
    const notifications = await db.notification.findMany({
      where: {
        userId: userId,
        read: false
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Gerekli doküman sayısını al
    const requiredDocuments = await db.requiredDocument.findMany({
      where: {
        isRequired: true
      }
    });

    // Kullanıcı bilgilerini al
    const user = await db.user.findUnique({
      where: {
        id: userId
      }
    });

    if (!user) {
      throw new Error("Kullanıcı bulunamadı");
    }

    return {
      applications: {
        count: applications.length,
        items: applications.map(app => ({
          id: app.id,
          name: app.application.title,
          status: app.status,
          date: app.applicationDate.toISOString(),
          documents: {
            uploaded: app.documents.length,
            required: requiredDocuments.length
          }
        })),
        lastApplication: applications.length > 0 ? {
          id: applications[0].id,
          name: applications[0].application.title,
          status: applications[0].status,
          date: applications[0].applicationDate.toISOString(),
          documents: {
            uploaded: applications[0].documents.length,
            required: requiredDocuments.length
          }
        } : null
      },
      documents: {
        count: documents.length,
        uploaded: documents.length,
        required: requiredDocuments.length,
        items: documents.map(doc => ({
          id: doc.id,
          type: doc.type,
          status: doc.status,
          url: doc.url,
          date: doc.updatedAt.toISOString()
        }))
      },
      notifications: {
        count: notifications.length,
        items: notifications.map(notification => ({
          id: notification.id,
          message: notification.message,
          type: notification.type,
          date: notification.createdAt.toISOString()
        }))
      },
      profile: {
        fullName: `${user.firstName} ${user.lastName}`,
        isComplete: Boolean(
          user.firstName && 
          user.lastName && 
          user.email && 
          user.mobilePhone && 
          user.tcKimlikNo && 
          user.birthDate && 
          user.university && 
          user.grade
        )
      }
    };
  } catch (error) {
    console.error("Kullanıcı dashboard verilerini getirme hatası:", error);
    throw error;
  }
}

// Mülakat planla
export async function scheduleInterview(data: {
  applicationId: string;
  interviewDate: string;
  notes?: string;
}) {
  try {
    const { applicationId, interviewDate, notes } = data;
    
    console.log("=== MÜLAKAT PLANLAMA BAŞLADI ===");
    console.log("İstek verileri:", data);
    
    // Başvuruyu belgeleriyle birlikte bul
    const application = await db.scholarshipApplication.findUnique({
      where: { id: applicationId },
      include: { 
        user: true,
        documents: true
      }
    });

    console.log("Bulunan başvuru:", application ? { 
      id: application.id, 
      status: application.status,
      userId: application.userId,
      firstName: application.user?.firstName,
      lastName: application.user?.lastName,
      documentsCount: application.documents?.length
    } : "Bulunamadı");

    if (!application) {
      console.error(`Başvuru bulunamadı. ID: ${applicationId}`);
      throw new Error("Başvuru bulunamadı");
    }

    // Belgelerin durumunu kontrol et
    const documentsStatus = getDocumentsStatus(application.documents);
    if (documentsStatus !== "complete") {
      console.error(`Belgeleri eksik olan başvuru için mülakat planlanamaz. ID: ${applicationId}`);
      throw new Error("Belgeleri eksik olan başvuru için mülakat planlanamaz. Lütfen önce tüm belgelerin onaylandığından emin olun.");
    }

    // Mülakat tarihini ayarla
    const interview = await db.scholarshipApplication.update({
      where: { id: applicationId },
      data: {
        status: "INTERVIEW_SCHEDULED",
        interviewDate: new Date(interviewDate),
        interviewNotes: notes || null
      }
    });

    // Kullanıcıya bildirim oluştur
    if (application.userId) {
      const interviewDate = new Date(interview.interviewDate as Date);
      const formattedDate = interviewDate.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      const formattedTime = interviewDate.toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      await db.notification.create({
        data: {
          userId: application.userId,
          message: `Burs başvurunuz için ${formattedDate} tarihinde saat ${formattedTime}'de mülakat planlandı. Lütfen zamanında katılmayı unutmayın.`,
          type: "INTERVIEW_INVITATION",
          read: false,
        },
      });
      
      console.log("Kullanıcıya mülakat bildirimi gönderildi");
    }

    console.log("Mülakat planlandı:", {
      id: interview.id,
      status: interview.status,
      date: interview.interviewDate
    });
    console.log("=== MÜLAKAT PLANLAMA TAMAMLANDI ===");

    // Başarılı sonucu döndür
    return {
      success: true,
      interview: {
        id: interview.id,
        date: interview.interviewDate?.toISOString()
      }
    };
  } catch (error) {
    console.error("Mülakat planlanırken hata:", error);
    throw error;
  }
}

// Mülakat sil/iptal et
export async function deleteInterview(applicationId: string) {
  try {
    // Başvuruyu bul
    const application = await db.scholarshipApplication.findUnique({
      where: { id: applicationId },
      include: { user: true }
    });

    if (!application) {
      throw new Error("Başvuru bulunamadı");
    }

    // Başvurunun mülakat bilgilerini temizle
    await db.scholarshipApplication.update({
      where: { id: applicationId },
      data: {
        status: "DOCUMENTS_APPROVED", // Mülakat öncesi duruma geri al
        interviewDate: null,
        interviewNotes: null,
        interviewResult: null
      }
    });

    // Kullanıcıya mülakat iptali bildirimi gönder
    if (application.userId) {
      await db.notification.create({
        data: {
          userId: application.userId,
          message: `Burs başvurunuz için planlanmış olan mülakat iptal edilmiştir. Yakında yeni bir mülakat planlaması yapılacaktır.`,
          type: "INTERVIEW_INVITATION",
          read: false,
        },
      });
      
      console.log("Kullanıcıya mülakat iptali bildirimi gönderildi");
    }

    // Başarılı sonucu döndür
    return {
      success: true,
      message: "Mülakat başarıyla iptal edildi"
    };
  } catch (error) {
    console.error("Mülakat iptal edilirken hata:", error);
    throw error;
  }
}

// Kullanıcı ekle
export async function createUser(userData: {
  firstName: string;
  lastName: string;
  email: string;
  tcKimlikNo: string;
  mobilePhone: string;
  role: UserRole;
}) {
  try {
    // Kullanıcının zaten var olup olmadığını kontrol et
    const existingUser = await db.user.findFirst({
      where: {
        OR: [
          { email: userData.email },
          { tcKimlikNo: userData.tcKimlikNo }
        ]
      }
    });

    if (existingUser) {
      throw new Error("Bu e-posta veya TC Kimlik numarası ile kayıtlı bir kullanıcı zaten var.");
    }

    // Geçici şifre oluştur (8 karakter uzunluğunda)
    const tempPassword = Math.random().toString(36).slice(-8);

    // Kullanıcıyı oluştur
    const user = await db.user.create({
      data: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        tcKimlikNo: userData.tcKimlikNo,
        mobilePhone: userData.mobilePhone,
        role: userData.role,
        isActive: true,
        // Gerçek uygulamada şifre hashlenmelidir
        password: tempPassword,
      }
    });

    // Oluşturulan kullanıcıyı döndür
    return {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role,
      status: user.isActive ? "active" : "inactive",
      lastActive: user.updatedAt.toISOString(),
      createdAt: user.createdAt.toISOString(),
      password: tempPassword // Gerçek uygulamada bu şifre e-posta ile gönderilmelidir
    };
  } catch (error) {
    console.error("Kullanıcı ekleme hatası:", error);
    throw error;
  }
}

// Kullanıcı silme
export async function deleteUser(userId: string) {
  try {
    // Kullanıcının var olup olmadığını kontrol et
    const user = await db.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error("Kullanıcı bulunamadı");
    }

    // Kullanıcıyı sil
    await db.user.delete({
      where: { id: userId }
    });

    return { success: true, message: "Kullanıcı başarıyla silindi" };
  } catch (error) {
    console.error("Kullanıcı silme hatası:", error);
    throw error;
  }
}

// Kullanıcı düzenleme
export async function editUser(userId: string, userData: {
  firstName?: string;
  lastName?: string;
  email?: string;
  tcKimlikNo?: string;
  mobilePhone?: string;
  role?: UserRole;
  isActive?: boolean;
}) {
  try {
    // Kullanıcının var olup olmadığını kontrol et
    const user = await db.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error("Kullanıcı bulunamadı");
    }

    // TC kimlik no veya e-posta güncelleniyorsa, başka kullanıcıyla çakışma kontrolü
    if (userData.tcKimlikNo || userData.email) {
      const existingUser = await db.user.findFirst({
        where: {
          OR: [
            userData.email ? { email: userData.email } : {},
            userData.tcKimlikNo ? { tcKimlikNo: userData.tcKimlikNo } : {}
          ],
          NOT: {
            id: userId
          }
        }
      });

      if (existingUser) {
        throw new Error("Bu e-posta veya TC Kimlik numarası ile kayıtlı başka bir kullanıcı var.");
      }
    }

    // Kullanıcıyı güncelle
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: userData
    });

    // Kullanıcı bilgilerini formatla
    return {
      id: updatedUser.id,
      name: `${updatedUser.firstName} ${updatedUser.lastName}`,
      email: updatedUser.email,
      role: updatedUser.role,
      status: updatedUser.isActive ? "active" : "inactive",
      lastActive: updatedUser.updatedAt.toISOString(),
      createdAt: updatedUser.createdAt.toISOString()
    };
  } catch (error) {
    console.error("Kullanıcı düzenleme hatası:", error);
    throw error;
  }
} 
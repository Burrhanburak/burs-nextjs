import { PrismaClient, UserRole, AdminRole, ApplicationStatus, DocumentStatus, NotificationType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      tcKimlikNo: '11111111111',
      mobilePhone: '5551112233',
      role: UserRole.ADMIN,
      isActive: true,
    },
  })

  // Create separate admin in Admin table
  const adminAccount = await prisma.admin.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminPassword,
      role: AdminRole.SUPER_ADMIN,
      isActive: true,
    },
  })

  // Create regular users (applicants)
  const regularUsers = [
    {
      email: 'user1@example.com',
      password: await bcrypt.hash('user123', 10),
      firstName: 'Ahmet',
      lastName: 'Yılmaz',
      tcKimlikNo: '22222222222',
      mobilePhone: '5552223344',
      birthDate: new Date('1998-05-15'),
      profession: 'Öğrenci',
      university: 'İstanbul Üniversitesi',
      grade: '3',
      otherScholarship: false,
      nationality: 'Turkish',
    },
    {
      email: 'user2@example.com',
      password: await bcrypt.hash('user123', 10),
      firstName: 'Ayşe',
      lastName: 'Demir',
      tcKimlikNo: '33333333333',
      mobilePhone: '5553334455',
      birthDate: new Date('1999-08-22'),
      profession: 'Öğrenci',
      university: 'Boğaziçi Üniversitesi',
      grade: '2',
      otherScholarship: true,
      otherScholarshipDetails: 'KYK Bursu',
      nationality: 'Turkish',
    },
    {
      email: 'user3@example.com',
      password: await bcrypt.hash('user123', 10),
      firstName: 'Mehmet',
      lastName: 'Kaya',
      tcKimlikNo: '44444444444',
      mobilePhone: '5554445566',
      birthDate: new Date('2000-03-10'),
      profession: 'Öğrenci',
      university: 'Ankara Üniversitesi',
      grade: '1',
      otherScholarship: false,
      nationality: 'Turkish',
    }
  ]

  const createdUsers = []

  for (const userData of regularUsers) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        ...userData,
        isActive: true,
        role: UserRole.APPLICANT,
      },
    })
    createdUsers.push(user)
  }

  // Create sample applications
  const applications = [
    {
      id: 'app-2024-1',
      title: '2024 Lisans Burs Programı',
      description: '2024 yılı lisans öğrencileri için burs başvurusu.',
      requirements: '1. Lisans öğrencisi olmak\n2. Not ortalaması 3.0/4.0 üzerinde olmak\n3. Maddi durumu yetersiz olmak',
      deadline: new Date('2024-12-31'),
    },
    {
      id: 'app-2024-2',
      title: '2024 Yüksek Lisans Burs Programı',
      description: '2024 yılı yüksek lisans öğrencileri için burs başvurusu.',
      requirements: '1. Yüksek lisans öğrencisi olmak\n2. Not ortalaması 3.5/4.0 üzerinde olmak',
      deadline: new Date('2024-11-30'),
    }
  ]

  const createdApplications = []

  for (const appData of applications) {
    const application = await prisma.application.upsert({
      where: { id: appData.id },
      update: {},
      create: appData,
    })
    createdApplications.push(application)
  }

  // Create required documents
  const requiredDocuments = [
    {
      type: 'id_card',
      name: 'Kimlik Kartı',
      description: 'Nüfus cüzdanı veya kimlik kartı (önlü arkalı)',
      isRequired: true,
    },
    {
      type: 'transcript',
      name: 'Transkript',
      description: 'Güncel not dökümü/transkript belgesi',
      isRequired: true,
    },
    {
      type: 'income_statement',
      name: 'Gelir Belgesi',
      description: 'Aile gelir durumunu gösteren belge',
      isRequired: true,
    },
    {
      type: 'student_certificate',
      name: 'Öğrenci Belgesi',
      description: 'Güncel tarihli öğrenci belgesi',
      isRequired: true,
    },
    {
      type: 'residence_document',
      name: 'İkametgah Belgesi',
      description: 'Güncel ikametgah belgesi',
      isRequired: true,
    }
  ]

  for (const docData of requiredDocuments) {
    await prisma.requiredDocument.upsert({
      where: { type: docData.type },
      update: {},
      create: docData,
    })
  }

  // Create scholarship applications for users
  const scholarshipApplications = [
    {
      userId: createdUsers[0].id,
      applicationId: createdApplications[0].id,
      status: ApplicationStatus.PRE_APPROVED,
      applicationDate: new Date('2024-02-15'),
      preApprovalDate: new Date('2024-02-20'),
      scholarshipPeriod: '2024-2025',
      notes: 'Başvuru ön değerlendirmeden geçti.',
    },
    {
      userId: createdUsers[1].id,
      applicationId: createdApplications[0].id,
      status: ApplicationStatus.DOCUMENTS_SUBMITTED,
      applicationDate: new Date('2024-02-10'),
      preApprovalDate: new Date('2024-02-15'),
      documentSubmissionDate: new Date('2024-02-22'),
      scholarshipPeriod: '2024-2025',
      notes: 'Belgeler inceleniyor.',
    },
    {
      userId: createdUsers[2].id,
      applicationId: createdApplications[1].id,
      status: ApplicationStatus.FINAL_APPROVED,
      applicationDate: new Date('2024-01-20'),
      preApprovalDate: new Date('2024-01-25'),
      documentSubmissionDate: new Date('2024-01-30'),
      documentApprovalDate: new Date('2024-02-05'),
      interviewDate: new Date('2024-02-15'),
      interviewResult: 'passed',
      interviewNotes: 'Mülakat başarılı geçti.',
      finalApprovalDate: new Date('2024-02-20'),
      scholarshipPeriod: '2024-2025',
      amount: 3000,
      notes: 'Burs başvurusu onaylandı.',
    }
  ]

  const createdScholarshipApplications = []

  for (const schAppData of scholarshipApplications) {
    const schApp = await prisma.scholarshipApplication.create({
      data: schAppData,
    })
    createdScholarshipApplications.push(schApp)
  }

  // Create sample documents for users
  const documents = [
    {
      url: 'https://example.com/documents/user1_id_card.pdf',
      type: 'id_card',
      userId: createdUsers[0].id,
      scholarshipApplicationId: createdScholarshipApplications[0].id,
      status: DocumentStatus.APPROVED,
    },
    {
      url: 'https://example.com/documents/user1_transcript.pdf',
      type: 'transcript',
      userId: createdUsers[0].id,
      scholarshipApplicationId: createdScholarshipApplications[0].id,
      status: DocumentStatus.PENDING,
    },
    {
      url: 'https://example.com/documents/user2_id_card.pdf',
      type: 'id_card',
      userId: createdUsers[1].id,
      scholarshipApplicationId: createdScholarshipApplications[1].id,
      status: DocumentStatus.APPROVED,
    },
    {
      url: 'https://example.com/documents/user2_transcript.pdf',
      type: 'transcript',
      userId: createdUsers[1].id,
      scholarshipApplicationId: createdScholarshipApplications[1].id,
      status: DocumentStatus.APPROVED,
    },
    {
      url: 'https://example.com/documents/user2_income.pdf',
      type: 'income_statement',
      userId: createdUsers[1].id,
      scholarshipApplicationId: createdScholarshipApplications[1].id,
      status: DocumentStatus.REJECTED,
      rejectionReason: 'Belge okunamıyor, lütfen tekrar yükleyin.',
    },
    {
      url: 'https://example.com/documents/user3_id_card.pdf',
      type: 'id_card',
      userId: createdUsers[2].id,
      scholarshipApplicationId: createdScholarshipApplications[2].id,
      status: DocumentStatus.APPROVED,
    },
    {
      url: 'https://example.com/documents/user3_transcript.pdf',
      type: 'transcript',
      userId: createdUsers[2].id,
      scholarshipApplicationId: createdScholarshipApplications[2].id,
      status: DocumentStatus.APPROVED,
    },
    {
      url: 'https://example.com/documents/user3_income.pdf',
      type: 'income_statement',
      userId: createdUsers[2].id,
      scholarshipApplicationId: createdScholarshipApplications[2].id,
      status: DocumentStatus.APPROVED,
    }
  ]

  for (const docData of documents) {
    await prisma.document.create({
      data: docData,
    })
  }

  // Create notifications for users
  const notifications = [
    {
      userId: createdUsers[0].id,
      message: 'Başvurunuz ön değerlendirmeden geçmiştir. Lütfen gerekli belgeleri yükleyin.',
      type: NotificationType.APPLICATION_STATUS,
      read: false,
    },
    {
      userId: createdUsers[1].id,
      message: 'Gelir belgeniz reddedildi. Lütfen tekrar yükleyin.',
      type: NotificationType.DOCUMENT_STATUS,
      read: true,
    },
    {
      userId: createdUsers[2].id,
      message: 'Tebrikler! Burs başvurunuz onaylanmıştır.',
      type: NotificationType.APPLICATION_STATUS,
      read: false,
    },
    {
      userId: createdUsers[2].id,
      message: '15 Şubat 2024 tarihinde saat 14:00\'da mülakat için hazır olun.',
      type: NotificationType.INTERVIEW_INVITATION,
      read: true,
    }
  ]

  for (const notifData of notifications) {
    await prisma.notification.create({
      data: notifData,
    })
  }

  console.log('Seed data created successfully!')
  console.log({
    admin,
    adminAccount,
    usersCount: createdUsers.length,
    applicationsCount: createdApplications.length,
    scholarshipApplicationsCount: createdScholarshipApplications.length,
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 
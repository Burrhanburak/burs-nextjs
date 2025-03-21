import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { hash } from "bcrypt"
import { Resend } from "resend"

const prisma = new PrismaClient()
const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      tcKimlikNo,
      firstName,
      lastName,
      email,
      password,
      birthDate,
      profession,
      mobilePhone,
      university,
      grade,
      otherScholarship,
      otherScholarshipDetails,
      nationality,
    } = body

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { tcKimlikNo }],
      },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Bu e-posta veya TC Kimlik numarası ile kayıtlı bir kullanıcı zaten var." },
        { status: 400 },
      )
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        tcKimlikNo,
        firstName,
        lastName,
        email,
        password: hashedPassword,
        birthDate: new Date(birthDate),
        profession,
        mobilePhone,
        university,
        grade,
        otherScholarship,
        otherScholarshipDetails,
        nationality,
      },
    })

    // Send welcome email
    await resend.emails.send({
      from: "Bursiyer <noreply@bursiyer.com>",
      to: email,
      subject: "Bursiyer'e Hoş Geldiniz",
      html: `
        <h1>Merhaba ${firstName},</h1>
        <p>Bursiyer'e hoş geldiniz! Hesabınız başarıyla oluşturuldu.</p>
        <p>Burs başvurunuzu tamamlamak için lütfen <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">bursiyer panelinize</a> giriş yapın ve gerekli belgeleri yükleyin.</p>
        <p>Saygılarımızla,<br>Bursiyer Ekibi</p>
      `,
    })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
      },
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Kayıt sırasında bir hata oluştu." }, { status: 500 })
  }
}


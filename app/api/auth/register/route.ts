import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { z } from "zod"

// TC Kimlik validation regex
const tcKimlikRegex = /^[1-9]{1}[0-9]{10}$/

// Define schema for validation
const registerSchema = z
  .object({
    tcKimlikNo: z.string().regex(tcKimlikRegex, {
      message: "TC Kimlik numarası 11 haneli olmalı ve 0 ile başlamamalıdır.",
    }),
    firstName: z.string().min(2, {
      message: "İsim en az 2 karakter olmalıdır.",
    }),
    lastName: z.string().min(2, {
      message: "Soyisim en az 2 karakter olmalıdır.",
    }),
    email: z.string().email({
      message: "Geçerli bir e-posta adresi giriniz.",
    }),
    mobilePhone: z.string().min(10, {
      message: "Geçerli bir telefon numarası giriniz.",
    }),
    password: z.string().min(8, {
      message: "Şifre en az 8 karakter olmalıdır.",
    }),
    confirmPassword: z.string(),
    termsAccepted: z.boolean().refine((val) => val === true, {
      message: "Kullanım koşullarını kabul etmelisiniz.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
  })

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json()
    
    // Validate request body
    const validation = registerSchema.safeParse(body)
    if (!validation.success) {
      const errorMessage = validation.error.issues[0]?.message || "Geçersiz kayıt verileri"
      return NextResponse.json({ error: errorMessage }, { status: 400 })
    }

    const { 
      tcKimlikNo, 
      firstName, 
      lastName, 
      email, 
      mobilePhone, 
      password 
    } = validation.data

    // Check if user with email already exists
    const existingUserByEmail = await db.user.findUnique({
      where: { email },
    })

    if (existingUserByEmail) {
      return NextResponse.json({
        error: "Bu e-posta adresiyle kayıtlı bir kullanıcı zaten mevcut."
      }, { status: 409 })
    }

    // Check if user with TC Kimlik already exists
    const existingUserByTC = await db.user.findUnique({
      where: { tcKimlikNo },
    })

    if (existingUserByTC) {
      return NextResponse.json({
        error: "Bu TC Kimlik numarasıyla kayıtlı bir kullanıcı zaten mevcut."
      }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await db.user.create({
      data: {
        tcKimlikNo,
        firstName,
        lastName,
        email,
        password: hashedPassword,
        mobilePhone,
        role: "APPLICANT",
      },
    })

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({ 
      success: true, 
      message: "Kullanıcı başarıyla oluşturuldu. Lütfen e-posta adresinizi doğrulayın.", 
      user: userWithoutPassword 
    })
  } catch (error) {
    console.error("Error registering user:", error)
    return NextResponse.json(
      { error: "Kullanıcı kaydı sırasında bir hata oluştu" },
      { status: 500 }
    )
  }
} 
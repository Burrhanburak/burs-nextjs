import { PrismaClient } from "@prisma/client"
import { hash, genSalt } from "bcrypt"
import { generatePassword } from "@/lib/utils/password-generator"
import { sendWelcomeEmail } from "./email-service"

const prisma = new PrismaClient()

export async function createPreApprovedUser(userData: {
  tcKimlikNo: string
  firstName: string
  lastName: string
  email: string
  phone: string
  birthDate: Date
  profession?: string
}) {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: userData.email }, { tcKimlikNo: userData.tcKimlikNo }],
      },
    })

    if (existingUser) {
      throw new Error("Bu e-posta veya TC Kimlik numarası ile kayıtlı bir kullanıcı zaten var.")
    }

    // Generate a random password
    const generatedPassword = generatePassword()

    // Hash the password
    const salt = await genSalt(10)
    const hashedPassword = await hash(generatedPassword, salt)

    // Create the user
    const user = await prisma.user.create({
      data: {
        tcKimlikNo: userData.tcKimlikNo,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: hashedPassword,
        birthDate: userData.birthDate,
        profession: userData.profession || "",
        mobilePhone: userData.phone,
        status: "pre_approved",
        username: userData.tcKimlikNo, // Use TC Kimlik No as username
      },
    })

    // Create a pre-approved application
    const application = await prisma.scholarshipApplication.create({
      data: {
        userId: user.id,
        status: "pre_approved",
        applicationDate: new Date(),
        scholarshipPeriod: new Date().getFullYear().toString(),
      },
    })

    // Send welcome email with login credentials
    await sendWelcomeEmail({
      to: userData.email,
      firstName: userData.firstName,
      username: userData.tcKimlikNo,
      password: generatedPassword,
      applicationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    })

    return { user, application }
  } catch (error) {
    console.error("Error creating pre-approved user:", error)
    throw error
  }
}

export async function updateUserStatus(userId: string, status: string) {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { status },
    })

    return user
  } catch (error) {
    console.error("Error updating user status:", error)
    throw error
  }
}

export async function getUserByUsername(username: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { username },
    })

    return user
  } catch (error) {
    console.error("Error getting user by username:", error)
    throw error
  }
}


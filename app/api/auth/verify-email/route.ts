import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sendVerificationEmail } from "@/lib/services/email-service"
import crypto from "crypto"

// Generate a random verification code
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Generate a verification token
function generateVerificationToken() {
  return crypto.randomBytes(32).toString("hex");
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Check if the user exists
    const user = await db.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Generate verification code and token
    const verificationCode = generateVerificationCode()
    const verificationToken = generateVerificationToken()
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now

    // Store the verification token in the database
    // First, try to find an existing token for this email
    const existingToken = await db.verificationToken.findFirst({
      where: { identifier: email },
    })

    if (existingToken) {
      // Update existing token
      await db.verificationToken.update({
        where: { token: existingToken.token },
        data: {
          token: verificationToken,
          expires,
        },
      })
    } else {
      // Create new token
      await db.verificationToken.create({
        data: {
          identifier: email,
          token: verificationToken,
          expires,
        },
      })
    }

    // Store the verification code in the user record or a separate table
    await db.user.update({
      where: { email },
      data: {
        verificationCode,
      },
    })

    // Create verification link
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const verificationLink = `${baseUrl}/auth/verify?token=${verificationToken}`

    // Send verification email
    await sendVerificationEmail({
      to: email,
      firstName: user.firstName,
      verificationCode,
      verificationLink,
    })

    return NextResponse.json({ 
      success: true, 
      message: "Verification email sent" 
    })
  } catch (error) {
    console.error("Error sending verification email:", error)
    return NextResponse.json(
      { error: "An error occurred while sending verification email" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")
    const code = searchParams.get("code")
    const email = searchParams.get("email")

    if (!token && !code) {
      return NextResponse.json({ error: "Token or code is required" }, { status: 400 })
    }

    if (token) {
      // Verify token
      const verificationToken = await db.verificationToken.findUnique({
        where: { token },
      })

      if (!verificationToken) {
        return NextResponse.json({ error: "Invalid token" }, { status: 400 })
      }

      if (verificationToken.expires < new Date()) {
        return NextResponse.json({ error: "Token expired" }, { status: 400 })
      }

      // Update user email verification status
      await db.user.update({
        where: { email: verificationToken.identifier },
        data: {
          emailVerified: new Date(),
        },
      })

      // Delete the verification token
      await db.verificationToken.delete({
        where: { token },
      })

      return NextResponse.json({ 
        success: true,
        message: "Email verified successfully" 
      })
    } else if (code && email) {
      // Verify code
      const user = await db.user.findUnique({
        where: { email },
      })

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      if (user.verificationCode !== code) {
        return NextResponse.json({ error: "Invalid verification code" }, { status: 400 })
      }

      // Update user email verification status
      await db.user.update({
        where: { email },
        data: {
          emailVerified: new Date(),
          verificationCode: null, // Clear the verification code
        },
      })

      return NextResponse.json({ 
        success: true,
        message: "Email verified successfully" 
      })
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  } catch (error) {
    console.error("Error verifying email:", error)
    return NextResponse.json(
      { error: "An error occurred while verifying email" },
      { status: 500 }
    )
  }
} 
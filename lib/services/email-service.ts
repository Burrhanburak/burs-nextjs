import { Resend } from "resend"
import WelcomeEmail from "@/emails/welcome-email"
import InterviewInvitationEmail from "@/emails/interview-invitation-email"
import DocumentStatusEmail from "@/emails/document-status-email"
import ApplicationStatusEmail from "@/emails/application-status-email"

const resend = new Resend(process.env.RESEND_API_KEY)

interface WelcomeEmailProps {
  to: string
  firstName: string
  username: string
  password: string
  applicationUrl: string
}

export async function sendWelcomeEmail({ to, firstName, username, password, applicationUrl }: WelcomeEmailProps) {
  try {
    const data = await resend.emails.send({
      from: "Bursiyer <noreply@toptanmarketiz.com>",
      to,
      subject: "Bursiyer'e Hoş Geldiniz - Giriş Bilgileriniz",
      react: WelcomeEmail({
        firstName,
        username,
        password,
        applicationUrl,
      }),
    })

    return { success: true, data }
  } catch (error) {
    console.error("Error sending welcome email:", error)
    return { success: false, error }
  }
}

interface VerificationEmailProps {
  to: string
  firstName: string
  verificationCode: string
  verificationLink: string
}

export async function sendVerificationEmail({
  to,
  firstName,
  verificationCode,
  verificationLink,
}: VerificationEmailProps) {
  try {
    console.log("Sending verification email to:", to);
    console.log("Using verification code:", verificationCode);
    console.log("Using verification link:", verificationLink);
    
    const data = await resend.emails.send({
      from: "Bursiyer <noreply@toptanmarketiz.com>",
      to,
      subject: "Bursiyer Hesabınızı Doğrulayın",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #4338CA;">Merhaba ${firstName},</h2>
          <p>Bursiyer hesabınızı doğrulamak için lütfen aşağıdaki doğrulama kodunu kullanın veya doğrulama bağlantısına tıklayın.</p>
          
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
            <h3 style="margin: 0 0 10px 0;">Doğrulama Kodunuz</h3>
            <div style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #4338CA;">${verificationCode}</div>
          </div>
          
          <p>Alternatif olarak, hesabınızı doğrulamak için aşağıdaki bağlantıya tıklayabilirsiniz:</p>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="${verificationLink}" style="background-color: #4338CA; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Hesabımı Doğrula</a>
          </div>
          
          <p>Bu e-postayı siz talep etmediyseniz, lütfen dikkate almayın.</p>
          
          <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #6b7280;">
            <p>&copy; ${new Date().getFullYear()} Bursiyer. Tüm hakları saklıdır.</p>
          </div>
        </div>
      `,
    })

    console.log("Verification email sent successfully:", data);
    return { success: true, data }
  } catch (error) {
    console.error("Error sending verification email:", error)
    return { success: false, error }
  }
}

interface InterviewEmailProps {
  to: string
  firstName: string
  interviewDate: string
  interviewTime: string
  interviewLocation: string
  dashboardUrl: string
}

export async function sendInterviewInvitationEmail({
  to,
  firstName,
  interviewDate,
  interviewTime,
  interviewLocation,
  dashboardUrl,
}: InterviewEmailProps) {
  try {
    const data = await resend.emails.send({
      from: "Bursiyer <noreply@toptanmarketiz.com>",
      to,
      subject: "Burs Mülakatı Daveti",
      react: InterviewInvitationEmail({
        firstName,
        interviewDate,
        interviewTime,
        interviewLocation,
        dashboardUrl,
      }),
    })

    return { success: true, data }
  } catch (error) {
    console.error("Error sending interview invitation email:", error)
    return { success: false, error }
  }
}

interface DocumentStatusEmailProps {
  to: string
  firstName: string
  documentName: string
  status: "approved" | "rejected"
  rejectionReason?: string
  dashboardUrl: string
}

export async function sendDocumentStatusEmail({
  to,
  firstName,
  documentName,
  status,
  rejectionReason,
  dashboardUrl,
}: DocumentStatusEmailProps) {
  try {
    const data = await resend.emails.send({
      from: "Bursiyer <noreply@toptanmarketiz.com>",
      to,
      subject: `Belge Durumu: ${status === "approved" ? "Onaylandı" : "Reddedildi"}`,
      react: DocumentStatusEmail({
        firstName,
        documentName,
        status,
        rejectionReason,
        dashboardUrl,
      }),
    })

    return { success: true, data }
  } catch (error) {
    console.error("Error sending document status email:", error)
    return { success: false, error }
  }
}

interface ApplicationStatusEmailProps {
  to: string
  firstName: string
  status: "approved" | "rejected"
  rejectionReason?: string
  dashboardUrl: string
}

export async function sendApplicationStatusEmail({
  to,
  firstName,
  status,
  rejectionReason,
  dashboardUrl,
}: ApplicationStatusEmailProps) {
  try {
    const data = await resend.emails.send({
      from: "Bursiyer <noreply@toptanmarketiz.com>",
      to,
      subject: `Burs Başvurunuz ${status === "approved" ? "Onaylandı" : "Reddedildi"}`,
      react: ApplicationStatusEmail({
        firstName,
        status,
        rejectionReason,
        dashboardUrl,
      }),
    })

    return { success: true, data }
  } catch (error) {
    console.error("Error sending application status email:", error)
    return { success: false, error }
  }
}


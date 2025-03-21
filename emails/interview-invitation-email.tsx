import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components"

interface InterviewInvitationEmailProps {
  firstName: string
  interviewDate: string
  interviewTime: string
  interviewLocation: string
  dashboardUrl: string
}

export const InterviewInvitationEmail = ({
  firstName = "Ahmet",
  interviewDate = "25 Mart 2024",
  interviewTime = "10:00",
  interviewLocation = "Online - Zoom",
  dashboardUrl = "localhost:3000/dashboard",
}: InterviewInvitationEmailProps) => {
  const previewText = `Burs Mülakatı Daveti`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img src={`https://bursiyer.com/logo.png`} width="120" height="50" alt="Bursiyer" style={logo} />
          <Heading style={heading}>Burs Mülakatı Daveti</Heading>
          <Text style={paragraph}>Merhaba {firstName},</Text>
          <Text style={paragraph}>
            Burs başvurunuz ön değerlendirmeden geçmiş olup, mülakata davet edilmeye hak kazandınız. Mülakat detayları
            aşağıdaki gibidir:
          </Text>

          <Section style={infoBox}>
            <Text style={infoHeading}>Mülakat Bilgileri</Text>
            <Text style={infoItem}>
              <strong>Tarih:</strong> {interviewDate}
            </Text>
            <Text style={infoItem}>
              <strong>Saat:</strong> {interviewTime}
            </Text>
            <Text style={infoItem}>
              <strong>Lokasyon:</strong> {interviewLocation}
            </Text>
          </Section>

          <Text style={paragraph}>
            Mülakat için hazırlanmanızı ve belirtilen tarih ve saatte hazır bulunmanızı rica ederiz. Mülakat sırasında
            akademik başarılarınız, hedefleriniz ve burs ihtiyacınız hakkında sorular sorulacaktır.
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={dashboardUrl}>
              Mülakat Detaylarını Görüntüle
            </Button>
          </Section>

          <Text style={paragraph}>
            Eğer belirtilen tarih ve saatte mülakata katılamayacaksanız, lütfen en kısa sürede bizimle iletişime
            geçiniz.
          </Text>

          <Hr style={hr} />

          <Text style={footer}>Bursiyer Ekibi</Text>
          <Text style={footer}>
            <Link href="localhost:3000" style={link}>
              bursiyer.com
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default InterviewInvitationEmail

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px",
  maxWidth: "600px",
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
}

const logo = {
  margin: "0 auto",
  marginBottom: "20px",
  display: "block",
}

const heading = {
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "30px 0",
  color: "#1e40af",
}

const paragraph = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#333",
}

const infoBox = {
  backgroundColor: "#f8fafc",
  borderRadius: "8px",
  padding: "20px",
  margin: "20px 0",
  border: "1px solid #e2e8f0",
}

const infoHeading = {
  fontSize: "18px",
  fontWeight: "bold",
  margin: "0 0 15px 0",
  color: "#1e40af",
}

const infoItem = {
  fontSize: "16px",
  lineHeight: "24px",
  margin: "10px 0",
  color: "#333",
}

const buttonContainer = {
  textAlign: "center" as const,
  margin: "30px 0",
}

const button = {
  backgroundColor: "#1e40af",
  borderRadius: "4px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px 20px",
}

const hr = {
  borderColor: "#e6ebf1",
  margin: "30px 0",
}

const footer = {
  color: "#8898aa",
  fontSize: "14px",
  marginTop: "20px",
  textAlign: "center" as const,
}

const link = {
  color: "#1e40af",
  textDecoration: "underline",
}


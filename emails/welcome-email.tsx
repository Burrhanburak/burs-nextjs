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

interface WelcomeEmailProps {
  firstName: string
  username: string
  password: string
  applicationUrl: string
}

export const WelcomeEmail = ({
  firstName = "Ahmet",
  username = "12345678901",
  password = "P@ssw0rd123",
  applicationUrl = "https://bursiyer.com/dashboard",
}: WelcomeEmailProps) => {
  const previewText = `Bursiyer'e Hoş Geldiniz!`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img src={`https://bursiyer.com/logo.png`} width="120" height="50" alt="Bursiyer" style={logo} />
          <Heading style={heading}>Bursiyer'e Hoş Geldiniz!</Heading>
          <Text style={paragraph}>Merhaba {firstName},</Text>
          <Text style={paragraph}>
            Bursiyer'e hoş geldiniz! Burs başvurunuz ön değerlendirmeden geçmiş olup, sisteme giriş yaparak belge
            yükleme işlemlerinizi tamamlamanız gerekmektedir.
          </Text>

          <Section style={infoBox}>
            <Text style={infoHeading}>Giriş Bilgileriniz</Text>
            <Text style={infoItem}>
              <strong>Kullanıcı Adı:</strong> {username}
            </Text>
            <Text style={infoItem}>
              <strong>Şifre:</strong> {password}
            </Text>
            <Text style={infoItemSmall}>
              (Güvenliğiniz için giriş yaptıktan sonra şifrenizi değiştirmenizi öneririz.)
            </Text>
          </Section>

          <Section style={buttonContainer}>
            <Button style={button} href={applicationUrl}>
              Bursiyer Paneline Git
            </Button>
          </Section>

          <Text style={paragraph}>Burs başvurunuzu tamamlamak için gerekli belgeleri yüklemeniz gerekmektedir:</Text>
          <ul style={list}>
            <li style={listItem}>Transkript (Not dökümü belgesi)</li>
            <li style={listItem}>Kimlik belgesi</li>
            <li style={listItem}>Öğrenci belgesi</li>
            <li style={listItem}>Gelir belgesi</li>
          </ul>
          <Text style={paragraph}>
            Tüm belgeleriniz onaylandıktan sonra, başvurunuz değerlendirmeye alınacak ve mülakata davet
            edilebileceksiniz.
          </Text>
          <Hr style={hr} />
          <Text style={footer}>Bursiyer Ekibi</Text>
          <Text style={footer}>
            <Link href="https://bursiyer.com" style={link}>
              bursiyer.com
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default WelcomeEmail

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
  backgroundColor: "#f0f9ff",
  borderRadius: "8px",
  padding: "20px",
  margin: "20px 0",
  border: "1px solid #bae6fd",
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

const infoItemSmall = {
  fontSize: "14px",
  lineHeight: "20px",
  margin: "10px 0",
  color: "#666",
  fontStyle: "italic",
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

const list = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
}

const listItem = {
  margin: "10px 0",
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


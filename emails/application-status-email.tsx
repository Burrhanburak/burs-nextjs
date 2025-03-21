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

interface ApplicationStatusEmailProps {
  firstName: string
  status: "approved" | "rejected"
  rejectionReason?: string
  dashboardUrl: string
}

export const ApplicationStatusEmail = ({
  firstName = "Ahmet",
  status = "approved",
  rejectionReason = "",
  dashboardUrl = "https://bursiyer.com/dashboard",
}: ApplicationStatusEmailProps) => {
  const previewText = `Burs Başvurunuz ${status === "approved" ? "Onaylandı" : "Reddedildi"}`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img src={`https://bursiyer.com/logo.png`} width="120" height="50" alt="Bursiyer" style={logo} />
          <Heading
            style={{
              ...heading,
              color: status === "approved" ? "#16a34a" : "#dc2626",
            }}
          >
            Burs Başvurunuz {status === "approved" ? "Onaylandı" : "Reddedildi"}
          </Heading>
          <Text style={paragraph}>Merhaba {firstName},</Text>

          {status === "approved" ? (
            <>
              <Text style={paragraph}>
                Burs başvurunuz değerlendirilmiş ve <strong>onaylanmıştır</strong>. Tebrikler!
              </Text>

              <Section
                style={{
                  ...infoBox,
                  backgroundColor: "#f0fdf4",
                  borderColor: "#86efac",
                }}
              >
                <Text
                  style={{
                    ...infoHeading,
                    color: "#16a34a",
                  }}
                >
                  Burs Başvurunuz Onaylandı
                </Text>
                <Text style={infoItem}>
                  Burs başvurunuz başarıyla değerlendirilmiş ve onaylanmıştır. Burs ödemeleriniz ile ilgili detaylar en
                  kısa sürede tarafınıza iletilecektir.
                </Text>
                <Text style={infoItem}>
                  Burs süreciniz boyunca, akademik başarınızı sürdürmeniz ve dönem sonlarında transkriptlerinizi sisteme
                  yüklemeniz gerekmektedir.
                </Text>
              </Section>

              <Text style={paragraph}>
                Bursiyer ailemize hoş geldiniz! Herhangi bir sorunuz olursa, lütfen bizimle iletişime geçmekten
                çekinmeyin.
              </Text>
            </>
          ) : (
            <>
              <Text style={paragraph}>
                Burs başvurunuz değerlendirilmiş ve maalesef <strong>reddedilmiştir</strong>.
              </Text>

              <Section
                style={{
                  ...infoBox,
                  backgroundColor: "#fef2f2",
                  borderColor: "#fecaca",
                }}
              >
                <Text
                  style={{
                    ...infoHeading,
                    color: "#dc2626",
                  }}
                >
                  Burs Başvurunuz Reddedildi
                </Text>
                <Text style={infoItem}>
                  <strong>Red Nedeni:</strong> {rejectionReason}
                </Text>
              </Section>

              <Text style={paragraph}>
                Gelecek dönemlerde tekrar başvuru yapabilirsiniz. Anlayışınız için teşekkür ederiz.
              </Text>
            </>
          )}

          <Section style={buttonContainer}>
            <Button
              style={{
                ...button,
                backgroundColor: status === "approved" ? "#16a34a" : "#dc2626",
              }}
              href={dashboardUrl}
            >
              Bursiyer Paneline Git
            </Button>
          </Section>

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

export default ApplicationStatusEmail

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
}

const paragraph = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#333",
}

const infoBox = {
  borderRadius: "8px",
  padding: "20px",
  margin: "20px 0",
  border: "1px solid",
}

const infoHeading = {
  fontSize: "18px",
  fontWeight: "bold",
  margin: "0 0 15px 0",
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


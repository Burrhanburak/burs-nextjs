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

interface DocumentStatusEmailProps {
  firstName: string
  documentName: string
  status: "approved" | "rejected"
  rejectionReason?: string
  dashboardUrl: string
}

export const DocumentStatusEmail = ({
  firstName = "Ahmet",
  documentName = "transkript.pdf",
  status = "approved",
  rejectionReason = "",
  dashboardUrl = "https://bursiyer.com/dashboard/documents",
}: DocumentStatusEmailProps) => {
  const previewText = `Belge Durumu: ${status === "approved" ? "Onaylandı" : "Reddedildi"}`

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
            Belge Durumu: {status === "approved" ? "Onaylandı" : "Reddedildi"}
          </Heading>
          <Text style={paragraph}>Merhaba {firstName},</Text>
          <Text style={paragraph}>
            Yüklemiş olduğunuz <strong>{documentName}</strong> belgesi incelenmiştir.
          </Text>

          {status === "approved" ? (
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
                Belgeniz Onaylanmıştır
              </Text>
              <Text style={infoItem}>
                Belgeniz başarıyla incelenmiş ve onaylanmıştır. Burs başvuru süreciniz devam etmektedir.
              </Text>
            </Section>
          ) : (
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
                Belgeniz Reddedilmiştir
              </Text>
              <Text style={infoItem}>
                <strong>Red Nedeni:</strong> {rejectionReason}
              </Text>
              <Text style={infoItem}>Lütfen belgenizi kontrol edip tekrar yükleyiniz.</Text>
            </Section>
          )}

          <Section style={buttonContainer}>
            <Button
              style={{
                ...button,
                backgroundColor: status === "approved" ? "#16a34a" : "#dc2626",
              }}
              href={dashboardUrl}
            >
              Belgelerim Sayfasına Git
            </Button>
          </Section>

          <Text style={paragraph}>
            Burs başvuru sürecinizle ilgili tüm gelişmeleri bursiyer panelinizden takip edebilirsiniz.
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

export default DocumentStatusEmail

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


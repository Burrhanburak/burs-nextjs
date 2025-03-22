"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import StudentCertificateUpload from "../student-certificate-upload"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { RiArrowLeftLine } from "@remixicon/react"

export default function StudentCertificatePage() {
  const [isUploaded, setIsUploaded] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState<string>("")
  const router = useRouter()
  
  const handleUploadComplete = (file: File, url: string) => {
    console.log("File uploaded:", file, "URL:", url)
    setUploadedUrl(url)
    setIsUploaded(true)
    
    // Redirect back to documents page after a brief delay
    setTimeout(() => {
      router.push("/user/documents")
      // Force a reload of the page to refresh the document list
      router.refresh()
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => router.back()}
        >
          <RiArrowLeftLine className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Öğrenci Belgesi Yükleme</h1>
      </div>
      
      <Separator />
      
      {isUploaded ? (
        <Card>
          <CardHeader>
            <CardTitle>Yükleme Başarılı</CardTitle>
            <CardDescription>
              Öğrenci belgeniz başarıyla yüklendi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Öğrenci belgeniz başarıyla yüklendi. Belge incelendikten sonra size bildirim gönderilecektir.
            </p>
            {uploadedUrl && (
              <Button 
                variant="outline" 
                asChild
                className="mt-2"
              >
                <a href={uploadedUrl} target="_blank" rel="noopener noreferrer">
                  Belgeyi Görüntüle
                </a>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <StudentCertificateUpload onUploadComplete={handleUploadComplete} />
      )}
    </div>
  )
} 
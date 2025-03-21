"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "sonner"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import Link from "next/link"
import { RiAlertLine, RiCheckLine, RiInformationLine } from "@remixicon/react"

interface Scholarship {
  id: string
  title: string
  description: string
  requirements: string
  deadline: string
}

interface RequiredDocument {
  id: string
  type: string
  name: string
  description: string
  isRequired: boolean
}

export default function ScholarshipApplyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const scholarshipId = searchParams.get("id")
  
  const [scholarship, setScholarship] = useState<Scholarship | null>(null)
  const [requiredDocuments, setRequiredDocuments] = useState<RequiredDocument[]>([])
  const [hasApplied, setHasApplied] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)

  useEffect(() => {
    if (!scholarshipId) {
      toast.error("Burs programı ID'si belirtilmedi")
      router.push("/scholarships")
      return
    }

    const fetchScholarshipDetails = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/scholarships/${scholarshipId}`)
        if (!response.ok) {
          throw new Error("Burs programı detayları alınırken bir hata oluştu")
        }
        const data = await response.json()
        setScholarship(data.scholarship)
        setRequiredDocuments(data.requiredDocuments)
        setHasApplied(data.hasApplied)
      } catch (error) {
        console.error("Burs programı detayları getirme hatası:", error)
        toast.error("Burs programı detayları yüklenirken bir hata oluştu")
        router.push("/scholarships")
      } finally {
        setIsLoading(false)
      }
    }

    fetchScholarshipDetails()
  }, [scholarshipId, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!termsAccepted) {
      toast.error("Devam etmek için şartları ve koşulları kabul etmelisiniz")
      return
    }

    try {
      setIsSubmitting(true)
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationId: scholarshipId,
        }),
      })

      if (!response.ok) {
        throw new Error("Başvuru oluşturulurken bir hata oluştu")
      }

      const data = await response.json()
      toast.success("Başvurunuz başarıyla oluşturuldu")
      // Redirect to application detail page
      router.push(`/applications/${data.id}`)
    } catch (error) {
      console.error("Başvuru oluşturma hatası:", error)
      toast.error("Başvurunuz oluşturulurken bir hata oluştu")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary mx-auto mb-3"></div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Burs programı bilgileri yükleniyor...
          </div>
        </div>
      </div>
    )
  }

  if (!scholarship) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="rounded-full bg-red-100 p-3 text-red-600 mx-auto mb-3">
            <RiAlertLine className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-medium mb-1">Burs Programı Bulunamadı</h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-6">
            Belirtilen burs programı bulunamadı veya artık mevcut değil.
          </p>
          <Link href="/scholarships">
            <Button>Burs Programlarına Dön</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (hasApplied) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link href="/scholarships" className="text-sm text-muted-foreground hover:underline">
            ← Burs Programlarına Dön
          </Link>
        </div>
        
        <Alert className="mb-6 bg-green-50 border-green-200">
          <RiCheckLine className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Başvuru Yapılmış</AlertTitle>
          <AlertDescription className="text-green-700">
            Bu burs programına zaten başvuruda bulundunuz. Başvurunuzun durumunu "Burs Başvurularım" sayfasından takip edebilirsiniz.
          </AlertDescription>
        </Alert>
        
        <Card>
          <CardHeader>
            <CardTitle>{scholarship.title}</CardTitle>
            <CardDescription>{scholarship.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">Başvuru Detayları</h3>
                <p className="text-sm text-muted-foreground">
                  Başvurunuz değerlendirme sürecindedir. Başvurunuzun durumunu "Burs Başvurularım" sayfasından takip edebilirsiniz.
                </p>
              </div>
              
              <div className="text-sm flex items-center text-muted-foreground">
                <span>Son Başvuru Tarihi: {format(new Date(scholarship.deadline), "d MMMM yyyy", { locale: tr })}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/applications">
              <Button>Başvurularıma Git</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/scholarships" className="text-sm text-muted-foreground hover:underline">
          ← Burs Programlarına Dön
        </Link>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Burs Başvurusu Oluştur</CardTitle>
          <CardDescription>
            {scholarship.title} burs programına başvuru yapıyorsunuz. Başvurunuzu tamamlamak için aşağıdaki adımları izleyin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Burs Programı Bilgileri</h3>
                <div className="space-y-4">
                  <div>
                    <Label>Burs Programı</Label>
                    <div className="text-sm mt-1">{scholarship.title}</div>
                  </div>
                  <div>
                    <Label>Açıklama</Label>
                    <div className="text-sm mt-1">{scholarship.description}</div>
                  </div>
                  <div>
                    <Label>Gereksinimler</Label>
                    <div className="text-sm mt-1 whitespace-pre-line">{scholarship.requirements}</div>
                  </div>
                  <div>
                    <Label>Son Başvuru Tarihi</Label>
                    <div className="text-sm mt-1">
                      {format(new Date(scholarship.deadline), "d MMMM yyyy", { locale: tr })}
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-3">Gerekli Belgeler</h3>
                <Alert className="mb-4 bg-blue-50 border-blue-200">
                  <RiInformationLine className="h-4 w-4 text-blue-600" />
                  <AlertTitle className="text-blue-800">Belgelerinizi Hazırlayın</AlertTitle>
                  <AlertDescription className="text-blue-700">
                    Başvuru onaylandıktan sonra, aşağıdaki belgeleri sisteme yüklemeniz gerekecektir.
                    Başvurunuzu şimdi oluşturabilir, belgeleri daha sonra yükleyebilirsiniz.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-3">
                  {requiredDocuments.map((doc) => (
                    <div key={doc.id} className="p-3 border rounded-md">
                      <div className="font-medium">{doc.name}</div>
                      <div className="text-sm text-muted-foreground">{doc.description}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="terms" 
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Şartlar ve Koşullar
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Verdiğim bilgilerin doğruluğunu, burs programının şartlarını ve koşullarını
                    kabul ediyorum.
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !termsAccepted}
                >
                  {isSubmitting ? "Başvuru Yapılıyor..." : "Başvuruyu Tamamla"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 
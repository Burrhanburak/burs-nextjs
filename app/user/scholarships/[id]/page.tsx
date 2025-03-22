"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "sonner"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import Link from "next/link"
import { RiCalendarLine, RiTimeLine, RiArrowRightLine, RiInformationLine } from "@remixicon/react"

interface Scholarship {
  id: string
  title: string
  description: string
  requirements: string
  deadline: string
}

interface ScholarshipDetailProps {
  params: {
    id: string
  }
}

export default function ScholarshipDetailPage({ params }: ScholarshipDetailProps) {
  const { id } = params
  
  const [scholarship, setScholarship] = useState<Scholarship | null>(null)
  const [hasApplied, setHasApplied] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchScholarshipDetails = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/scholarships/${id}`)
        if (!response.ok) {
          throw new Error("Burs programı detayları alınırken bir hata oluştu")
        }
        const data = await response.json()
        setScholarship(data.scholarship)
        setHasApplied(data.hasApplied)
      } catch (error) {
        console.error("Burs programı detayları getirme hatası:", error)
        toast.error("Burs programı detayları yüklenirken bir hata oluştu")
      } finally {
        setIsLoading(false)
      }
    }

    fetchScholarshipDetails()
  }, [id])

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
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Burs Programı Bulunamadı</h1>
          <p className="text-muted-foreground">
            İstediğiniz burs programı bulunamadı veya artık mevcut değil.
          </p>
        </div>
        
        <Separator />
        
        <div className="flex justify-center">
          <Link href="/scholarships">
            <Button>Burs Programlarına Dön</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/scholarships" className="text-sm text-muted-foreground hover:underline mb-4 inline-block">
          ← Burs Programlarına Dön
        </Link>
        <h1 className="text-2xl font-bold mt-2">{scholarship.title}</h1>
        <p className="text-muted-foreground">
          Burs programı detayları ve başvuru bilgileri.
        </p>
      </div>
      
      <Separator />
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Program Detayları</CardTitle>
              <CardDescription>
                Bu burs programı hakkında detaylı bilgiler.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">Açıklama</h3>
                <p className="text-sm text-muted-foreground">
                  {scholarship.description}
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">Gereksinimler</h3>
                <div className="text-sm text-muted-foreground whitespace-pre-line">
                  {scholarship.requirements}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Başvuru Süreci</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="p-3 border rounded-md bg-muted/50">
                  <h4 className="font-medium mb-1">1. Başvuru Oluşturma</h4>
                  <p className="text-sm text-muted-foreground">
                    Başvuru formunu doldurarak başvurunuzu oluşturun. Başvurunuz inceleme sürecine alınacaktır.
                  </p>
                </div>
                <div className="p-3 border rounded-md bg-muted/50">
                  <h4 className="font-medium mb-1">2. Evrak Yükleme</h4>
                  <p className="text-sm text-muted-foreground">
                    Başvurunuz ön onaydan geçerse, gerekli belgeleri yüklemeniz istenecektir.
                  </p>
                </div>
                <div className="p-3 border rounded-md bg-muted/50">
                  <h4 className="font-medium mb-1">3. Değerlendirme</h4>
                  <p className="text-sm text-muted-foreground">
                    Yüklediğiniz belgeler incelenecek ve başvurunuz değerlendirilecektir.
                  </p>
                </div>
                <div className="p-3 border rounded-md bg-muted/50">
                  <h4 className="font-medium mb-1">4. Mülakat (Gerekirse)</h4>
                  <p className="text-sm text-muted-foreground">
                    Gerekli görülürse bir mülakat planlanabilir.
                  </p>
                </div>
                <div className="p-3 border rounded-md bg-muted/50">
                  <h4 className="font-medium mb-1">5. Sonuç</h4>
                  <p className="text-sm text-muted-foreground">
                    Değerlendirme sonucunda başvurunuz onaylanabilir veya reddedilebilir.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Başvuru Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center text-sm">
                <RiCalendarLine className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Son Başvuru: <span className="font-medium">{format(new Date(scholarship.deadline), "d MMMM yyyy", { locale: tr })}</span></span>
              </div>
              
              <div className="flex items-center text-sm">
                <RiTimeLine className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Kalan Süre: <span className="font-medium">
                  {Math.ceil((new Date(scholarship.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} gün
                </span></span>
              </div>
              
              {hasApplied && (
                <Alert className="mt-4 bg-green-50 border-green-200">
                  <AlertTitle className="text-green-800">Başvuru Yapıldı</AlertTitle>
                  <AlertDescription className="text-green-700">
                    Bu programa zaten başvurdunuz. Başvurunuzun durumunu kontrol edin.
                  </AlertDescription>
                </Alert>
              )}
              
              {!hasApplied && (
                <Alert className="mt-4 bg-blue-50 border-blue-200">
                  <RiInformationLine className="h-4 w-4 text-blue-600" />
                  <AlertTitle className="text-blue-800">Başvuru Yapabilirsiniz</AlertTitle>
                  <AlertDescription className="text-blue-700">
                    Bu programa henüz başvurmadınız. Aşağıdaki butonu kullanarak hemen başvurabilirsiniz.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              {hasApplied ? (
                <Link href="/user/applications" className="w-full">
                  <Button className="w-full">
                    Başvurularıma Git
                  </Button>
                </Link>
              ) : (
                <Link href={`/scholarships/apply?id=${scholarship.id}`} className="w-full">
                  <Button className="w-full flex items-center justify-center">
                    <span className="mr-1">Hemen Başvur</span>
                    <RiArrowRightLine className="h-4 w-4" />
                  </Button>
                </Link>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
} 
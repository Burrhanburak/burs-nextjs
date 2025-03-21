"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useEffect, useState } from "react"
import { 
  RiFileListLine, 
  RiCalendarLine, 
  RiArrowRightLine,
  RiCheckLine, 
  RiCloseLine,
  RiTimeLine
} from "@remixicon/react"
import { toast } from "sonner"
import Link from "next/link"

interface Application {
  id: string
  application: {
    title: string
    description: string
  }
  status: string
  applicationDate: string
  documents: {
    id: string
    status: string
    type?: string
  }[]
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setIsLoading(true)
        // Gerçek API çağrısı yapılıyor
        const response = await fetch("/api/applications")
        if (!response.ok) {
          throw new Error("Başvurular alınırken bir hata oluştu")
        }
        const data = await response.json()
        setApplications(data)
      } catch (error) {
        console.error("Başvuruları getirme hatası:", error)
        toast.error("Başvurular yüklenirken bir hata oluştu")
      } finally {
        setIsLoading(false)
      }
    }

    fetchApplications()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <RiTimeLine className="mr-1 h-3 w-3" />
            Beklemede
          </Badge>
        )
      case "PRE_APPROVED":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <RiCheckLine className="mr-1 h-3 w-3" />
            Ön Onaylandı
          </Badge>
        )
      case "PRE_REJECTED":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <RiCloseLine className="mr-1 h-3 w-3" />
            Ön Reddedildi
          </Badge>
        )
      case "DOCUMENT_REQUIRED":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Evrak Gerekli
          </Badge>
        )
      case "DOCUMENTS_SUBMITTED":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            Evraklar Yüklendi
          </Badge>
        )
      case "DOCUMENTS_APPROVED":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Evraklar Onaylandı
          </Badge>
        )
      case "DOCUMENTS_REJECTED":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Evraklar Reddedildi
          </Badge>
        )
      case "INTERVIEW_SCHEDULED":
        return (
          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
            Mülakat Planlandı
          </Badge>
        )
      case "INTERVIEW_COMPLETED":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            Mülakat Tamamlandı
          </Badge>
        )
      case "FINAL_APPROVED":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <RiCheckLine className="mr-1 h-3 w-3" />
            Onaylandı
          </Badge>
        )
      case "FINAL_REJECTED":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <RiCloseLine className="mr-1 h-3 w-3" />
            Reddedildi
          </Badge>
        )
      default:
        return (
          <Badge variant="outline">{status}</Badge>
        )
    }
  }

  const calculateProgress = (documents: { id: string; status: string }[]) => {
    if (documents.length === 0) return 0
    const approvedCount = documents.filter(doc => doc.status === "APPROVED").length
    return (approvedCount / documents.length) * 100
  }

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary mx-auto mb-3"></div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Başvurularınız yükleniyor...
          </div>
        </div>
      </div>
    )
  }

  if (applications.length === 0) {
    return (
      <div className="space-y-9">
        <div>
          <h1 className="text-2xl font-bold">Burs Başvurularım</h1>
          <p className="text-muted-foreground">
            Henüz bir burs başvurunuz bulunmamaktadır.
          </p>
        </div>
        
        <Separator />
        
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-3 mb-4">
            <RiFileListLine className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-1">Başvuru Bulunamadı</h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-6">
            Henüz bir burs başvurunuz bulunmuyor. Aktif burs programlarına başvurmak için aşağıdaki butonu kullanabilirsiniz.
          </p>
          <div className="flex gap-3">
           
            <Link href="/applications/create">
              <Button>
                Başvuru Oluştur
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 ">
      <div>
        <h1 className="text-2xl font-bold">Burs Başvurularım</h1>
        
        <p className="text-muted-foreground">
          Tüm burs başvurularınızı buradan görüntüleyebilirsiniz.
        </p>
      
      </div>
      
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Separator className="flex-grow" />
        <Link href="/applications/create">
          <Button className="flex items-center whitespace-nowrap">
            <span className="mr-2">Yeni Başvuru</span>
            <RiArrowRightLine className="h-4 w-4" />
          </Button>
        </Link>
      </div>
      
      <Separator />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {applications.map((application) => (
          <Link href={`/applications/${application.id}`} key={application.id}>
            <Card className="h-full transition-all hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{application.application.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {application.application.description}
                    </CardDescription>
                  </div>
                  <div>{getStatusBadge(application.status)}</div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <RiCalendarLine className="mr-1 h-4 w-4" />
                      <span>{new Date(application.applicationDate).toLocaleDateString("tr-TR")}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <RiFileListLine className="mr-1 h-4 w-4" />
                      <span>
                        {application.documents.filter((doc) => doc.status === "APPROVED").length}/
                        {application.documents.length} Evrak
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">Belge Durumu</div>
                    <Progress value={calculateProgress(application.documents)} />
                  </div>
                  
                  <div className="flex items-center justify-end text-sm font-medium">
                    <span className="mr-1">Detayları görüntüle</span>
                    <RiArrowRightLine className="h-4 w-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
} 
"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import Link from "next/link"
import { 
  RiCalendarLine, 
  RiCheckLine, 
  RiCloseLine,
  RiTimeLine,
  RiUploadCloud2Line
} from "@remixicon/react"

interface Application {
  id: string
  application: {
    title: string
    description: string
  }
  status: string
  applicationDate: string
  notes?: string
  documents: {
    id: string
    status: string
    type?: string
    url: string
  }[]
}

interface ApplicationDetailProps {
  params: {
    id: string
  }
}

export default function ApplicationDetailPage({ params }: ApplicationDetailProps) {
  const { id } = params
  
  const [application, setApplication] = useState<Application | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchApplicationDetails = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/applications/${id}`)
        if (!response.ok) {
          throw new Error("Başvuru detayları alınırken bir hata oluştu")
        }
        const data = await response.json()
        setApplication(data)
      } catch (error) {
        console.error("Başvuru detayları getirme hatası:", error)
        toast.error("Başvuru detayları yüklenirken bir hata oluştu")
      } finally {
        setIsLoading(false)
      }
    }

    fetchApplicationDetails()
  }, [id])

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
            Başvuru detayları yükleniyor...
          </div>
        </div>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Başvuru Bulunamadı</h1>
          <p className="text-muted-foreground">
            İstediğiniz başvuru bulunamadı veya artık mevcut değil.
          </p>
        </div>
        
        <Separator />
        
        <div className="flex justify-center">
          <Link href="/user/applications">
            <Button>Başvurularıma Dön</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/user/applications" className="text-sm text-muted-foreground hover:underline mb-4 inline-block">
          ← Başvurularıma Dön
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mt-2">{application.application.title}</h1>
            <p className="text-muted-foreground">
              Başvuru detayları ve durumu
            </p>
          </div>
          <div>
            {getStatusBadge(application.status)}
          </div>
        </div>
      </div>
      
      <Separator />
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Başvuru Detayları</CardTitle>
              <CardDescription>
                Başvurunuz hakkında detaylı bilgiler.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">Program Bilgisi</h3>
                <p className="text-sm text-muted-foreground break-words">
                  {application.notes && application.notes.startsWith("Özel Burs:") 
                    ? (() => {
                        const matches = application.notes.match(/^Özel Burs: ([^-]+)(?:\s*-\s*(.*))?$/);
                        if (matches) {
                          const [, bursAdi, notlar] = matches;
                          return (
                            <>
                              <strong>Özel Burs Başvurusu: </strong>{bursAdi.trim()}
                              {notlar && <><br /><br />{notlar.trim()}</>}
                            </>
                          );
                        }
                        return application.notes;
                      })()
                    : application.application.description
                  }
                </p>
              </div>
              
              <div className="flex items-center text-sm">
                <div className="flex items-center text-muted-foreground">
                  <RiCalendarLine className="mr-1 h-4 w-4 flex-shrink-0" />
                  <span>Başvuru Tarihi: {format(new Date(application.applicationDate), "d MMMM yyyy", { locale: tr })}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>Gerekli Belgeler</CardTitle>
                <Link href={`/user/applications/${id}/documents`}>
                  <Button variant="outline" size="sm" className="flex items-center">
                    <RiUploadCloud2Line className="mr-1 h-4 w-4" />
                    Belge Yükle
                  </Button>
                </Link>
              </div>
              <CardDescription>
                Başvurunuz için gerekli belgelerin durumu.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Belge Durumu</span>
                    <span>
                      {application.documents.filter(doc => doc.status === "APPROVED").length}/
                      {application.documents.length} Onaylandı
                    </span>
                  </div>
                  <Progress value={calculateProgress(application.documents)} />
                </div>
                
                <div className="space-y-3">
                  {application.documents.map((document) => (
                    <div 
                      key={document.id} 
                      className="p-3 border rounded-md flex flex-wrap sm:flex-nowrap justify-between items-center gap-2"
                    >
                      <div className="w-full sm:w-auto">
                        <div className="font-medium">{document.type}</div>
                        <div className="text-xs text-muted-foreground">
                          {document.status === "PENDING" && "Beklemede"}
                          {document.status === "APPROVED" && "Onaylandı"}
                          {document.status === "REJECTED" && "Reddedildi"}
                        </div>
                      </div>
                      <div className="flex items-center ml-auto">
                        {document.url ? (
                          <a 
                            href={document.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline mr-2"
                          >
                            Görüntüle
                          </a>
                        ) : (
                          <span className="text-sm text-muted-foreground mr-2">
                            Yüklenmedi
                          </span>
                        )}
                        
                        {document.status === "APPROVED" && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 whitespace-nowrap">
                            <RiCheckLine className="mr-1 h-3 w-3 flex-shrink-0" />
                            Onaylandı
                          </Badge>
                        )}
                        
                        {document.status === "REJECTED" && (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 whitespace-nowrap">
                            <RiCloseLine className="mr-1 h-3 w-3 flex-shrink-0" />
                            Reddedildi
                          </Badge>
                        )}
                        
                        {document.status === "PENDING" && (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 whitespace-nowrap">
                            <RiTimeLine className="mr-1 h-3 w-3 flex-shrink-0" />
                            Beklemede
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="order-first md:order-last">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Başvuru Durumu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="text-sm font-medium">Durum Aşamaları</div>
                
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className={`rounded-full p-1.5 ${application.status === "PENDING" || application.status === "PRE_APPROVED" || application.status === "PRE_REJECTED" ? "bg-green-100 text-green-600" : "bg-muted text-muted-foreground"}`}>
                      <RiCheckLine className="h-3 w-3" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-medium">Başvuru Yapıldı</div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(application.applicationDate), "d MMMM yyyy", { locale: tr })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className={`rounded-full p-1.5 ${application.status === "PRE_APPROVED" || application.status === "DOCUMENT_REQUIRED" || application.status === "DOCUMENTS_SUBMITTED" || application.status === "DOCUMENTS_APPROVED" || application.status === "DOCUMENTS_REJECTED" ? "bg-green-100 text-green-600" : "bg-muted text-muted-foreground"}`}>
                      {application.status === "PRE_REJECTED" ? (
                        <RiCloseLine className="h-3 w-3" />
                      ) : (
                        <RiCheckLine className="h-3 w-3" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-medium">Ön Değerlendirme</div>
                      <div className="text-xs text-muted-foreground">
                        {application.status === "PENDING" ? "Bekleniyor" : "Tamamlandı"}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className={`rounded-full p-1.5 ${application.status === "DOCUMENTS_APPROVED" || application.status === "INTERVIEW_SCHEDULED" || application.status === "INTERVIEW_COMPLETED" ? "bg-green-100 text-green-600" : application.status === "DOCUMENTS_REJECTED" ? "bg-red-100 text-red-600" : "bg-muted text-muted-foreground"}`}>
                      {application.status === "DOCUMENTS_REJECTED" ? (
                        <RiCloseLine className="h-3 w-3" />
                      ) : (
                        <RiCheckLine className="h-3 w-3" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-medium">Belge Kontrolü</div>
                      <div className="text-xs text-muted-foreground">
                        {application.status === "PENDING" || application.status === "PRE_APPROVED" || application.status === "PRE_REJECTED" ? 
                          "Bekleniyor" : 
                          application.status === "DOCUMENT_REQUIRED" || application.status === "DOCUMENTS_SUBMITTED" ? 
                            "İnceleniyor" : 
                            "Tamamlandı"
                        }
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className={`rounded-full p-1.5 ${application.status === "INTERVIEW_COMPLETED" ? "bg-green-100 text-green-600" : "bg-muted text-muted-foreground"}`}>
                      <RiCheckLine className="h-3 w-3" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-medium">Mülakat</div>
                      <div className="text-xs text-muted-foreground">
                        {application.status === "INTERVIEW_SCHEDULED" ? 
                          "Planlandı" : 
                          application.status === "INTERVIEW_COMPLETED" ? 
                            "Tamamlandı" : 
                            "Bekleniyor"
                        }
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className={`rounded-full p-1.5 ${application.status === "FINAL_APPROVED" ? "bg-green-100 text-green-600" : application.status === "FINAL_REJECTED" ? "bg-red-100 text-red-600" : "bg-muted text-muted-foreground"}`}>
                      {application.status === "FINAL_REJECTED" ? (
                        <RiCloseLine className="h-3 w-3" />
                      ) : (
                        <RiCheckLine className="h-3 w-3" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-medium">Final Değerlendirme</div>
                      <div className="text-xs text-muted-foreground">
                        {application.status === "FINAL_APPROVED" || application.status === "FINAL_REJECTED" ? 
                          "Tamamlandı" : 
                          "Bekleniyor"
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {(application.status === "DOCUMENT_REQUIRED" || application.status === "DOCUMENTS_SUBMITTED" || application.status === "DOCUMENTS_REJECTED") && (
                <Link href={`/user/applications/${id}/documents`} className="w-full">
                  <Button className="w-full">
                    Belge Yükle
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
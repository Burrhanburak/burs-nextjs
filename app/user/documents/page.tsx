"use client"

import { Button } from "@/components/ui/button"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { useEffect, useState, useCallback } from "react"
import { 
  RiUploadCloudLine, 
  RiCheckLine, 
  RiCloseLine, 
  RiTimeLine, 
  RiDownloadLine 
} from "@remixicon/react"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

// Simple loading spinner component
function LoadingSpinner({size = "lg"}: {size?: "sm" | "md" | "lg"}) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-2",
    lg: "h-8 w-8 border-3",
  }
  
  return (
    <div
      className={`animate-spin rounded-full border-t-transparent border-primary ${sizeClasses[size]}`}
    />
  )
}

interface Document {
  id: string
  type: string
  url: string
  status: string
  createdAt: string
  scholarshipApplication: {
    application: {
      title: string
    }
  } | null
}

export default function DocumentsPage() {
  const { status } = useSession()
  const router = useRouter()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)

  // If not authenticated, redirect to login
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/login")
    }
  }, [status, router])

  // Create fetchDocuments as a useCallback so we can reference it in useEffect
  const fetchDocuments = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch real documents from API
      const response = await fetch('/api/documents')
      
      if (!response.ok) {
        throw new Error('Failed to fetch documents')
      }
      
      const data = await response.json()
      console.log("Fetched documents:", data) // Debug log to see actual data
      setDocuments(data)
    } catch (error) {
      console.error('Error fetching documents:', error)
      toast.error("Belgeler yüklenirken bir hata oluştu")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDocuments()
    
    // In Next.js App Router, we don't have direct router events, 
    // so we use a timer-based approach or route effect
    const interval = setInterval(() => {
      fetchDocuments()
    }, 300000) // Refresh every 5 minutes
    
    return () => {
      clearInterval(interval)
    }
  }, [router, fetchDocuments])
  
  // Fallback document name mapping
  const getDocumentDisplayName = (type: string) => {
    const nameMap: {[key: string]: string} = {
      'transcript': 'Transkript',
      'id_card': 'Kimlik Kartı',
      'income_statement': 'Gelir Belgesi',
      'student_certificate': 'Öğrenci Belgesi',
      'residence_document': 'İkametgah Belgesi'
    }
    
    return nameMap[type] || type
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <RiTimeLine className="mr-1 h-3 w-3" />
            Beklemede
          </Badge>
        )
      case "APPROVED":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <RiCheckLine className="mr-1 h-3 w-3" />
            Onaylandı
          </Badge>
        )
      case "REJECTED":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <RiCloseLine className="mr-1 h-3 w-3" />
            Reddedildi
          </Badge>
        )
      case "NOT_SUBMITTED":
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            Yüklenmedi
          </Badge>
        )
      default:
        return (
          <Badge variant="outline">{status}</Badge>
        )
    }
  }

  // Create a list of standard document types
  const standardDocumentTypes = [
    { id: 'student-certificate', name: 'Öğrenci Belgesi', description: 'Üniversiteden veya E-Devlet\'ten alınmış güncel öğrenci belgesi' },
    { id: 'transcript', name: 'Transkript', description: 'Akademik not dökümü belgesi' },
    { id: 'id-card', name: 'Kimlik Kartı', description: 'Kimlik kartı veya pasaport' },
    { id: 'income-statement', name: 'Gelir Belgesi', description: 'Aile gelir durumunu gösteren belge' },
    { id: 'residence-document', name: 'İkametgah Belgesi', description: 'İkametgah ilmühaberi' }
  ];
  
  // Group documents by type
  const groupDocumentsByType = (docs: Document[]) => {
    const grouped: { [key: string]: Document | null } = {};
    
    // Initialize with all standard types as null (no document uploaded yet)
    standardDocumentTypes.forEach(type => {
      grouped[type.id] = null;
    });
    
    // Add uploaded documents
    docs.forEach(doc => {
      if (doc.type in grouped) {
        grouped[doc.type] = doc;
      }
    });
    
    return grouped;
  };
  
  // Grouped documents
  const groupedDocuments = groupDocumentsByType(documents);

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Evraklarım</h1>
        <p className="text-muted-foreground">
          Burs başvurunuz için gerekli evrakları buradan yükleyebilirsiniz.
        </p>
      </div>
      
      <Separator />
      
      {/* Document Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {standardDocumentTypes.map((documentType) => {
          const uploadedDoc = groupedDocuments[documentType.id];
          const isUploaded = !!uploadedDoc;
          const status = uploadedDoc?.status || "NOT_SUBMITTED";
          
          return (
            <Card key={documentType.id} className={
              status === "APPROVED" ? "border-green-200 bg-green-50/30 dark:bg-green-950/10" :
              status === "REJECTED" ? "border-red-200 bg-red-50/30 dark:bg-red-950/10" :
              isUploaded ? "border-yellow-200 bg-yellow-50/30 dark:bg-yellow-950/10" :
              ""
            }>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>{documentType.name}</CardTitle>
                  {getStatusBadge(status)}
                </div>
                <CardDescription>
                  {documentType.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {isUploaded && (
                    <div className="text-sm">
                      <p className="text-muted-foreground">
                        Yüklenme Tarihi: {new Date(uploadedDoc.createdAt).toLocaleDateString("tr-TR")}
                      </p>
                      {uploadedDoc.scholarshipApplication?.application.title && (
                        <p className="text-muted-foreground">
                          Burs Programı: {uploadedDoc.scholarshipApplication.application.title}
                        </p>
                      )}
                    </div>
                  )}
                  
                  <div className="flex gap-2 justify-end">
                    {isUploaded && uploadedDoc.url && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        asChild
                      >
                        <a href={uploadedDoc.url} target="_blank" rel="noopener noreferrer">
                          <RiDownloadLine className="mr-1 h-4 w-4" />
                          Görüntüle
                        </a>
                      </Button>
                    )}
                    
                    {(status === "REJECTED" || status === "NOT_SUBMITTED") && (
                      <Link href={`/user/documents/${documentType.id}`}>
                        <Button 
                          variant="default" 
                          size="sm"
                        >
                          <RiUploadCloudLine className="mr-1 h-4 w-4" />
                          {status === "REJECTED" ? "Güncelle" : "Yükle"}
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* All Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tüm Belgeler</CardTitle>
          <CardDescription>
            Yüklediğiniz tüm belgelerin durumlarını buradan görüntüleyebilirsiniz.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>Toplam {documents.length} belge</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Belge Adı</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Yüklenme Tarihi</TableHead>
                <TableHead>Burs Programı</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((document) => (
                <TableRow key={document.id}>
                  <TableCell className="font-medium">{getDocumentDisplayName(document.type)}</TableCell>
                  <TableCell>{getStatusBadge(document.status)}</TableCell>
                  <TableCell>
                    {document.createdAt 
                      ? new Date(document.createdAt).toLocaleDateString("tr-TR") 
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {document.scholarshipApplication?.application.title || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {document.url && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          asChild
                        >
                          <a href={document.url} target="_blank" rel="noopener noreferrer">
                            <RiDownloadLine className="mr-1 h-4 w-4" />
                            Görüntüle
                          </a>
                        </Button>
                      )}
                      
                      {(document.status === "REJECTED" || document.status === "NOT_SUBMITTED") && (
                        <Link href={`/user/documents/${document.type.replace(/_/g, '-')}`}>
                          <Button 
                            variant="default" 
                            size="sm"
                          >
                            <RiUploadCloudLine className="mr-1 h-4 w-4" />
                            {document.status === "REJECTED" ? "Güncelle" : "Yükle"}
                          </Button>
                        </Link>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <div className="text-sm text-muted-foreground">
        <p>Not: Tüm belgeleriniz yönetici tarafından onaylandıktan sonra başvurunuz değerlendirilmeye alınacaktır.</p>
      </div>
    </div>
  )
} 
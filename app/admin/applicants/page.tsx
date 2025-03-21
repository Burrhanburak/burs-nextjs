"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  FileText,
  Search,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  CalendarIcon,
  FileCheck,
  AlertTriangle,
  Eye,
  Clock,
  PersonStanding,
  BadgeCheck,
  FileX,
  ClipboardList,
} from "lucide-react"
import { getApplications } from "@/lib/server-actions"
import { ApplicationStatus } from "@prisma/client"
import { toast } from "sonner"
import { format } from "date-fns"
import { tr } from "date-fns/locale"

// Başvuru tipi
interface Application {
  id: string;
  applicantName: string;
  tcKimlikNo?: string;
  university?: string;
  applicationDate: string;
  status: string;
  documentsStatus: string;
  email: string;
  phone?: string;
  interviewDate?: string;
  approvalDate?: string;
  rejectionReason?: string | null;
  documents?: {
    id: string;
    type: string;
    name: string;
    status: string;
    url?: string;
  }[];
}

// Document tipi
interface Document {
  id: string;
  type: string;
  name: string;
  status: string;
  url?: string;
}

// Status badge component
function StatusBadge({ status }: { status: string }) {
  // Statüyü küçük harfle normalize et
  const normalizedStatus = status.toLowerCase();
  
  switch (normalizedStatus) {
    case "pending":
      return (
        <Badge variant="outline" className="text-amber-500 border-amber-500 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Ön Değerlendirme
        </Badge>
      )
    case "pre_approved":
      return (
        <Badge variant="outline" className="text-green-500 border-green-500 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Ön Onay
        </Badge>
      )
    case "document_review":
    case "documents_submitted":
    case "documents_required":
      return (
        <Badge variant="outline" className="text-blue-500 border-blue-500 flex items-center gap-1">
          <FileText className="h-3 w-3" />
          Belge İncelemesi
        </Badge>
      )
    case "documents_approved":
      return (
        <Badge className="bg-purple-500 hover:bg-purple-600 flex items-center gap-1">
          <PersonStanding className="h-3 w-3" />
          Mülakat Aşaması
        </Badge>
      )
    case "interview_scheduled":
    case "interview_completed":
      return (
        <Badge className="bg-purple-500 hover:bg-purple-600 flex items-center gap-1">
          <PersonStanding className="h-3 w-3" />
          Mülakat Aşaması
        </Badge>
      )
    case "final_approved":
      return (
        <Badge className="bg-green-500 hover:bg-green-600 flex items-center gap-1">
          <BadgeCheck className="h-3 w-3" />
          Onaylandı
        </Badge>
      )
    case "final_rejected":
    case "pre_rejected":
    case "documents_rejected":
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <FileX className="h-3 w-3" />
          Reddedildi
        </Badge>
      )
    default:
      return (
        <Badge variant="outline">
          {normalizedStatus.replace('_', ' ')}
        </Badge>
      )
  }
}

// Belge durumunu Türkçe olarak göster
function DocumentStatusBadge({ status }: { status: string }) {
  // Statüyü küçük harfle normalize et
  const normalizedStatus = status.toLowerCase();
  
  switch (normalizedStatus) {
    case "approved":
    case "documents_approved":
    case "complete":
      return (
        <Badge variant="outline" className="text-green-500 border-green-500">
          <FileCheck className="mr-1 h-3 w-3" />
          Onaylandı
        </Badge>
      )
    case "pending":
      return (
        <Badge variant="outline" className="text-amber-500 border-amber-500">
          <Clock className="mr-1 h-3 w-3" />
          İncelemede
        </Badge>
      )
    case "rejected":
      return (
        <Badge variant="outline" className="text-red-500 border-red-500">
          <XCircle className="mr-1 h-3 w-3" />
          Reddedildi
        </Badge>
      )
    case "missing":
    case "incomplete":
      return (
        <Badge variant="outline" className="text-gray-500 border-gray-500">
          <AlertTriangle className="mr-1 h-3 w-3" />
          Eksik
        </Badge>
      )
    default:
      return (
        <Badge variant="outline">
          {normalizedStatus.replace('_', ' ')}
        </Badge>
      )
  }
}

// Belge tipine göre Türkçe isim döndür
function getDocumentName(type: string): string {
  switch (type.toLowerCase()) {
    case "transcript":
      return "Transkript";
    case "studentcertificate":
      return "Öğrenci Belgesi";
    case "familystatement":
      return "Aile Gelir Beyanı";
    case "cv":
      return "Özgeçmiş";
    case "residencecertificate":
      return "İkametgah Belgesi";
    case "writingassignment":
      return "Yazı Ödevi";
    default:
      return type;
  }
}

export default function ApplicantsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilter, setSelectedFilter] = useState<string>("all")
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isDocumentsOpen, setIsDocumentsOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [isDocumentViewOpen, setIsDocumentViewOpen] = useState(false)

  useEffect(() => {
    async function fetchApplications() {
      setLoading(true)
      try {
        // selectedFilter değerine göre ApplicationStatus enum değerini belirle
        let status: ApplicationStatus | undefined = undefined
        
        if (selectedFilter !== "all") {
          // String'i ApplicationStatus enum değerine dönüştür
          status = selectedFilter.toUpperCase() as ApplicationStatus
        }
        
        console.log("Fetching applications with status filter:", status);
        const apps = await getApplications(status)
        console.log("Fetched applications:", apps.length);
        console.log("Sample statuses:", apps.slice(0, 3).map(app => app.status));
        setApplications(apps as Application[])
      } catch (error) {
        console.error("Başvurular yüklenirken hata oluştu:", error)
        toast.error("Başvurular yüklenirken bir hata oluştu")
      } finally {
        setLoading(false)
      }
    }
    
    fetchApplications()
  }, [selectedFilter])

  const statusFilterOptions = [
    { label: "Tümü", value: "all" },
    { label: "Ön Değerlendirme", value: "pending" },
    { label: "Ön Onay", value: "pre_approved" },
    { label: "Belge İncelemesi", value: "document_review" },
    { label: "Mülakat Aşaması", value: "interview" },
    { label: "Onaylandı", value: "final_approved" },
    { label: "Reddedildi", value: "rejected" },
  ];

  // Filter applications based on search term and status filter
  const filteredApplications = applications
  .filter(app => {
    const searchContent = `${app.applicantName} ${app.tcKimlikNo || ""} ${app.university || ""} ${app.email || ""} ${app.phone || ""}`.toLowerCase();
    return searchContent.includes(searchTerm.toLowerCase());
  })
  .filter(app => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "interview" && (app.status === "interview_scheduled" || app.status === "interview_completed" || app.status === "documents_approved")) return true;
    if (selectedFilter === "document_review" && (app.status === "document_review" || app.status === "documents_submitted" || app.status === "documents_required")) return true;
    if (selectedFilter === "rejected" && (app.status === "final_rejected" || app.status === "pre_rejected" || app.status === "documents_rejected")) return true;
    return app.status === selectedFilter;
  });

  // Count applications by status
  const pendingCount = applications.filter(app => 
    ["pending", "pre_approved"].includes(app.status.toLowerCase())).length
    
  const documentReviewCount = applications.filter(app => 
    ["document_review", "documents_submitted", "documents_required"].includes(app.status.toLowerCase())).length
    
  const interviewCount = applications.filter(app => 
    ["interview_scheduled", "interview_completed"].includes(app.status.toLowerCase())).length
    
  const approvedCount = applications.filter(app => 
    ["final_approved"].includes(app.status.toLowerCase())).length
    
  const rejectedCount = applications.filter(app => 
    ["final_rejected", "pre_rejected", "documents_rejected"].includes(app.status.toLowerCase())).length

  // Başvuru detaylarını görüntüle
  const handleViewDetails = (application: Application) => {
    setSelectedApplication(application)
    setIsDetailsOpen(true)
  }
  
  // Belgeleri görüntüle
  const handleViewDocuments = (application: Application) => {
    setSelectedApplication(application)
    setIsDocumentsOpen(true)
  }
  
  // Belge görüntüle
  const handleViewDocument = (document: Document) => {
    setSelectedDocument(document)
    setIsDocumentViewOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Başvurular</h1>
          <p className="text-muted-foreground">Burs başvurularını görüntüleyin ve yönetin.</p>
        </div>
        <Button variant="default">
          <FileText className="mr-2 h-4 w-4" />
          Rapor İndir
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="relative w-full sm:w-auto sm:flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="İsim, TC Kimlik No veya başvuru ID'si ile ara..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={selectedFilter} onValueChange={setSelectedFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filtrele" />
          </SelectTrigger>
          <SelectContent>
            {statusFilterOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="tümü">
        <TabsList>
          <TabsTrigger value="tümü">Tümü ({applications.length})</TabsTrigger>
          <TabsTrigger value="onay-bekleyen">Onay Bekleyen ({pendingCount + documentReviewCount})</TabsTrigger>
          <TabsTrigger value="mülakat">Mülakat ({interviewCount})</TabsTrigger>
          <TabsTrigger value="onaylı">Onaylı ({approvedCount})</TabsTrigger>
          <TabsTrigger value="reddedilen">Reddedilen ({rejectedCount})</TabsTrigger>
        </TabsList>
        <TabsContent value="tümü">
          <ApplicantsTable 
            applications={filteredApplications} 
            loading={loading} 
            onViewDetails={handleViewDetails}
            onViewDocuments={handleViewDocuments}
          />
        </TabsContent>
        <TabsContent value="onay-bekleyen">
          <ApplicantsTable 
            applications={filteredApplications.filter(app => 
              ["pending", "pre_approved", "document_review", "documents_submitted", "documents_required"].includes(app.status.toLowerCase())
            )} 
            loading={loading}
            onViewDetails={handleViewDetails}
            onViewDocuments={handleViewDocuments}
          />
        </TabsContent>
        <TabsContent value="mülakat">
          <ApplicantsTable 
            applications={filteredApplications.filter(app => 
              ["interview_scheduled", "interview_completed"].includes(app.status.toLowerCase())
            )} 
            loading={loading}
            onViewDetails={handleViewDetails}
            onViewDocuments={handleViewDocuments}
          />
        </TabsContent>
        <TabsContent value="onaylı">
          <ApplicantsTable 
            applications={filteredApplications.filter(app => 
              ["final_approved"].includes(app.status.toLowerCase())
            )} 
            loading={loading}
            onViewDetails={handleViewDetails}
            onViewDocuments={handleViewDocuments}
          />
        </TabsContent>
        <TabsContent value="reddedilen">
          <ApplicantsTable 
            applications={filteredApplications.filter(app => 
              ["final_rejected", "pre_rejected", "documents_rejected"].includes(app.status.toLowerCase())
            )} 
            loading={loading}
            onViewDetails={handleViewDetails}
            onViewDocuments={handleViewDocuments}
          />
        </TabsContent>
      </Tabs>
      
      {/* Belge Görüntüleme Dialog */}
      {selectedDocument && (
        <Dialog open={isDocumentViewOpen} onOpenChange={setIsDocumentViewOpen}>
          <DialogContent className="sm:max-w-[80vw] h-[80vh]">
            <DialogHeader>
              <DialogTitle>{selectedDocument.name || getDocumentName(selectedDocument.type)}</DialogTitle>
              <DialogDescription>
                Belge önizleme
              </DialogDescription>
            </DialogHeader>
            
            <div className="w-full h-full min-h-[60vh] overflow-auto border rounded">
              {selectedDocument.url && (
                <iframe 
                  src={selectedDocument.url}
                  className="w-full h-full"
                  title={selectedDocument.name || getDocumentName(selectedDocument.type)}
                />
              )}
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDocumentViewOpen(false)}
              >
                Kapat
              </Button>
              {selectedDocument.url && (
                <Button asChild>
                  <a href={selectedDocument.url} target="_blank" rel="noopener noreferrer">
                    Yeni Sekmede Aç
                  </a>
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Başvuru Detayları Diyaloğu */}
      <ApplicationDetailsDialog 
        application={selectedApplication}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
      
      {/* Belgeler Diyaloğu */}
      {selectedApplication && (
        <Dialog open={isDocumentsOpen} onOpenChange={setIsDocumentsOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Başvuru Belgeleri</DialogTitle>
              <DialogDescription>
                {selectedApplication.applicantName} adlı başvuranın yüklediği belgeler
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              {selectedApplication.documents && selectedApplication.documents.length > 0 ? (
                <div className="space-y-4">
                  {selectedApplication.documents.map(document => (
                    <div key={document.id} className="flex items-center justify-between p-3 border rounded-md">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 mr-3 text-blue-500" />
                        <div>
                          <p className="font-medium">{document.name || getDocumentName(document.type)}</p>
                          <p className="text-sm text-muted-foreground">{document.id.substring(0, 8)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <DocumentStatusBadge status={document.status} />
                        {document.url && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewDocument(document)}
                          >
                            Görüntüle
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="col-span-1 md:col-span-2 flex flex-col items-center justify-center py-4 border border-dashed rounded-lg">
                  <div className="rounded-full bg-muted p-2">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground text-center">Henüz belge yüklenmemiş</p>
                  <Button 
                    variant="outline"
                    size="sm"
                    className="mt-3" 
                    onClick={() => {
                      toast.info("Belgeler için yeniden yükleme talebi gönderildi");
                      // Burada belgeleri yeniden yükleme API çağrısı yapılabilir
                      // fetch(`/api/admin/applications/${selectedApplication.id}/request-documents`)
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    Tekrar Yükle
                  </Button>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button onClick={() => setIsDocumentsOpen(false)}>
                Kapat
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

function ApplicantsTable({ 
  applications, 
  loading,
  onViewDetails,
  onViewDocuments
}: { 
  applications: Application[], 
  loading: boolean, 
  onViewDetails: (app: Application) => void,
  onViewDocuments: (app: Application) => void
}) {
  // Mülakat planla
  const handleScheduleInterview = async (applicationId: string) => {
    try {
      const interviewDate = new Date();
      interviewDate.setDate(interviewDate.getDate() + 3); // 3 gün sonra
      interviewDate.setHours(14, 0, 0, 0); // Saat 14:00
      
      const response = await fetch(`/api/admin/applications/${applicationId}/schedule-interview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          interviewDate: interviewDate.toISOString() 
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Mülakat planlanırken bir hata oluştu");
      }
      
      toast.success("Mülakat başarıyla planlandı");
      // Sayfayı yenile
      window.location.reload();
    } catch (error) {
      console.error("Mülakat planlama hatası:", error);
      toast.error(`Mülakat planlanırken bir hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
  };
  
  // Başvuruyu reddet
  const handleRejectApplication = async (applicationId: string) => {
    if (!confirm("Bu başvuruyu reddetmek istediğinize emin misiniz?")) return;
    
    try {
      const response = await fetch(`/api/admin/applications/${applicationId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          reason: "Başvurunuz değerlendirme sonucunda reddedilmiştir."
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Başvuru reddedilirken bir hata oluştu");
      }
      
      toast.success("Başvuru başarıyla reddedildi");
      // Sayfayı yenile
      window.location.reload();
    } catch (error) {
      console.error("Başvuru reddetme hatası:", error);
      toast.error(`Başvuru reddedilirken bir hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-6">
          <div className="flex flex-col items-center space-y-2">
            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-indigo-600"></div>
            <p className="text-sm text-muted-foreground">Yükleniyor...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (applications.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <div className="rounded-full bg-muted p-3">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-medium">Başvuru Bulunamadı</h3>
          <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
            Bu kriterlere uygun başvuru bulunmamaktadır. Farklı bir filtre deneyin.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Başvuru ID</TableHead>
              <TableHead>Başvuran</TableHead>
              <TableHead className="hidden md:table-cell">Üniversite</TableHead>
              <TableHead className="hidden md:table-cell">Başvuru Tarihi</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead className="hidden md:table-cell">Belgeler</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((application) => (
              <TableRow key={application.id}>
                <TableCell className="font-medium">{application.id.substring(0, 8)}</TableCell>
                <TableCell>
                  <div>
                    <div>{application.applicantName}</div>
                    <div className="text-sm text-muted-foreground md:hidden">
                      {application.university}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">{application.university}</TableCell>
                <TableCell className="hidden md:table-cell">{new Date(application.applicationDate).toLocaleDateString('tr-TR')}</TableCell>
                <TableCell>
                  <StatusBadge status={application.status} />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <DocumentStatusBadge status={application.documentsStatus} />
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Menüyü aç</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onViewDetails(application)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Detayları Görüntüle
                      </DropdownMenuItem>
                      
                      {application.documents && application.documents.length > 0 && (
                        <DropdownMenuItem onClick={() => onViewDocuments(application)}>
                          <ClipboardList className="mr-2 h-4 w-4" />
                          Belgeleri İncele
                        </DropdownMenuItem>
                      )}
                      
                      {/* Belge durumu onaylandıysa veya ön onaylıysa ve henüz mülakat planlanmamışsa */}
                      {["documents_approved", "pre_approved", "document_review", "documents_required", "documents_submitted"].includes(application.status.toLowerCase()) && 
                       !["interview_scheduled", "interview_completed", "final_approved", "final_rejected"].includes(application.status.toLowerCase()) && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleScheduleInterview(application.id)}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            Mülakata Davet Et
                          </DropdownMenuItem>
                        </>
                      )}
                      
                      {/* Henüz onaylanmamış ve reddedilmemiş ise */}
                      {!["final_approved", "final_rejected"].includes(application.status.toLowerCase()) && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600" onClick={() => handleRejectApplication(application.id)}>
                            <XCircle className="mr-2 h-4 w-4" />
                            Reddet
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

// Başvuru detayları diyaloğu
function ApplicationDetailsDialog({
  application,
  open,
  onOpenChange,
}: {
  application: Application | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isDocumentsDialogOpen, setIsDocumentsDialogOpen] = useState(false)
  
  if (!application) return null;

  // Belgeleri görüntüle
  const handleViewDocuments = () => {
    setIsDocumentsDialogOpen(true)
  }
  
  // Mülakat planla
  const handleScheduleInterview = async () => {
    try {
      const interviewDate = new Date();
      interviewDate.setDate(interviewDate.getDate() + 3); // 3 gün sonra
      interviewDate.setHours(14, 0, 0, 0); // Saat 14:00
      
      const response = await fetch(`/api/admin/applications/${application.id}/schedule-interview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          interviewDate: interviewDate.toISOString() 
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Mülakat planlanırken bir hata oluştu");
      }
      
      toast.success("Mülakat başarıyla planlandı");
      // Sayfayı yenile
      window.location.reload();
    } catch (error) {
      console.error("Mülakat planlama hatası:", error);
      toast.error(`Mülakat planlanırken bir hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
  };
  
  // Başvuruyu reddet
  const handleRejectApplication = async () => {
    if (!confirm("Bu başvuruyu reddetmek istediğinize emin misiniz?")) return;
    
    try {
      const response = await fetch(`/api/admin/applications/${application.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          reason: "Başvurunuz değerlendirme sonucunda reddedilmiştir."
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Başvuru reddedilirken bir hata oluştu");
      }
      
      toast.success("Başvuru başarıyla reddedildi");
      // Sayfayı yenile
      window.location.reload();
    } catch (error) {
      console.error("Başvuru reddetme hatası:", error);
      toast.error(`Başvuru reddedilirken bir hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Başvuru Detayları</DialogTitle>
          <DialogDescription>
            {application.id} numaralı başvurunun detayları
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium">Başvuru Sahibi</h3>
              <p>{application.applicantName}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium">TC Kimlik No</h3>
              <p>{application.tcKimlikNo || "N/A"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Üniversite</h3>
              <p>{application.university || "N/A"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium">E-posta</h3>
              <p>{application.email}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Telefon</h3>
              <p>{application.phone || "N/A"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Başvuru Tarihi</h3>
              <p>{format(new Date(application.applicationDate), "PPP", { locale: tr })}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Durum</h3>
              <StatusBadge status={application.status} />
            </div>
            <div>
              <h3 className="text-sm font-medium">Belgeler</h3>
              <DocumentStatusBadge status={application.documentsStatus} />
            </div>
            {application.interviewDate && (
              <div>
                <h3 className="text-sm font-medium">Mülakat Tarihi</h3>
                <p>{format(new Date(application.interviewDate), "PPP", { locale: tr })}, {format(new Date(application.interviewDate), "HH:mm")}</p>
              </div>
            )}
            {application.approvalDate && (
              <div>
                <h3 className="text-sm font-medium">Onay Tarihi</h3>
                <p>{format(new Date(application.approvalDate), "PPP", { locale: tr })}</p>
              </div>
            )}
            {application.rejectionReason && (
              <div>
                <h3 className="text-sm font-medium">Ret Nedeni</h3>
                <p>{application.rejectionReason}</p>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Belgeler</h3>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-2 w-full">
              {application.documents && application.documents.length > 0 ? (
                application.documents.map((doc) => (
                  <div key={doc.id} className="flex justify-between items-center p-2 border rounded-md">
                    <span>{doc.name || getDocumentName(doc.type)}</span>
                    <div className="flex items-center gap-2">
                      <DocumentStatusBadge status={doc.status} />
                      {doc.url && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            // Close this dialog and open documents dialog 
                            // This relies on the parent component's state handlers
                            onOpenChange(false)
                            const event = new CustomEvent('viewDocument', { 
                              detail: { document: doc } 
                            });
                            window.dispatchEvent(event);
                          }}
                        >
                          Görüntüle
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 border border-dashed rounded-lg">
                  <div className="rounded-full bg-muted p-3">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium">Henüz Belge Yok</h3>
                  <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
                    Bu başvuru için kayıtlı belge bulunamadı.
                  </p>
                  <Button 
                    variant="outline"
                    className="mt-4" 
                    onClick={() => {
                      toast.info("Belgeler için yeniden yükleme talebi gönderildi");
                      // Burada belgeleri yeniden yükleme API çağrısı yapılabilir
                      // fetch(`/api/admin/applications/${application.id}/request-documents`)
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    Tekrar Yükle
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Belgeler Dialog */}
        {application && (
          <Dialog open={isDocumentsDialogOpen} onOpenChange={setIsDocumentsDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Başvuru Belgeleri</DialogTitle>
                <DialogDescription>
                  {application.applicantName} adlı başvuranın yüklediği belgeler
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                {application.documents && application.documents.length > 0 ? (
                  <div className="space-y-4">
                    {application.documents.map(document => (
                      <div key={document.id} className="flex items-center justify-between p-3 border rounded-md">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 mr-3 text-blue-500" />
                          <div>
                            <p className="font-medium">{document.name || getDocumentName(document.type)}</p>
                            <p className="text-sm text-muted-foreground">{document.id.substring(0, 8)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <DocumentStatusBadge status={document.status} />
                          {document.url && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                // Close this dialog and open document viewer 
                                // This relies on the parent component's state handlers
                                setIsDocumentsDialogOpen(false)
                                onOpenChange(false)
                                const event = new CustomEvent('viewDocument', { 
                                  detail: { document } 
                                });
                                window.dispatchEvent(event);
                              }}
                            >
                              Görüntüle
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 border border-dashed rounded-lg">
                    <div className="rounded-full bg-muted p-3">
                      <FileText className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="mt-4 text-lg font-medium">Henüz Belge Yok</h3>
                    <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
                      Bu başvuru için kayıtlı belge bulunamadı.
                    </p>
                    <Button 
                      variant="outline"
                      className="mt-4" 
                      onClick={() => {
                        toast.info("Belgeler için yeniden yükleme talebi gönderildi");
                        // Burada belgeleri yeniden yükleme API çağrısı yapılabilir
                        // fetch(`/api/admin/applications/${application.id}/request-documents`)
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                      </svg>
                      Tekrar Yükle
                    </Button>
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button onClick={() => setIsDocumentsDialogOpen(false)}>
                  Kapat
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          {application.documents && application.documents.length > 0 && (
            <Button variant="outline" onClick={handleViewDocuments}>
              <ClipboardList className="mr-2 h-4 w-4" />
              Belgeleri İncele
            </Button>
          )}
          
          {/* Belge durumu onaylandıysa veya ön onaylıysa ve henüz mülakat planlanmamışsa */}
          {["documents_approved", "pre_approved", "document_review", "documents_required", "documents_submitted"].includes(application.status.toLowerCase()) && 
           !["interview_scheduled", "interview_completed", "final_approved", "final_rejected"].includes(application.status.toLowerCase()) && (
            <Button onClick={handleScheduleInterview}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              Mülakata Davet Et
            </Button>
          )}
          
          {/* Henüz onaylanmamış ve reddedilmemiş ise */}
          {!["final_approved", "final_rejected"].includes(application.status.toLowerCase()) && (
            <Button variant="destructive" onClick={handleRejectApplication}>
              <XCircle className="mr-2 h-4 w-4" />
              Başvuruyu Reddet
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 
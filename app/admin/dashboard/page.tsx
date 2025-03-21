"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { cn } from "@/lib/utils"
import {
  FileText,
  Search,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  CalendarIcon,
  Users,
  FileCheck,
  AlertTriangle,
  Eye,
  Clock,
  PersonStanding,
  BadgeCheck,
  FileX,
} from "lucide-react"
import { getApplications } from "@/lib/server-actions"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

// Application interface to replace all 'any' types
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
    name: string;
    status: string;
  }[];
  userId?: string;
}

// Status badge component
function StatusBadge({ status }: { status: string }) {
  // Statüyü küçük harfle normalize et
  const normalizedStatus = status.toLowerCase();
  
  // Durum statüsüne göre badge göster
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
    case "documents_required":
    case "documents_submitted":
      return (
        <Badge variant="outline" className="text-blue-500 border-blue-500 flex items-center gap-1">
          <FileText className="h-3 w-3" />
          Belge İncelemesi
        </Badge>
      )
    case "documents_approved":
      return (
        <Badge className="bg-green-500 hover:bg-green-600 flex items-center gap-1">
        <BadgeCheck className="h-3 w-3" />
        Onaylandı
      </Badge>
      )
    case "interview":
    case "interview_scheduled":
      return (
        <Badge className="bg-purple-500 hover:bg-purple-600 flex items-center gap-1">
          <PersonStanding className="h-3 w-3" />
          Mülakat Aşaması
        </Badge>
      )
    case "interview_completed":
      return (
        <Badge className="bg-indigo-500 hover:bg-indigo-600 flex items-center gap-1">
          <PersonStanding className="h-3 w-3" />
          Mülakat Tamamlandı
        </Badge>
      )
    case "approved":
    case "final_approved":
      return (
        <Badge className="bg-green-500 hover:bg-green-600 flex items-center gap-1">
          <BadgeCheck className="h-3 w-3" />
          Onaylandı
        </Badge>
      )
    case "rejected":
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
      // Default olarak statü metnini göster
      return (
        <Badge variant="outline">
          {normalizedStatus.replace('_', ' ')}
        </Badge>
      )
  }
}

// Document status badge component
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
        <Badge variant="outline" className="text-red-500 border-red-500">
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

export default function AdminDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [isInterviewDialogOpen, setIsInterviewDialogOpen] = useState(false)
  const [selectedInterviewDate, setSelectedInterviewDate] = useState<Date>()
  const [selectedInterviewTime, setSelectedInterviewTime] = useState<string>("10:00")
  const [selectedRejectReason, setSelectedRejectReason] = useState<string>("")
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isDocumentsDialogOpen, setIsDocumentsDialogOpen] = useState(false)
  const [bursiyerDocuments, setBursiyerDocuments] = useState<Array<{id: string; type: string; status: string; url?: string; name?: string}>>([])
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<{url: string, type: string, name?: string} | null>(null)
  const [isDocumentViewOpen, setIsDocumentViewOpen] = useState(false)

  // Check authentication and admin role
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
      return
    }
    
    if (session && session.user.role !== "ADMIN") {
      router.push("/user/dashboard")
      return
    }
  }, [session, status, router])

  // Fetch data from the database
  useEffect(() => {
    async function fetchApplications() {
      setLoading(true)
      try {
        // Get real data from the server action
        const data = await getApplications()
        
        if (!data || data.length === 0) {
          console.log("No applications found or empty data received")
        } else {
          console.log(`${data.length} applications loaded successfully`)
        }
        
        setApplications(data as Application[])
      } catch (error) {
        console.error("Başvuruları getirme hatası:", error)
        toast.error("Başvurular yüklenirken bir hata oluştu")
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [])

  // Count applications by status
  const pendingCount = applications.filter((app) => 
    ["pending", "pre_approved"].includes(app.status.toLowerCase())).length;
    
  const documentReviewCount = applications.filter((app) => 
    ["document_review", "documents_required", "documents_submitted"].includes(app.status.toLowerCase())).length;
    
  const interviewCount = applications.filter((app) => 
    ["interview", "interview_scheduled", "interview_completed"].includes(app.status.toLowerCase())).length;
    
  const approvedCount = applications.filter((app) => 
    ["approved", "final_approved"].includes(app.status.toLowerCase())).length;
  
  // Filter applications based on search term and status filter
  const filteredApplications = applications.filter(
    (app) => {
      const matchesSearch = 
        app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (app.tcKimlikNo && app.tcKimlikNo.includes(searchTerm)) ||
        app.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Check if the application status matches the selected filter
      const matchesFilter = filterStatus === "all" || 
        (filterStatus === "pending" && ["pending", "pre_approved"].includes(app.status.toLowerCase())) ||
        (filterStatus === "document_review" && ["document_review", "documents_required", "documents_submitted"].includes(app.status.toLowerCase())) ||
        (filterStatus === "interview" && ["interview", "interview_scheduled", "interview_completed"].includes(app.status.toLowerCase())) ||
        (filterStatus === "approved" && ["approved", "final_approved"].includes(app.status.toLowerCase())) ||
        (filterStatus === "rejected" && ["rejected", "final_rejected", "pre_rejected", "documents_rejected"].includes(app.status.toLowerCase()));
      
      return matchesSearch && matchesFilter;
    }
  )

  // Handle interview scheduling
  const handleScheduleInterview = async () => {
    if (selectedApplication && selectedInterviewDate && selectedInterviewTime) {
      setLoading(true)
      try {
        // Convert date and time to a Date object
        const interviewDateTime = new Date(selectedInterviewDate)
        const [hours, minutes] = selectedInterviewTime.split(':').map(Number)
        interviewDateTime.setHours(hours, minutes)
        
        // Make the actual API call
        const response = await fetch(`/api/admin/applications/${selectedApplication.id}/schedule-interview`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            interviewDate: interviewDateTime.toISOString() 
          }),
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Failed to schedule interview')
        }
        
        // Refresh the applications list
        const fetchedApps = await getApplications()
        setApplications(fetchedApps as Application[])
        
        // Success message
        toast.success(`${selectedApplication.applicantName} için mülakat başarıyla planlandı.`)
      } catch (error) {
        console.error("Mülakat planlama hatası:", error)
        
        // Hata mesajı kontrolü
        let errorMessage = `Mülakat planlanırken bir hata oluştu`
        
        if (error instanceof Error) {
          // Belge kontrolünden gelen özel hatayı kontrol et
          if (error.message.includes("Belgeleri eksik olan başvuru")) {
            errorMessage = error.message
          } else if (error.message.includes("Failed to schedule interview")) {
            errorMessage = "Mülakat planlanamadı. Lütfen daha sonra tekrar deneyin."
          } else {
            errorMessage = `Hata: ${error.message}`
          }
        }
        
        toast.error(errorMessage)
      } finally {
        // Close the dialog and reset
        setIsInterviewDialogOpen(false)
        setSelectedInterviewDate(undefined)
        setSelectedInterviewTime("10:00")
        setLoading(false)
      }
    }
  };

  // Handle application rejection
  const handleRejectApplication = async () => {
    if (selectedApplication && selectedRejectReason) {
      setLoading(true)
      try {
        // Make the actual API call
        const response = await fetch(`/api/admin/applications/${selectedApplication.id}/reject`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            reason: selectedRejectReason 
          }),
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Failed to reject application')
        }
        
        // Refresh the applications list
        const fetchedApps = await getApplications()
        setApplications(fetchedApps as Application[])
        
        // Success message
        toast.success(`${selectedApplication.applicantName} adlı kişinin başvurusu reddedildi.`)
      } catch (error) {
        console.error("Başvuru reddetme hatası:", error)
        toast.error(`Başvuru reddedilirken bir hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`)
      } finally {
        // Close the dialog and reset
        setIsRejectDialogOpen(false)
        setSelectedRejectReason("")
        setLoading(false)
      }
    }
  };

  // Handle viewing application details
  const handleViewDetails = (application: Application) => {
    setSelectedApplication(application)
    setIsDetailsOpen(true)
  }

  // Belgeleri görüntüle
  const handleViewDocuments = async (application: Application) => {
    setSelectedApplication(application)
    setIsDocumentsDialogOpen(true)
    setIsLoadingDocuments(true)
    
    try {
      // Başvuru sahibinin belgelerini getir - userId değil userID kullanılıyor olabilir
      const userId = application.userId || application.id; // kullanıcı ID'si ya da başvuru ID'si
      
      console.log("Belgeleri getirme isteği:", userId);
      
      // İlk olarak kullanıcı ID'si ile deneyelim
      let response = await fetch(`/api/admin/documents/user/${userId}`);
      
      if (!response.ok) {
        console.log("Kullanıcı ID ile belge getirme başarısız, başvuru ID ile deneniyor");
        // Kullanıcı ID çalışmadıysa, başvuru ID'yi deneyelim
        response = await fetch(`/api/admin/documents/application/${application.id}`);
      }
      
      if (response.ok) {
        const data = await response.json();
        console.log("Getirilen belgeler:", data);
        setBursiyerDocuments(data.documents || []);
      } else {
        console.error("Belgeleri getirirken hata oluştu:", response.statusText);
        toast.error("Belgeleri getirirken bir hata oluştu");
        setBursiyerDocuments([]);
      }
    } catch (error) {
      console.error("Belgeleri getirirken hata oluştu:", error);
      toast.error("Belgeleri getirirken bir hata oluştu");
      setBursiyerDocuments([]);
    } finally {
      setIsLoadingDocuments(false);
    }
  }

  // Belgeyi görüntüle
  const handleViewDocument = (document: {url?: string, type: string, name?: string}) => {
    if (document.url) {
      setSelectedDocument({
        url: document.url,
        type: document.type,
        name: document.name
      })
      setIsDocumentViewOpen(true)
    }
  }

  // Helper function to get document name
  const getDocumentName = (type: string, name?: string) => {
    if (name) return name;
    
    const typeMap: Record<string, string> = {
      'transcript': 'Transkript',
      'id_card': 'Kimlik Kartı',
      'income_statement': 'Gelir Belgesi',
      'student_certificate': 'Öğrenci Belgesi',
      'residence_document': 'İkametgah Belgesi'
    }
    return typeMap[type] || type
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Yönetim Paneli</h1>
          <p className="text-muted-foreground">Burs başvurularını inceleyebilir ve yönetebilirsiniz.</p>
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrele" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Başvurular</SelectItem>
            <SelectItem value="pending">Ön Değerlendirme</SelectItem>
            <SelectItem value="document_review">Belge İncelemesi</SelectItem>
            <SelectItem value="interview">Mülakat Aşaması</SelectItem>
            <SelectItem value="approved">Onaylanan</SelectItem>
            <SelectItem value="rejected">Reddedilen</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Başvuru</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applications.length}</div>
            <p className="text-xs text-muted-foreground">Tüm başvurular</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Değerlendirme Aşamasında</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount + documentReviewCount}</div>
            <p className="text-xs text-muted-foreground">Ön değerlendirme ve belge incelemesi</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mülakat Aşamasında</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{interviewCount}</div>
            <p className="text-xs text-muted-foreground">Mülakata davet edilenler</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Onaylanan Başvurular</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedCount}</div>
            <p className="text-xs text-muted-foreground">Başarılı başvurular</p>
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        <Input
          type="search"
          className="pl-10"
          placeholder="İsim, ID veya TC kimlik numarası ile ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Başvurular</CardTitle>
          <CardDescription>
            Toplam {filteredApplications.length} başvuru listeleniyor.
            {filterStatus !== "all" && ` Filtre: ${filterStatus}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="flex flex-col items-center space-y-2">
                <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
                <p className="text-sm text-muted-foreground">Başvurular yükleniyor...</p>
              </div>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg py-10">
              <div className="rounded-full bg-muted p-3">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-medium">Başvuru Bulunamadı</h3>
              <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
                Bu kriterlere uygun başvuru bulunamadı. Farklı bir arama terimi veya filtre deneyin.
              </p>
            </div>
          ) : (
            <ApplicationsTable 
              applications={filteredApplications} 
              onViewDetails={handleViewDetails}
              onScheduleInterview={(app) => {
                setSelectedApplication(app);
                setIsInterviewDialogOpen(true);
              }}
              onRejectApplication={(app) => {
                setSelectedApplication(app);
                setIsRejectDialogOpen(true);
              }}
              onViewDocuments={(app) => {
                setSelectedApplication(app);
                handleViewDocuments(app);
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* Application Details Dialog */}
      <ApplicationDetailsDialog
        application={selectedApplication}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        onScheduleInterview={() => {
          setIsDetailsOpen(false);
          setIsInterviewDialogOpen(true);
        }}
        onRejectApplication={() => {
          setIsDetailsOpen(false);
          setIsRejectDialogOpen(true);
        }}
        onViewDocuments={() => {
          setIsDetailsOpen(false);
          if (selectedApplication) {
            handleViewDocuments(selectedApplication);
          }
        }}
      />

      {/* Interview Scheduling Dialog */}
      <Dialog open={isInterviewDialogOpen} onOpenChange={setIsInterviewDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Mülakat Planla</DialogTitle>
            <DialogDescription>
              {selectedApplication?.applicantName} için mülakat tarihini ve saatini belirleyin.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="date">Mülakat Tarihi</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedInterviewDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedInterviewDate ? (
                      format(selectedInterviewDate, "PPP", { locale: tr })
                    ) : (
                      "Tarih seçin"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedInterviewDate}
                    onSelect={setSelectedInterviewDate}
                    initialFocus
                    locale={tr}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="time">Mülakat Saati</Label>
              <Input
                id="time"
                type="time"
                value={selectedInterviewTime}
                onChange={(e) => setSelectedInterviewTime(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInterviewDialogOpen(false)} disabled={loading}>
              İptal
            </Button>
            <Button 
              type="submit" 
              onClick={handleScheduleInterview} 
              disabled={loading || !selectedInterviewDate}
            >
              {loading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
                  İşleniyor...
                </>
              ) : (
                "Mülakat Planla"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Application Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Başvuruyu Reddet</DialogTitle>
            <DialogDescription>
              {selectedApplication?.applicantName} adlı kişinin başvurusunu reddetme nedeninizi belirtin.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reason">Red Nedeni</Label>
              <Select
                value={selectedRejectReason}
                onValueChange={setSelectedRejectReason}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Neden seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="missing_documents">Eksik Belgeler</SelectItem>
                  <SelectItem value="not_eligible">Uygunluk Kriterleri</SelectItem>
                  <SelectItem value="academic_performance">Akademik Performans</SelectItem>
                  <SelectItem value="financial_status">Mali Durum</SelectItem>
                  <SelectItem value="other">Diğer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)} disabled={loading}>
              İptal
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleRejectApplication} 
              disabled={loading || !selectedRejectReason}
            >
              {loading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
                  İşleniyor...
                </>
              ) : (
                "Başvuruyu Reddet"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Belgeler Dialog */}
      {selectedApplication && (
        <Dialog open={isDocumentsDialogOpen} onOpenChange={setIsDocumentsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Başvuru Belgeleri</DialogTitle>
              <DialogDescription>
                {selectedApplication.applicantName} adlı kişinin yüklediği belgeler
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              {isLoadingDocuments ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-indigo-600"></div>
                    <p className="text-sm text-muted-foreground">Belgeler yükleniyor...</p>
                  </div>
                </div>
              ) : bursiyerDocuments.length === 0 ? (
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
                      // fetch(`/api/admin/applications/${selectedApplication?.id}/request-documents`)
                    }}
                  >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
  <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/>
  <path d="M12 12v9"/>
  <path d="m16 16-4-4-4 4"/>
</svg>
                    Denetle belgeleri
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {bursiyerDocuments.map(document => (
                    <div key={document.id} className="flex items-center justify-between p-3 border rounded-md">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 mr-3 text-blue-500" />
                        <div>
                          <p className="font-medium">{getDocumentName(document.type, document.name)}</p>
                          <p className="text-sm text-muted-foreground">{document.id}</p>
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

      {/* Belge Görüntüleme Dialog */}
      {selectedDocument && (
        <Dialog open={isDocumentViewOpen} onOpenChange={setIsDocumentViewOpen}>
          <DialogContent className="sm:max-w-[80vw] h-[80vh]">
            <DialogHeader>
              <DialogTitle>{getDocumentName(selectedDocument.type, selectedDocument.name)}</DialogTitle>
              <DialogDescription>
                Belge önizleme
              </DialogDescription>
            </DialogHeader>
            
            <div className="w-full h-full min-h-[60vh] overflow-auto border rounded">
              <iframe 
                src={selectedDocument.url}
                className="w-full h-full"
                title={getDocumentName(selectedDocument.type, selectedDocument.name)}
              />
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDocumentViewOpen(false)}
              >
                Kapat
              </Button>
              <Button asChild>
                <a href={selectedDocument.url} target="_blank" rel="noopener noreferrer">
                  Yeni Sekmede Aç
                </a>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

function ApplicationsTable({
  applications,
  onViewDetails,
  onScheduleInterview,
  onRejectApplication,
  onViewDocuments
}: {
  applications: Application[]
  onViewDetails: (app: Application) => void
  onScheduleInterview: (app: Application) => void
  onRejectApplication: (app: Application) => void
  onViewDocuments: (app: Application) => void
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Başvuru</TableHead>
          <TableHead className="hidden md:table-cell">TC Kimlik</TableHead>
          <TableHead className="hidden md:table-cell">Üniversite</TableHead>
          <TableHead>Durum</TableHead>
          <TableHead>Belgeler</TableHead>
          <TableHead className="text-right">İşlemler</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {applications.map((application) => (
          <TableRow key={application.id}>
            <TableCell className="font-medium">
              <div>
                {application.applicantName}
                <div className="text-xs text-muted-foreground">
                  {format(new Date(application.applicationDate), "d MMM yyyy", { locale: tr })}
                </div>
              </div>
            </TableCell>
            <TableCell className="hidden md:table-cell">{application.tcKimlikNo}</TableCell>
            <TableCell className="hidden md:table-cell">{application.university}</TableCell>
            <TableCell>
              <StatusBadge status={application.status} />
            </TableCell>
            <TableCell>
              <DocumentStatusBadge status={application.documentsStatus} />
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
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
                  <DropdownMenuItem onClick={() => onViewDocuments(application)}>
                    <FileCheck className="mr-2 h-4 w-4" />
                    Belgeleri İncele
                  </DropdownMenuItem>
                  
                  {["document_review", "documents_required", "documents_submitted"].includes(application.status.toLowerCase()) && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onScheduleInterview(application)}>
                        <Users className="mr-2 h-4 w-4" />
                        Mülakat Planla
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  {(["pending", "pre_approved"].includes(application.status.toLowerCase()) || 
                    ["document_review", "documents_required", "documents_submitted"].includes(application.status.toLowerCase())) && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => onRejectApplication(application)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Başvuruyu Reddet
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
  )
}

function ApplicationDetailsDialog({
  application,
  open,
  onOpenChange,
  onScheduleInterview,
  onRejectApplication,
  onViewDocuments
}: {
  application: Application | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onScheduleInterview: () => void
  onRejectApplication: () => void
  onViewDocuments: () => void
}) {
  if (!application) return null

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {application.documents && application.documents.map((doc) => (
                <div key={doc.id} className="flex justify-between items-center p-2 border rounded-md">
                  <span>{doc.name}</span>
                  <DocumentStatusBadge status={doc.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onViewDocuments}>
            <FileCheck className="mr-2 h-4 w-4" />
            Belgeleri İncele
          </Button>
          
          {["document_review", "documents_required", "documents_submitted"].includes(application.status.toLowerCase()) && (
            <Button onClick={onScheduleInterview}>
              <Users className="mr-2 h-4 w-4" />
              Mülakat Planla
            </Button>
          )}
          
          {(["pending", "pre_approved"].includes(application.status.toLowerCase()) || 
            ["document_review", "documents_required", "documents_submitted"].includes(application.status.toLowerCase())) && (
            <Button variant="destructive" onClick={onRejectApplication}>
              <XCircle className="mr-2 h-4 w-4" />
              Başvuruyu Reddet
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


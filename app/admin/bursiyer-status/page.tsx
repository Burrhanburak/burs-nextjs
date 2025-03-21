"use client"

import { useState, useEffect } from "react"
// import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  UserCheck,
  PlusCircle,
  RefreshCcw,
  GraduationCap,
  ClipboardList,
  Ban,
  FileSpreadsheet,
} from "lucide-react"
import { getBursiyerler } from "@/lib/server-actions"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Label } from "@/components/ui/label"

// Bursiyer tipi
interface Bursiyer {
  id: string;
  name: string;
  university: string;
  department: string;
  bursStatus: string;
  startDate: string;
  endDate: string;
  gpa: number;
  level: string;
  suspendedReason?: string;
  documents?: Array<{
    id: string;
    type: string;
    status: string;
    url?: string;
  }>;
  grade?: string;
}

// Bursiyer durumu badge bileşeni
function BursStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "active":
      return (
        <Badge className="bg-green-500 hover:bg-green-600">Aktif</Badge>
      )
    case "suspended":
      return (
        <Badge variant="outline" className="text-amber-500 border-amber-500">Askıda</Badge>
      )
    case "completed":
      return (
        <Badge variant="outline" className="text-blue-500 border-blue-500">Tamamlandı</Badge>
      )
    default:
      return null
  }
}

export default function BursiyerStatusPage() {
  // const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [bursiyerler, setBursiyerler] = useState<Bursiyer[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBursiyer, setSelectedBursiyer] = useState<Bursiyer | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAcademicDialogOpen, setIsAcademicDialogOpen] = useState(false)
  const [isDocumentsDialogOpen, setIsDocumentsDialogOpen] = useState(false)
  const [bursiyerDocuments, setBursiyerDocuments] = useState<Array<{id: string; type: string; status: string; url?: string}>>([])
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false)
  const [academicFormData, setAcademicFormData] = useState({
    gpa: 0,
    grade: "",
    graduationYear: ""
  })
  const [selectedDocument, setSelectedDocument] = useState<{url: string, type: string} | null>(null)
  const [isDocumentViewOpen, setIsDocumentViewOpen] = useState(false)
  const [isAddBursiyerOpen, setIsAddBursiyerOpen] = useState(false)
  const [newBursiyerFormData, setNewBursiyerFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    tcKimlikNo: "",
    mobilePhone: "",
    university: "",
    department: "",
    grade: ""
  })

  // Bursiyerleri getir
  const fetchBursiyerler = async () => {
    setLoading(true)
    try {
      const data = await getBursiyerler()
      
      if (!data || data.length === 0) {
        console.log("No bursiyerler found or empty data received")
      } else {
        console.log(`${data.length} bursiyerler loaded successfully`)
      }
      
      // Map data to match our Bursiyer interface
      const mappedData = data.map((bursiyer: {
        id: string;
        name?: string;
        university?: string;
        department?: string;
        bursStatus?: string;
        startDate?: string;
        endDate?: string;
        gpa?: number;
        level?: string;
        suspendedReason?: string;
        grade?: string;
      }) => ({
        id: bursiyer.id,
        name: bursiyer.name || "",
        university: bursiyer.university || "",
        department: bursiyer.department || "",
        bursStatus: bursiyer.bursStatus || "active",
        startDate: bursiyer.startDate || new Date().toISOString(),
        endDate: bursiyer.endDate || new Date().toISOString(),
        gpa: bursiyer.gpa || 0,
        level: bursiyer.level || "Lisans",
        suspendedReason: bursiyer.suspendedReason,
        grade: bursiyer.grade || ""
      })) as Bursiyer[]
      
      setBursiyerler(mappedData)
    } catch (error) {
      console.error("Bursiyerleri yüklerken hata oluştu:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBursiyerler()
  }, [])

  const filteredBursiyerler = bursiyerler.filter(bursiyer => {
    const matchesSearch = 
      (bursiyer.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (bursiyer.id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (bursiyer.university || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = statusFilter === "all" || bursiyer.bursStatus === statusFilter;
    
    return matchesSearch && matchesFilter;
  })

  // Bursiyer detaylarını görüntüle
  const handleViewDetails = (bursiyer: Bursiyer) => {
    setSelectedBursiyer(bursiyer)
    setIsDialogOpen(true)
  }

  // Akademik bilgileri görüntüle
  const handleViewAcademic = (bursiyer: Bursiyer) => {
    setSelectedBursiyer(bursiyer)
    setIsAcademicDialogOpen(true)
    
    // Seçilen bursiyerin mevcut değerleriyle form alanlarını doldur
    setAcademicFormData({
      gpa: bursiyer.gpa || 0,
      grade: "",  // bursiyer nesnesinde grade yoksa boş bırakıyoruz
      graduationYear: ""  // bursiyer nesnesinde graduationYear yoksa boş bırakıyoruz
    })
  }

  // Belgeleri görüntüle
  const handleViewDocuments = async (bursiyer: Bursiyer) => {
    setSelectedBursiyer(bursiyer)
    setIsDocumentsDialogOpen(true)
    setIsLoadingDocuments(true)
    
    try {
      // Bursiyer belgelerini getir
      const response = await fetch(`/api/admin/documents/user/${bursiyer.id}`)
      if (response.ok) {
        const data = await response.json()
        setBursiyerDocuments(data.documents || [])
      } else {
        console.error("Belgeleri getirirken hata oluştu:", response.statusText)
        setBursiyerDocuments([])
      }
    } catch (error) {
      console.error("Belgeleri getirirken hata oluştu:", error)
      setBursiyerDocuments([])
    } finally {
      setIsLoadingDocuments(false)
    }
  }

  // Bursiyer durumunu değiştir
  const handleStatusChange = (id: string, newStatus: string) => {
    setBursiyerler(prevBursiyerler => 
      prevBursiyerler.map(bursiyer => 
        bursiyer.id === id 
          ? { ...bursiyer, bursStatus: newStatus } 
          : bursiyer
      )
    )
  }

  // Akademik verileri güncelle
  const handleUpdateAcademic = async () => {
    if (!selectedBursiyer) return
    
    try {
      toast.loading("Akademik veriler güncelleniyor...")
      
      const response = await fetch(`/api/admin/students/${selectedBursiyer.id}/academic`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          gpa: academicFormData.gpa,
          grade: academicFormData.grade,
          graduationYear: academicFormData.graduationYear
        })
      })
      
      if (response.ok) {
        toast.dismiss()
        toast.success("Akademik veriler güncellendi")
        
        // Bursiyer listesini güncelle
        setBursiyerler(prev => 
          prev.map(b => 
            b.id === selectedBursiyer.id 
              ? { ...b, gpa: academicFormData.gpa } 
              : b
          )
        )
        
        setIsAcademicDialogOpen(false)
      } else {
        toast.dismiss()
        toast.error("Akademik verileri güncellerken bir hata oluştu")
      }
    } catch (error) {
      toast.dismiss()
      toast.error("Akademik verileri güncellerken bir hata oluştu")
      console.error("Akademik veri güncelleme hatası:", error)
    }
  }

  // Helper function to get document name
  const getDocumentName = (type: string) => {
    const typeMap: Record<string, string> = {
      'transcript': 'Transkript',
      'id_card': 'Kimlik Kartı',
      'income_statement': 'Gelir Belgesi',
      'student_certificate': 'Öğrenci Belgesi',
      'residence_document': 'İkametgah Belgesi'
    }
    return typeMap[type] || type
  }

  // Helper function to get document status badge
  const getDocumentStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            İncelemede
          </Badge>
        )
      case "APPROVED":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Onaylandı
          </Badge>
        )
      case "REJECTED":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Reddedildi
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Belgeyi görüntüle
  const handleViewDocument = (document: {url?: string, type: string}) => {
    if (document.url) {
      setSelectedDocument({
        url: document.url,
        type: document.type
      })
      setIsDocumentViewOpen(true)
    }
  }

  // Yeni bursiyer ekleme
  const handleAddBursiyer = async () => {
    if (!newBursiyerFormData.firstName || !newBursiyerFormData.lastName || !newBursiyerFormData.email || !newBursiyerFormData.tcKimlikNo) {
      toast.error("Lütfen zorunlu alanları doldurun")
      return
    }
    
    // TC Kimlik No formatını kontrol et
    if (newBursiyerFormData.tcKimlikNo.length !== 11 || !/^\d+$/.test(newBursiyerFormData.tcKimlikNo)) {
      toast.error("TC Kimlik No 11 haneli ve sadece rakamlardan oluşmalıdır")
      return
    }
    
    try {
      toast.loading("Bursiyer ekleniyor...")
      
      const response = await fetch('/api/admin/students', {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newBursiyerFormData)
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast.dismiss()
        toast.success("Bursiyer başarıyla eklendi")
        
        // Formu temizle ve dialogu kapat
        setNewBursiyerFormData({
          firstName: "",
          lastName: "",
          email: "",
          tcKimlikNo: "",
          mobilePhone: "",
          university: "",
          department: "",
          grade: ""
        })
        setIsAddBursiyerOpen(false)
        
        // Bursiyer listesini güncelle
        fetchBursiyerler()
      } else {
        toast.dismiss()
        
        // Detaylı hata mesajlarını göster
        if (data.details) {
          if (data.details.email) {
            toast.error(data.details.email)
          }
          if (data.details.tcKimlikNo) {
            toast.error(data.details.tcKimlikNo)
          }
        } else {
          toast.error(data.error || "Bursiyer eklenirken bir hata oluştu")
        }
        
        console.error("Bursiyer ekleme hatası:", data)
      }
    } catch (error) {
      toast.dismiss()
      toast.error("Bursiyer eklenirken bir hata oluştu")
      console.error("Bursiyer ekleme hatası:", error)
    }
  }
  
  // Form değişikliklerini işle
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewBursiyerFormData({
      ...newBursiyerFormData,
      [e.target.id]: e.target.value
    })
  }
  
  // Select değişikliklerini işle
  const handleSelectChange = (name: string, value: string) => {
    setNewBursiyerFormData({
      ...newBursiyerFormData,
      [name]: value
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bursiyer Durumu</h1>
          <p className="text-muted-foreground">Mevcut bursiyerleri görüntüleyin ve burs durumlarını yönetin.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsAddBursiyerOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Bursiyer Ekle
          </Button>
        </div>
      </div>

      <Tabs defaultValue="tumu">
        <TabsList>
          <TabsTrigger value="tumu">Tümü ({bursiyerler.length})</TabsTrigger>
          <TabsTrigger value="aktif">Aktif ({bursiyerler.filter(b => b.bursStatus === "active").length})</TabsTrigger>
          <TabsTrigger value="askida">Askıda ({bursiyerler.filter(b => b.bursStatus === "suspended").length})</TabsTrigger>
          <TabsTrigger value="tamamlandi">Tamamlandı ({bursiyerler.filter(b => b.bursStatus === "completed").length})</TabsTrigger>
        </TabsList>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="İsim, ID veya üniversite ile ara..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Durum Filtrele" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Bursiyerler</SelectItem>
              <SelectItem value="active">Aktif</SelectItem>
              <SelectItem value="suspended">Askıda</SelectItem>
              <SelectItem value="completed">Tamamlandı</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="tumu" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Toplam Bursiyer</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{bursiyerler.length}</div>
                <p className="text-xs text-muted-foreground">Tüm kayıtlı bursiyerler</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Aktif Bursiyerler</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{bursiyerler.filter(b => b.bursStatus === "active").length}</div>
                <p className="text-xs text-muted-foreground">Burs almaya devam edenler</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Askıdaki Bursiyerler</CardTitle>
                <RefreshCcw className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{bursiyerler.filter(b => b.bursStatus === "suspended").length}</div>
                <p className="text-xs text-muted-foreground">Bursu askıya alınanlar</p>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardContent className="p-0">
              <BursiyerTable 
                bursiyerler={filteredBursiyerler} 
                loading={loading} 
                onViewDetails={handleViewDetails}
                onViewAcademic={handleViewAcademic}
                onViewDocuments={handleViewDocuments}
                onStatusChange={handleStatusChange}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="aktif" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <BursiyerTable 
                bursiyerler={filteredBursiyerler.filter(b => b.bursStatus === "active")} 
                loading={loading} 
                onViewDetails={handleViewDetails}
                onViewAcademic={handleViewAcademic}
                onViewDocuments={handleViewDocuments}
                onStatusChange={handleStatusChange}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="askida" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <BursiyerTable 
                bursiyerler={filteredBursiyerler.filter(b => b.bursStatus === "suspended")} 
                loading={loading}
                onViewDetails={handleViewDetails}
                onViewAcademic={handleViewAcademic}
                onViewDocuments={handleViewDocuments}
                onStatusChange={handleStatusChange}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tamamlandi" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <BursiyerTable 
                bursiyerler={filteredBursiyerler.filter(b => b.bursStatus === "completed")} 
                loading={loading}
                onViewDetails={handleViewDetails}
                onViewAcademic={handleViewAcademic}
                onViewDocuments={handleViewDocuments}
                onStatusChange={handleStatusChange}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bursiyer Detayları Dialog */}
      {selectedBursiyer && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Bursiyer Detayları</DialogTitle>
              <DialogDescription>
                {selectedBursiyer.name} adlı bursiyerin bilgileri
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Bursiyer ID</p>
                  <p className="text-base">{selectedBursiyer.id}</p>
                </div>
                <BursStatusBadge status={selectedBursiyer.bursStatus} />
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Adı Soyadı</p>
                  <p className="text-base">{selectedBursiyer.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Eğitim Seviyesi</p>
                  <p className="text-base">{selectedBursiyer.level || "Lisans"}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Üniversite</p>
                  <p className="text-base">{selectedBursiyer.university}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Bölüm</p>
                  <p className="text-base">{selectedBursiyer.department}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Başlangıç Tarihi</p>
                  <p className="text-base">{new Date(selectedBursiyer.startDate).toLocaleDateString('tr-TR')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Bitiş Tarihi</p>
                  <p className="text-base">{new Date(selectedBursiyer.endDate).toLocaleDateString('tr-TR')}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Not Ortalaması (GPA)</p>
                <p className="text-base">{selectedBursiyer.gpa}</p>
              </div>
              
              {selectedBursiyer.bursStatus === "suspended" && selectedBursiyer.suspendedReason && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Askıya Alma Nedeni</p>
                  <p className="text-base text-amber-600">{selectedBursiyer.suspendedReason}</p>
                </div>
              )}
            </div>
            
            <DialogFooter className="flex justify-between">
              <div>
                {selectedBursiyer.bursStatus === "active" && (
                  <Button
                    variant="outline"
                    className="text-amber-500"
                    onClick={() => {
                      handleStatusChange(selectedBursiyer.id, "suspended")
                      setIsDialogOpen(false)
                    }}
                  >
                    <Ban className="mr-2 h-4 w-4" />
                    Bursu Askıya Al
                  </Button>
                )}
                {selectedBursiyer.bursStatus === "suspended" && (
                  <Button
                    variant="outline"
                    className="text-green-500"
                    onClick={() => {
                      handleStatusChange(selectedBursiyer.id, "active")
                      setIsDialogOpen(false)
                    }}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Bursu Aktif Et
                  </Button>
                )}
              </div>
              <Button onClick={() => setIsDialogOpen(false)}>
                Kapat
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Akademik Bilgiler Dialog */}
      {selectedBursiyer && (
        <Dialog open={isAcademicDialogOpen} onOpenChange={setIsAcademicDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Akademik Bilgiler</DialogTitle>
              <DialogDescription>
                {selectedBursiyer.name} adlı bursiyerin akademik bilgileri
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Üniversite</p>
                  <p className="text-base">{selectedBursiyer.university || "Belirtilmemiş"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Bölüm</p>
                  <p className="text-base">{selectedBursiyer.department || "Belirtilmemiş"}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Eğitim Seviyesi</p>
                  <p className="text-base">{selectedBursiyer.level || "Lisans"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Mezuniyet Yılı</p>
                  <p className="text-base">
                    <Input 
                      placeholder="Mezuniyet Yılı" 
                      value={academicFormData.graduationYear}
                      onChange={(e) => setAcademicFormData({...academicFormData, graduationYear: e.target.value})}
                    />
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">GPA</p>
                  <Input 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    max="4.0" 
                    placeholder="0.00" 
                    value={academicFormData.gpa || selectedBursiyer.gpa || 0}
                    onChange={(e) => setAcademicFormData({...academicFormData, gpa: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sınıf</p>
                  <Select 
                    value={academicFormData.grade} 
                    onValueChange={(value) => setAcademicFormData({...academicFormData, grade: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sınıf Seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1. Sınıf</SelectItem>
                      <SelectItem value="2">2. Sınıf</SelectItem>
                      <SelectItem value="3">3. Sınıf</SelectItem>
                      <SelectItem value="4">4. Sınıf</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Kredi</p>
                  <p className="text-xl font-bold">-</p>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAcademicDialogOpen(false)}
              >
                Kapat
              </Button>
              <Button onClick={handleUpdateAcademic}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Akademik Verilerini Güncelle
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Belgeler Dialog */}
      {selectedBursiyer && (
        <Dialog open={isDocumentsDialogOpen} onOpenChange={setIsDocumentsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Bursiyer Belgeleri</DialogTitle>
              <DialogDescription>
                {selectedBursiyer.name} adlı bursiyerin yüklediği belgeler
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
                    Bu bursiyer için kayıtlı belge bulunamadı.
                  </p>
                  <Button 
                    variant="outline"
                    className="mt-4" 
                    onClick={() => {
                      toast.info("Belgeler için yeniden yükleme talebi gönderildi");
                      // Burada belgeleri yeniden yükleme API çağrısı yapılabilir
                      // fetch(`/api/admin/bursiyerler/${selectedBursiyer?.id}/request-documents`)
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
              ) : (
                <div className="space-y-4">
                  {bursiyerDocuments.map(document => (
                    <div key={document.id} className="flex items-center justify-between p-3 border rounded-md">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 mr-3 text-blue-500" />
                        <div>
                          <p className="font-medium">{getDocumentName(document.type)}</p>
                          <p className="text-sm text-muted-foreground">{document.id}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getDocumentStatusBadge(document.status)}
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
              <DialogTitle>{getDocumentName(selectedDocument.type)}</DialogTitle>
              <DialogDescription>
                Belge önizleme
              </DialogDescription>
            </DialogHeader>
            
            <div className="w-full h-full min-h-[60vh] overflow-auto border rounded">
              <iframe 
                src={selectedDocument.url}
                className="w-full h-full"
                title={getDocumentName(selectedDocument.type)}
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

      {/* Bursiyer Ekleme Dialog */}
      <Dialog open={isAddBursiyerOpen} onOpenChange={setIsAddBursiyerOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Yeni Bursiyer Ekle</DialogTitle>
            <DialogDescription>
              Sisteme yeni bir bursiyer eklemek için gerekli bilgileri doldurun.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Ad</Label>
                <Input 
                  id="firstName" 
                  placeholder="Adı" 
                  value={newBursiyerFormData.firstName}
                  onChange={handleFormChange}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Soyad</Label>
                <Input 
                  id="lastName" 
                  placeholder="Soyadı" 
                  value={newBursiyerFormData.lastName}
                  onChange={handleFormChange}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="email">E-posta</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="ornek@email.com" 
                value={newBursiyerFormData.email}
                onChange={handleFormChange}
              />
            </div>
            
            <div>
              <Label htmlFor="tcKimlikNo">TC Kimlik No</Label>
              <Input 
                id="tcKimlikNo" 
                placeholder="11 haneli TC kimlik numarası" 
                value={newBursiyerFormData.tcKimlikNo}
                onChange={handleFormChange}
              />
            </div>
            
            <div>
              <Label htmlFor="mobilePhone">Telefon</Label>
              <Input 
                id="mobilePhone" 
                placeholder="05XX XXX XX XX" 
                value={newBursiyerFormData.mobilePhone}
                onChange={handleFormChange}
              />
            </div>
            
            <div>
              <Label htmlFor="university">Üniversite</Label>
              <Input 
                id="university" 
                placeholder="Üniversite adı" 
                value={newBursiyerFormData.university}
                onChange={handleFormChange}
              />
            </div>
            
            <div>
              <Label htmlFor="department">Bölüm</Label>
              <Input 
                id="department" 
                placeholder="Bölüm adı" 
                value={newBursiyerFormData.department}
                onChange={handleFormChange}
              />
            </div>
            
            <div>
              <Label htmlFor="grade">Sınıf</Label>
              <Select 
                value={newBursiyerFormData.grade} 
                onValueChange={(value) => handleSelectChange("grade", value)}
              >
                <SelectTrigger id="grade">
                  <SelectValue placeholder="Sınıf Seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1. Sınıf</SelectItem>
                  <SelectItem value="2">2. Sınıf</SelectItem>
                  <SelectItem value="3">3. Sınıf</SelectItem>
                  <SelectItem value="4">4. Sınıf</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddBursiyerOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleAddBursiyer}>
              Bursiyer Ekle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function BursiyerTable({ 
  bursiyerler, 
  loading,
  onViewDetails,
  onViewAcademic,
  onViewDocuments,
  onStatusChange
}: { 
  bursiyerler: Bursiyer[], 
  loading: boolean,
  onViewDetails: (bursiyer: Bursiyer) => void,
  onViewAcademic: (bursiyer: Bursiyer) => void,
  onViewDocuments: (bursiyer: Bursiyer) => void,
  onStatusChange: (id: string, status: string) => void
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex flex-col items-center space-y-2">
          <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-indigo-600"></div>
          <p className="text-sm text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    )
  }
  
  if (bursiyerler.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg p-8">
        <div className="rounded-full bg-muted p-3">
          <UserCheck className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-medium">Bursiyer Bulunamadı</h3>
        <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
          Bu kriterlere uygun bursiyer bulunmamaktadır.
        </p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Bursiyer</TableHead>
          <TableHead className="hidden md:table-cell">Üniversite / Bölüm</TableHead>
          <TableHead className="hidden md:table-cell">Sınıf</TableHead>
          <TableHead className="hidden md:table-cell">Burs Dönemi</TableHead>
          <TableHead>Burs Durumu</TableHead>
          <TableHead className="hidden md:table-cell">Not Ortalaması</TableHead>
          <TableHead className="text-right">İşlemler</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bursiyerler.map((bursiyer) => (
          <TableRow key={bursiyer.id}>
            <TableCell className="font-medium">{bursiyer.id.substring(0, 8)}</TableCell>
            <TableCell>
              <div>
                <div>{bursiyer.name}</div>
                <div className="text-sm text-muted-foreground md:hidden">
                  {bursiyer.university}
                </div>
              </div>
            </TableCell>
            <TableCell className="hidden md:table-cell">
              <div>
                <div>{bursiyer.university}</div>
                <div className="text-xs text-muted-foreground">
                  {bursiyer.department || "Belirtilmemiş"}
                </div>
              </div>
            </TableCell>
            <TableCell className="hidden md:table-cell">
              {bursiyer.grade ? `${bursiyer.grade}. Sınıf` : "Belirtilmemiş"}
            </TableCell>
            <TableCell className="hidden md:table-cell">
              {new Date(bursiyer.startDate).toLocaleDateString('tr-TR')} - {new Date(bursiyer.endDate).toLocaleDateString('tr-TR')}
            </TableCell>
            <TableCell>
              <BursStatusBadge status={bursiyer.bursStatus} />
            </TableCell>
            <TableCell className="hidden md:table-cell">
              {bursiyer.gpa}
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Menüyü aç</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onViewDetails(bursiyer)}>
                    <FileText className="mr-2 h-4 w-4" />
                    Detayları Görüntüle
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onViewAcademic(bursiyer)}>
                    <GraduationCap className="mr-2 h-4 w-4" />
                    Akademik Bilgiler
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onViewDocuments(bursiyer)}>
                    <ClipboardList className="mr-2 h-4 w-4" />
                    Belgeleri İncele
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {bursiyer.bursStatus === "active" && (
                    <DropdownMenuItem 
                      className="text-amber-500" 
                      onClick={() => onStatusChange(bursiyer.id, "suspended")}
                    >
                      <RefreshCcw className="mr-2 h-4 w-4" />
                      Bursu Askıya Al
                    </DropdownMenuItem>
                  )}
                  {bursiyer.bursStatus === "suspended" && (
                    <DropdownMenuItem 
                      className="text-green-500" 
                      onClick={() => onStatusChange(bursiyer.id, "active")}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Bursu Aktif Et
                    </DropdownMenuItem>
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

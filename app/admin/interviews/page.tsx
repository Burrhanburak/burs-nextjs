"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoaderIcon, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { tr } from "date-fns/locale";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { getInterviews, scheduleInterview, deleteInterview } from "@/lib/server-actions";
import { CalendarIcon } from "lucide-react";

// Mülakat veri tipleri
interface InterviewData {
  id: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    mobilePhone?: string;
  };
  application: {
    id: string;
    title: string;
  };
  status: string;
  interviewDate: string | null;
  interviewNotes: string | null;
  interviewResult: string | null;
}

// Approved applicant veri tipi
interface ApprovedApplicant {
  id: string;
  value: string;
  label: string;
  applicantId: string;
  email: string;
  status?: string;
  readyForInterview: boolean;
}

// API response type
interface ApiApplicant {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  status: string;
  email: string;
  readyForInterview?: boolean;
}

// Declare global types
declare global {
  interface Window {
    applicationDiagnostics?: {
      userCount?: number;
      applicationCount?: number;
      availableStatuses?: string[];
      readyForInterviewCount?: number;
      testMode?: boolean;
    };
  }
}

function formatInterviewDate(dateString: string) {
  const date = new Date(dateString);
  
  // Format the date: 15 Haziran 2023, Perşembe
  const formattedDate = format(date, "d MMMM yyyy, EEEE", { locale: tr });
  
  // Format the time: 14:30
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const formattedTime = `${hours}:${minutes}`;
  
  return {
    date: formattedDate,
    time: formattedTime
  };
}

// Statü badge bileşeni
const StatusBadge = ({ status }: { status: string }) => {
  let badgeClass = "";
  let statusText = "";

  switch (status) {
    case "scheduled":
      badgeClass = "bg-blue-100 text-blue-800";
      statusText = "Planlandı";
      break;
    case "completed":
      badgeClass = "bg-green-100 text-green-800";
      statusText = "Tamamlandı";
      break;
    case "documents_approved":
      badgeClass = "bg-yellow-100 text-yellow-800";
      statusText = "Belgeler Onaylandı";
      break;
    default:
      badgeClass = "bg-gray-100 text-gray-800";
      statusText = "Bilinmiyor";
  }

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-semibold ${badgeClass}`}
    >
      {statusText}
    </span>
  );
};

// Ana bileşen
export default function InterviewsPage() {
  const [loading, setLoading] = useState(true);
  const [interviews, setInterviews] = useState<InterviewData[]>([]);
  const [filteredInterviews, setFilteredInterviews] = useState<InterviewData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedApplication, setSelectedApplication] = useState<ApprovedApplicant | null>(null);
  const [fetchingApprovedApplicants, setFetchingApprovedApplicants] = useState(false);
  const [approvedApplicants, setApprovedApplicants] = useState<ApprovedApplicant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const fetchApprovedApplicants = useCallback(async () => {
    setFetchingApprovedApplicants(true);
    console.log("Fetching applicants started...");
    try {
      // Add a cache-busting parameter
      const timestamp = new Date().getTime();
      // Direct API call to our interviews endpoint to get all applicants
      const response = await fetch(`/api/admin/interviews/applicants?t=${timestamp}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Add no-cache headers
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0"
        },
      });
      
      if (!response.ok) {
        console.error("API response not OK:", response.status, response.statusText);
        throw new Error("Başvuru sahipleri alınamadı");
      }
      
      const data = await response.json();
      console.log("API Yanıtı:", data);
      
      // Store diagnostic information for empty state message
      const diagnosticInfo = data.debug || {};
      window.applicationDiagnostics = diagnosticInfo;
      console.log("Saved diagnostics:", window.applicationDiagnostics);
      
      // Check if the response has the expected format
      if (!data.applicants || !Array.isArray(data.applicants)) {
        console.error("Invalid API response format:", data);
        // Don't throw, just set empty array and show toast
        setApprovedApplicants([]);
        toast.error("API yanıtı geçersiz format");
        return;
      }
      
      // Map applicants to the format expected by the UI
      const applicants = data.applicants.map((applicant: ApiApplicant) => {
        console.log("Mapping applicant:", applicant); // Debug log
        return {
          id: applicant.id, // This should be the ScholarshipApplication ID
          value: applicant.id,
          label: `${applicant.firstName || ""} ${applicant.lastName || ""}`.trim() || "İsimsiz Başvuru",
          applicantId: applicant.userId, // User ID for reference
          email: applicant.email || "",
          status: applicant.status || "",
          readyForInterview: !!applicant.readyForInterview
        };
      });
      
      const allApplicants = applicants || [];
      console.log(`Yüklenen başvuru sayısı: ${allApplicants.length}`);
      console.log("Belgeleri onaylanmış olanlar:", allApplicants.filter((a: ApprovedApplicant) => a.readyForInterview).length);
      
      // Update state with the applicants (ensure it's always an array)
      setApprovedApplicants(allApplicants);
      
      // Show toast notification
      if (allApplicants.length > 0) {
        const readyCount = allApplicants.filter((a: ApprovedApplicant) => a.readyForInterview).length;
        if (readyCount > 0) {
          toast.success(`${readyCount} mülakata uygun başvuru yüklendi (toplam ${allApplicants.length} başvuru)`);
        } else {
          toast.warning(`${allApplicants.length} başvuru yüklendi, ancak hiçbiri mülakata uygun değil`);
        }
      } else {
        toast.warning(data.message || "Başvuru sahibi bulunamadı");
      }
      
    } catch (error) {
      console.error("Error fetching applicants:", error);
      toast.error("Başvuru sahipleri alınırken bir hata oluştu");
      // Always set to an empty array, never undefined
      setApprovedApplicants([]);
    } finally {
      setFetchingApprovedApplicants(false);
      console.log("Fetching applicants completed");
    }
  }, []); // Empty dependency array since we don't use any external values
  
  // Debug fetch status
  useEffect(() => {
    console.log("=== DEBUGGING INTERVIEWS PAGE ===");
    console.log("Initial loading state:", loading);
    console.log("Initial approvedApplicants:", approvedApplicants.length);
    console.log("Initial diagnostics:", window.applicationDiagnostics);
    
    // Force fetch on page load - we use setTimeout to ensure all state is properly initialized
    setTimeout(() => {
      fetchApprovedApplicants();
    }, 500);
  }, [fetchApprovedApplicants]);
  
  // Mülakatları getir
  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        setLoading(true);
        const data = await getInterviews();
        console.log("API'den gelen mülakat verileri:", data);
        setInterviews(data || []);
      } catch (error) {
        console.error("Mülakatları getirme hatası:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
  }, []);

  // Filtrele ve gruplandır
  useEffect(() => {
    if (interviews.length > 0) {
      // Arama terimine göre filtrele
      const filtered = interviews.filter((interview) => {
        const fullName = `${interview.user.firstName} ${interview.user.lastName}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase());
      });

      setFilteredInterviews(filtered);
    } else {
      setFilteredInterviews([]);
    }
  }, [interviews, searchTerm]);

  // Mülakat planlama fonksiyonu
  const handleScheduleInterview = async () => {
    if (!selectedApplication || !date || !time) {
      toast.error("Lütfen tüm gerekli alanları doldurun");
      return;
    }

    try {
      setIsLoading(true);
      const [hours, minutes] = time.split(":");
      const interviewDate = new Date(date);
      interviewDate.setHours(parseInt(hours, 10));
      interviewDate.setMinutes(parseInt(minutes, 10));

      // Log what we're sending for debugging
      console.log("Mülakat planlama isteği gönderiliyor:", {
        applicationId: selectedApplication.id,
        applicantDetails: selectedApplication,
        interviewDate: interviewDate.toISOString(),
        notes
      });

      const result = await scheduleInterview({
        applicationId: selectedApplication.id,
        interviewDate: interviewDate.toISOString(),
        notes,
      });

      if (result.success) {
        toast.success("Mülakat başarıyla planlandı");
        setOpen(false);
        
        // Formu sıfırla
        setSelectedApplication(null);
        setDate(undefined);
        setTime("");
        setNotes("");
        
        // Mülakatları yenile
        const updatedInterviews = await getInterviews();
        setInterviews(updatedInterviews || []);
      }
    } catch (error) {
      console.error("Mülakat planlama hatası:", error);
      
      // Hata mesajı kontrolü
      let errorMessage = "Mülakat planlanırken bir hata oluştu";
      
      if (error instanceof Error) {
        // Belge kontrolünden dönebilecek özel hatayı kontrol et
        if (error.message.includes("Belgeleri eksik olan başvuru")) {
          errorMessage = error.message;
        } else {
          errorMessage = `Hata: ${error.message}`;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Dialog açıldığında formu sıfırla
  useEffect(() => {
    if (!open) {
      setSelectedApplication(null);
      setDate(undefined);
      setTime("");
      setNotes("");
    }
  }, [open]);

  const onOpenChange = useCallback((open: boolean) => {
    if (open) {
      fetchApprovedApplicants();
    } else {
      setSelectedApplication(null);
      setDate(undefined);
      setTime("");
      setNotes("");
    }
    setOpen(open);
  }, [fetchApprovedApplicants]);

  // Mülakat silme fonksiyonu
  const handleDeleteInterview = async (id: string) => {
    try {
      if (!confirm("Bu mülakatı iptal etmek istediğinize emin misiniz?")) {
        return;
      }
      
      await deleteInterview(id);
      toast.success("Mülakat başarıyla iptal edildi");
      
      // Mülakatları yeniden getir
      const updatedInterviews = await getInterviews();
      setInterviews(updatedInterviews || []);
    } catch (error) {
      console.error("Mülakat iptal etme hatası:", error);
      toast.error("Mülakat iptal edilirken bir hata oluştu");
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Mülakatlar</CardTitle>
            <CardDescription>
              Planlanan ve geçmiş mülakatları görüntüleyin
            </CardDescription>
          </div>
          <Button onClick={() => setOpen(true)}>Yeni Mülakat Planla</Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="İsme göre ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <LoaderIcon className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : interviews.length === 0 ? (
            <div className="h-24 text-center">
              <p className="text-muted-foreground">Henüz hiç mülakat bulunamadı.</p>
              <p className="text-muted-foreground mt-2">&ldquo;Yeni Mülakat Planla&rdquo; butonuna tıklayarak mülakat ekleyebilirsiniz.</p>
              <p className="text-muted-foreground mt-2">Planladığınız mülakatlar burada listelenecektir.</p>
              <Button 
                onClick={async () => {
                  try {
                    const updatedInterviews = await getInterviews();
                    console.log("Mülakatlar yenilendi:", updatedInterviews);
                    setInterviews(updatedInterviews || []);
                    if (updatedInterviews && updatedInterviews.length > 0) {
                      toast.success(`${updatedInterviews.length} mülakat bulundu`);
                    } else {
                      toast.info("Hiç mülakat bulunamadı");
                    }
                  } catch (error) {
                    console.error("Mülakatları yenileme hatası:", error);
                    toast.error("Mülakatları yenilerken bir hata oluştu");
                  }
                }}
                variant="outline"
                className="mt-4"
              >
                Mülakatları Yenile
              </Button>
            </div>
          ) : filteredInterviews.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Başvuru Sahibi</TableHead>
                  <TableHead>E-posta</TableHead>
                  <TableHead>Telefon</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Mülakat Tarihi</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInterviews.map((interview) => {
                  const formattedDate = interview.interviewDate 
                    ? formatInterviewDate(interview.interviewDate)
                    : { date: "-", time: "-" };
                    
                  return (
                    <TableRow key={interview.id}>
                      <TableCell className="font-medium">
                        {interview.user.firstName} {interview.user.lastName}
                      </TableCell>
                      <TableCell>{interview.user.email}</TableCell>
                      <TableCell>{interview.user.mobilePhone || "-"}</TableCell>
                      <TableCell>
                        <StatusBadge status={interview.status} />
                      </TableCell>
                      <TableCell>
                        {interview.interviewDate ? (
                          <div>
                            <div>{formattedDate.date}</div>
                            <div className="text-sm text-gray-500">
                              {formattedDate.time}
                            </div>
                          </div>
                        ) : (
                          "Planlanmadı"
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2"
                            onClick={() => {
                              // Convert interview to ApprovedApplicant format
                              const appData: ApprovedApplicant = {
                                id: interview.id,
                                value: interview.id,
                                label: `${interview.user.firstName} ${interview.user.lastName}`,
                                applicantId: interview.user.id,
                                email: interview.user.email,
                                status: interview.status,
                                readyForInterview: interview.status === "scheduled"
                              };
                              
                              setSelectedApplication(appData);
                              
                              if (interview.interviewDate) {
                                const interviewDate = new Date(interview.interviewDate);
                                setDate(interviewDate);
                                
                                const hours = interviewDate.getHours().toString().padStart(2, '0');
                                const minutes = interviewDate.getMinutes().toString().padStart(2, '0');
                                setTime(`${hours}:${minutes}`);
                              }
                              
                              setNotes(interview.interviewNotes || "");
                              setOpen(true);
                            }}
                          >
                            Düzenle
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-8 px-2"
                            onClick={() => handleDeleteInterview(interview.id)}
                          >
                            İptal Et
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Mülakat bulunamadı</p>
              <p className="text-sm mt-2">Mülakat eklemek için &quot;Yeni Mülakat Planla&quot; butonuna tıklayın</p>
              <p className="text-xs mt-1 text-gray-400">Not: Mülakat planlandığında bu tabloda görünecektir.</p>
              <Button 
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={async () => {
                  setLoading(true);
                  try {
                    const data = await getInterviews();
                    console.log("Yeniden yüklenen mülakatlar:", data);
                    setInterviews(data || []);
                    if (data && data.length > 0) {
                      toast.success(`${data.length} mülakat yüklendi`);
                    } else {
                      toast.info("Mülakat bulunamadı");
                    }
                  } catch (error) {
                    console.error("Mülakatları getirme hatası:", error);
                    toast.error("Mülakatlar yüklenirken hata oluştu");
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                Mülakatları Yenile
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mülakat Planlama Dialogu */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Mülakat Planla</DialogTitle>
            <DialogDescription>
              Sistem mülakata uygun başvuruları göstermektedir. Belgeleri Onaylanmıs
               durumundaki başvurular mülakata uygundur.
            </DialogDescription>
          </DialogHeader>
          
          {/* Applicant Selection */}
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <h4 className="font-medium">Mülakata Hazır Başvuru Sahibi Seçimi</h4>
              
              {fetchingApprovedApplicants ? (
                <div className="flex items-center justify-center p-4">
                  <LoaderIcon className="h-6 w-6 animate-spin text-gray-500" />
                  <span className="ml-2">Başvurular yükleniyor...</span>
                </div>
              ) : (
                <>
                  {(!approvedApplicants || approvedApplicants.length === 0) ? (
                    <div className="border rounded-md p-4 text-center">
                      <p className="text-sm font-medium">Mülakata uygun başvuru bulunamadı</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Veritabanı durumu: {window.applicationDiagnostics?.userCount || 0} kullanıcı, {' '}
                        {window.applicationDiagnostics?.applicationCount || 0} başvuru
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Test modu: <span className={window.applicationDiagnostics?.testMode ? "text-green-600 font-bold" : "text-red-600"}>
                          {window.applicationDiagnostics?.testMode ? "Aktif" : "Pasif"}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Mülakata uygun başvurular şu statülerde olmalıdır:
                        DOCUMENTS_SUBMITTED, DOCUMENTS_APPROVED, PRE_APPROVED veya INTERVIEW_SCHEDULED
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => fetchApprovedApplicants()}
                      >
                        Verileri Yenile
                      </Button>
                    </div>
                  ) : (
                    <select 
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={selectedApplication?.id || ""}
                      onChange={(e) => {
                        const selected = approvedApplicants.find(app => app.id === e.target.value);
                        setSelectedApplication(selected || null);
                      }}
                    >
                      <option value="">Başvuru sahibi seçin...</option>
                      {(approvedApplicants || []).map((applicant) => {
                        // Translate status to Turkish
                        let statusText = "Belirsiz";
                        if (applicant.status) {
                          switch (applicant.status) {
                            case "PENDING":
                              statusText = "Beklemede";
                              break;
                            case "DOCUMENTS_SUBMITTED":
                              statusText = "Belgeler Gönderildi";
                              break;
                            case "DOCUMENTS_APPROVED":
                              statusText = "Belgeler Onaylandı";
                              break;
                            case "PRE_APPROVED":
                              statusText = "Ön Onaylı";
                              break;
                            case "INTERVIEW_SCHEDULED":
                              statusText = "Mülakat Planlandı";
                              break;
                            case "REJECTED":
                              statusText = "Reddedildi";
                              break;
                            case "APPROVED":
                              statusText = "Onaylandı";
                              break;
                            default:
                              statusText = applicant.status;
                          }
                        }
                        
                        return (
                          <option 
                            key={applicant.id} 
                            value={applicant.id}
                            className={applicant.readyForInterview ? "text-green-700 font-medium" : ""}
                          >
                            {applicant.label} {applicant.readyForInterview ? "✓" : ""} - {applicant.readyForInterview ? "Belgeleri Onaylandı" : `Durum: ${statusText}`}
                          </option>
                        );
                      })}
                    </select>
                  )}
                </>
              )}
            </div>
            
            {/* Interview Date Selection */}
            <div className="space-y-2">
              <Label htmlFor="date">Mülakat Tarihi</Label>
              <div className="grid grid-cols-2 gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP", { locale: tr }) : "Tarih seçin"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      locale={tr}
                    />
                  </PopoverContent>
                </Popover>
                
                <div className="flex items-center space-x-2">
                  <Input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full"
                    placeholder="14:30"
                  />
                </div>
              </div>
            </div>
            
            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notlar (Opsiyonel)</Label>
              <Textarea
                id="notes"
                placeholder="Mülakat notları..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              İptal
            </Button>
            <Button
              type="submit"
              disabled={!selectedApplication || !date || !time || isLoading}
              onClick={handleScheduleInterview}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Planlanıyor...
                </>
              ) : (
                "Planla"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
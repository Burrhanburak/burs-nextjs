"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RiFileList3Line, RiNotification3Line } from "@remixicon/react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { getUserDashboardData } from "@/lib/server-actions"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

// Dashboard skeleton loader component for better UX
function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-8 animate-pulse">
      <div className="space-y-3">
        <div className="h-9 w-56 bg-muted rounded-md"></div>
        <div className="h-5 w-full max-w-2xl bg-muted rounded-md"></div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-6 h-36">
            <div className="flex justify-between">
              <div className="h-5 w-28 bg-muted rounded-md"></div>
              <div className="h-9 w-9 rounded-full bg-muted"></div>
            </div>
            <div className="mt-6 h-8 w-16 bg-muted rounded-md"></div>
            <div className="mt-2 h-3 w-40 bg-muted rounded-md"></div>
          </div>
        ))}
      </div>
      
      <div>
        <div className="rounded-lg border border-border bg-card">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-6 w-48 bg-muted rounded-md"></div>
                <div className="h-4 w-64 bg-muted rounded-md"></div>
              </div>
              <div className="h-10 w-10 rounded-full bg-muted"></div>
            </div>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-28 bg-muted rounded-md"></div>
                  <div className="h-6 w-40 bg-muted rounded-md"></div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end mt-8">
              <div className="h-5 w-48 bg-muted rounded-md"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Dashboard veri tipi
interface DashboardData {
  applications: {
    count: number;
    items: Array<{
      id: string;
      name: string;
      status: string;
      date: string;
      documents: {
        uploaded: number;
        required: number;
      };
    }>;
    lastApplication: {
      id: string;
      name: string;
      status: string;
      date: string;
      documents: {
        uploaded: number;
        required: number;
      };
    } | null;
  };
  documents: {
    count: number;
    uploaded: number;
    required: number;
    items: Array<{
      id: string;
      type: string;
      status: string;
      url: string;
      date: string;
    }>;
  };
  notifications: {
    count: number;
    items: Array<{
      id: string;
      message: string;
      type: string;
      date: string;
    }>;
  };
  profile: {
    fullName: string;
    isComplete: boolean;
  };
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Redirect to login if no session
    if (status === "unauthenticated") {
      router.push("/auth/login")
      return
    }
    
    const fetchData = async () => {
      if (session?.user?.id) {
        try {
          setLoading(true)
          const data = await getUserDashboardData(session.user.id)
          setDashboardData(data)
        } catch (error) {
          console.error("Dashboard verilerini getirme hatası:", error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchData()
    
    // Set up a refresh interval
    const interval = setInterval(() => {
      fetchData()
    }, 300000) // Refresh every 5 minutes
    
    return () => {
      clearInterval(interval)
    }
  }, [session, router])

  if (loading) {
    return <DashboardSkeleton />
  }

  if (!dashboardData) {
    return (
      <div className="flex flex-col gap-6 p-6 rounded-lg bg-card shadow-sm border border-border">
        <h1 className="text-2xl font-bold text-foreground">Hoşgeldiniz</h1>
        <div className="flex flex-col gap-2">
          <p className="text-muted-foreground">Verileriniz yüklenirken bir sorun oluştu.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 w-fit"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    )
  }

  // Tarih formatını düzenle
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  // Başvuru durumunu görsel formata dönüştür
  const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, { color: string, text: string }> = {
      PENDING: { color: "bg-blue-500", text: "Ön Değerlendirmede" },
      PRE_APPROVED: { color: "bg-yellow-500", text: "Belge Bekleniyor" },
      PRE_REJECTED: { color: "bg-red-500", text: "Ön Değerlendirme Ret" },
      DOCUMENT_REQUIRED: { color: "bg-purple-500", text: "Belge Gerekiyor" },
      DOCUMENTS_SUBMITTED: { color: "bg-blue-500", text: "Belge İncelemede" },
      DOCUMENTS_APPROVED: { color: "bg-green-500", text: "Mülakata Çağrılacak" },
      DOCUMENTS_REJECTED: { color: "bg-red-500", text: "Belge Ret" },
      INTERVIEW_SCHEDULED: { color: "bg-blue-500", text: "Mülakat Planlandı" },
      INTERVIEW_COMPLETED: { color: "bg-blue-500", text: "Mülakat Tamamlandı" },
      FINAL_APPROVED: { color: "bg-green-500", text: "Kabul Edildi" },
      FINAL_REJECTED: { color: "bg-red-500", text: "Reddedildi" }
    }

    return statusMap[status] || { color: "bg-gray-500", text: "İncelemede" }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">Hoşgeldiniz</h1>
        <p className="text-muted-foreground">Burs başvuru durumunuzu, belgelerinizi ve bildirimlerinizi bu sayfadan takip edebilirsiniz.</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/dashboard/applications" className="no-underline">
          <Card className="h-full transition-all hover:bg-accent/50 border-border hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium">
                Başvurularım
              </CardTitle>
              <div className="h-9 w-9 rounded-full flex items-center justify-center bg-primary/10">
                <RiFileList3Line className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{dashboardData.applications.count}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Aktif burs başvurularınız
              </p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/dashboard/documents" className="no-underline">
          <Card className="h-full transition-all hover:bg-accent/50 border-border hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium">
                Belgelerim
              </CardTitle>
              <div className="h-9 w-9 rounded-full flex items-center justify-center bg-primary/10">
                <RiFileList3Line className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{dashboardData.documents.uploaded}/{dashboardData.documents.required}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Yüklenen/Toplam belge
              </p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/dashboard/notifications" className="no-underline">
          <Card className="h-full transition-all hover:bg-accent/50 border-border hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium">
                Bildirimler
              </CardTitle>
              <div className="h-9 w-9 rounded-full flex items-center justify-center bg-primary/10">
                <RiNotification3Line className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{dashboardData.notifications.count}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Okunmamış bildirim
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
      
      {dashboardData.applications.lastApplication && (
        <div>
          <Card className="border-border">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Son Başvurum</CardTitle>
                  <CardDescription className="mt-1">En son yaptığınız burs başvurusu</CardDescription>
                </div>
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10">
                  <RiFileList3Line className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Başvuru Adı</h3>
                    <p className="font-medium text-lg">{dashboardData.applications.lastApplication.name}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Durum</h3>
                    <div className="flex items-center">
                      <span className={`flex h-3 w-3 rounded-full ${getStatusDisplay(dashboardData.applications.lastApplication.status).color} mr-2`}></span>
                      <span className="font-medium text-lg">{getStatusDisplay(dashboardData.applications.lastApplication.status).text}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Başvuru Tarihi</h3>
                    <p className="font-medium text-lg">{formatDate(dashboardData.applications.lastApplication.date)}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Yüklenen Belgeler</h3>
                    <p className="font-medium text-lg">{dashboardData.applications.lastApplication.documents.uploaded}/{dashboardData.applications.lastApplication.documents.required}</p>
                  </div>
                </div>
                
                <div className="flex justify-end pt-2">
                  <Link 
                    href="/dashboard/applications" 
                    className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 hover:underline"
                  >
                    Tüm başvurularımı görüntüle
                    <svg className="ml-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 
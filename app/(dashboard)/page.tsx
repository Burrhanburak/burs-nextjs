"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RiNotificationLine, RiUserLine, RiFileLine } from "@remixicon/react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { getUserDashboardData } from "@/lib/server-actions"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export const dynamic = 'force-dynamic'
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
  const { data: session } = useSession()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      if (session?.user?.id) {
        setLoading(true)
        try {
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
    return (
      <div className="flex justify-center items-center h-full py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Hoş Geldiniz
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Verileriniz yüklenirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.
          </p>
        </div>
      </div>
    )
  }

  const stats = [
    {
      name: "Başvurularım",
      value: dashboardData.applications.count.toString(),
      href: "/applications",
      icon: RiFileLine,
    },
    {
      name: "Evraklarım",
      value: `${dashboardData.documents.uploaded}/${dashboardData.documents.required}`,
      href: "/documents",
      icon: RiFileLine,
    },
    {
      name: "Bildirimler",
      value: dashboardData.notifications.count.toString(),
      href: "/notifications",
      icon: RiNotificationLine,
    },
    {
      name: "Profilim",
      value: dashboardData.profile.isComplete ? "Tam" : "Eksik",
      href: "/profile",
      icon: RiUserLine,
    },
  ]

  // Başvuru durumunu görsel formata dönüştür
  const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, { text: string; color: string }> = {
      PENDING: { text: "İncelemede", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
      PRE_APPROVED: { text: "Ön Onay", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
      PRE_REJECTED: { text: "Ön Red", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
      DOCUMENT_REQUIRED: { text: "Belge Gerekiyor", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" },
      DOCUMENTS_SUBMITTED: { text: "Belgeler Gönderildi", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
      DOCUMENTS_APPROVED: { text: "Belgeler Onaylandı", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
      DOCUMENTS_REJECTED: { text: "Belgeler Reddedildi", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
      INTERVIEW_SCHEDULED: { text: "Mülakat Planlandı", color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200" },
      INTERVIEW_COMPLETED: { text: "Mülakat Tamamlandı", color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200" },
      FINAL_APPROVED: { text: "Kabul Edildi", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
      FINAL_REJECTED: { text: "Reddedildi", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
    }

    const defaultStatus = { text: "İncelemede", color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200" }
    return statusMap[status] || defaultStatus
  }

  // Tarih formatını düzenle
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  return (
    <div className="relative">
      <div className="p-4 sm:px-6 sm:pb-10 sm:pt-10 lg:px-10 lg:pt-7">
      <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Hoş Geldiniz, {dashboardData.profile.fullName}
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Burs başvuru sürecinizi buradan takip edebilirsiniz.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.name} href={stat.href} className="no-underline">
            <Card className="transition-all hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700/50 hover:shadow-md border border-gray-200 dark:border-gray-800 overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.name}
                </CardTitle>
                <div className="h-8 w-8 rounded-md bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center">
                  <stat.icon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {dashboardData.applications.lastApplication && (
        <Card className="dark:bg-gray-800">
          <CardHeader>
            <CardTitle>Son Başvurunuz</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
                    {dashboardData.applications.lastApplication.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Başvuru Tarihi: {formatDate(dashboardData.applications.lastApplication.date)}
                  </p>
                </div>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusDisplay(dashboardData.applications.lastApplication.status).color}`}>
                  {getStatusDisplay(dashboardData.applications.lastApplication.status).text}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
                    Evrak Durumu
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {dashboardData.applications.lastApplication.documents.uploaded}/{dashboardData.applications.lastApplication.documents.required} evrak yüklendi
                  </p>
                </div>
                <div className="h-2 w-24 rounded-full bg-gray-200 dark:bg-gray-800">
                  <div 
                    className="h-2 rounded-full bg-indigo-600 dark:bg-indigo-500" 
                    style={{ 
                      width: `${Math.min(100, (dashboardData.applications.lastApplication.documents.uploaded / Math.max(1, dashboardData.applications.lastApplication.documents.required)) * 100)}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tüm Başvurular Tablosu */}
      {dashboardData.applications.items.length > 0 && (
        <Card className="dark:bg-gray-800">
          <CardHeader>
            <CardTitle>Tüm Başvurularım</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Başvuru Adı</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Başvuru Tarihi</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Durum</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Evrak Durumu</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.applications.items.map((application) => (
                    <tr key={application.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="py-3 px-4">
                        <Link href={`/applications/${application.id}`} className="text-sm font-medium text-gray-900 dark:text-gray-50 hover:text-blue-600 dark:hover:text-blue-400">
                          {application.name}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(application.date)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusDisplay(application.status).color}`}>
                          {getStatusDisplay(application.status).text}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="h-2 w-20 rounded-full bg-gray-200 dark:bg-gray-700">
                            <div 
                              className="h-2 rounded-full bg-indigo-600 dark:bg-indigo-500" 
                              style={{ 
                                width: `${Math.min(100, (application.documents.uploaded / Math.max(1, application.documents.required)) * 100)}%` 
                              }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {application.documents.uploaded}/{application.documents.required}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
        </div>
        </div>
  
  )
}
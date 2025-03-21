"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function ManageNotificationsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const { status } = useSession()
  const router = useRouter()
  const [notifications, setNotifications] = useState([])

  const getNotifications = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/notifications/debug")
      
      if (!response.ok) {
        throw new Error("Failed to fetch notifications")
      }
      
      const data = await response.json()
      setNotifications(data.notifications)
      toast.success(`${data.count} bildirim bulundu`)
    } catch (error) {
      console.error("Error:", error)
      toast.error("İşlem sırasında bir hata oluştu")
    } finally {
      setIsLoading(false)
    }
  }

  const clearSpecificNotification = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/notifications/debug", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          text: "ön değerlendirmeden" 
        }),
      })
      
      if (!response.ok) {
        throw new Error("Failed to delete notifications")
      }
      
      const data = await response.json()
      toast.success(`${data.deleted} bildirim silindi`)
      router.refresh()
    } catch (error) {
      console.error("Error:", error)
      toast.error("İşlem sırasında bir hata oluştu")
    } finally {
      setIsLoading(false)
    }
  }

  const clearAllNotifications = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/notifications/clear-all", {
        method: "POST",
      })
      
      if (!response.ok) {
        throw new Error("Failed to clear notifications")
      }
      
      const data = await response.json()
      toast.success(`${data.deletedCount} bildirim silindi`)
      router.refresh()
    } catch (error) {
      console.error("Error:", error)
      toast.error("İşlem sırasında bir hata oluştu")
    } finally {
      setIsLoading(false)
    }
  }

  if (status !== "authenticated") {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mb-2 text-sm text-gray-500 dark:text-gray-400">
            Yükleniyor...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bildirim Yönetimi</h1>
        <p className="text-muted-foreground">
          Bildirimlerinizi yönetmek için bu sayfayı kullanabilirsiniz.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Bildirim İşlemleri</CardTitle>
          <CardDescription>
            Bildirimlerinizi görüntüleyebilir ve yönetebilirsiniz.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={getNotifications} 
            disabled={isLoading}
            variant="outline"
          >
            Bildirimleri Görüntüle
          </Button>
          
          <Button 
            onClick={clearSpecificNotification} 
            disabled={isLoading}
            variant="destructive"
          >
            &ldquo;Ön Değerlendirme&rdquo; Bildirimini Sil
          </Button>
          
          <Button 
            onClick={clearAllNotifications} 
            disabled={isLoading}
            variant="destructive"
          >
            Tüm Bildirimleri Sil
          </Button>
          
          {notifications.length > 0 && (
            <div className="mt-4 border rounded-md p-4">
              <h3 className="text-sm font-medium mb-2">Bildirimler ({notifications.length})</h3>
              <div className="space-y-2">
                {notifications.map((notification: {
                  id: string;
                  message: string;
                  type: string;
                  read: boolean;
                  createdAt: string;
                }) => (
                  <div key={notification.id} className="text-sm border-b pb-2">
                    <p><strong>Mesaj:</strong> {notification.message}</p>
                    <p><strong>Tür:</strong> {notification.type}</p>
                    <p><strong>Okundu:</strong> {notification.read ? 'Evet' : 'Hayır'}</p>
                    <p><strong>Tarih:</strong> {new Date(notification.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={() => router.push('/notifications')} variant="outline">
            Bildirimler Sayfasına Dön
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 
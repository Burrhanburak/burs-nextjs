"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState, useCallback } from "react"
import { 
  RiNotificationLine, 
  RiCheckLine, 
  RiMailLine, 
  RiCalendarLine,
  RiFileListLine
} from "@remixicon/react"
import { toast } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface Notification {
  id: string
  message: string
  type: string
  read: boolean
  createdAt: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { status } = useSession()
  const router = useRouter()

  // If not authenticated, redirect to login
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/login")
    }
  }, [status, router])

  // Create fetchNotifications as a useCallback so we can reference it in useEffect
  const fetchNotifications = useCallback(async () => {
    setIsLoading(true)
    try {
      // Fetch real notifications from API
      const response = await fetch("/api/notifications")
      
      if (!response.ok) {
        throw new Error("Failed to fetch notifications")
      }
      
      const data = await response.json()
      console.log("Fetched notifications:", data)
      setNotifications(data)
    } catch (error) {
      console.error("Error fetching notifications:", error)
      toast.error("Bildirimler yüklenirken bir hata oluştu")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status === "authenticated") {
      fetchNotifications()
      
      // Set up polling for new notifications every 30 seconds
      const interval = setInterval(() => {
        fetchNotifications()
      }, 30000)
      
      return () => clearInterval(interval)
    }
  }, [status, fetchNotifications])

  const markAsRead = async (notificationId: string) => {
    try {
      // Send to API
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ read: true }),
      })
      
      if (!response.ok) {
        throw new Error("Failed to mark notification as read")
      }

      // Update local state
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      )
      
      toast.success("Bildirim okundu olarak işaretlendi")
    } catch (error) {
      console.error("Error marking notification as read:", error)
      toast.error("Bildirim işaretlenirken bir hata oluştu")
    }
  }
  
  const markAllAsRead = async () => {
    try {
      // Send to API
      const response = await fetch("/api/notifications/mark-all-read", {
        method: "POST",
      })
      
      if (!response.ok) {
        throw new Error("Failed to mark all notifications as read")
      }

      // Update local state
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, read: true }))
      )
      
      toast.success("Tüm bildirimler okundu olarak işaretlendi")
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
      toast.error("Bildirimler işaretlenirken bir hata oluştu")
    }
  }
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "APPLICATION_STATUS":
        return <RiFileListLine className="h-5 w-5" />
      case "DOCUMENT_STATUS":
        return <RiFileListLine className="h-5 w-5" />
      case "INTERVIEW_INVITATION":
        return <RiCalendarLine className="h-5 w-5" />
      case "GENERAL":
        return <RiMailLine className="h-5 w-5" />
      default:
        return <RiNotificationLine className="h-5 w-5" />
    }
  }
  
  const getNotificationColor = (type: string) => {
    switch (type) {
      case "APPLICATION_STATUS":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
      case "DOCUMENT_STATUS":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400"
      case "INTERVIEW_INVITATION":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
      case "GENERAL":
        return "bg-gray-100 text-gray-700 dark:bg-gray-800/20 dark:text-gray-400"
      default:
        return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400"
    }
  }
  
  const unreadCount = notifications.filter(n => !n.read).length

  if (isLoading) {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bildirimler</h1>
          <p className="text-muted-foreground">
            Burs başvurunuzla ilgili tüm bildirimleri buradan görüntüleyebilirsiniz.
          </p>
        </div>
        {unreadCount > 0 && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={markAllAsRead}
            className="flex items-center gap-1"
          >
            <RiCheckLine className="h-4 w-4" />
            Tümünü Okundu İşaretle
          </Button>
        )}
      </div>
      
      <Separator />
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tüm Bildirimler</CardTitle>
              <CardDescription>
                En son bildirimleri burada görebilirsiniz
              </CardDescription>
            </div>
            {unreadCount > 0 && (
              <Badge variant="secondary">
                {unreadCount} okunmamış
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-800">
                <RiNotificationLine className="h-6 w-6 text-gray-500" />
              </div>
              <h3 className="mt-4 text-lg font-medium">Bildiriminiz bulunmuyor</h3>
              <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                Başvuru durumunuz ve belgelerinizle ilgili bildirimler burada görüntülenecektir.
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`relative rounded-lg border p-4 transition-colors ${
                      !notification.read 
                        ? "bg-blue-50/50 dark:bg-blue-950/10 border-blue-100 dark:border-blue-950" 
                        : "bg-card border-border"
                    }`}
                  >
                    {!notification.read && (
                      <div className="absolute right-4 top-4 h-2 w-2 rounded-full bg-blue-500" />
                    )}
                    <div className="flex gap-4">
                      <div className={`rounded-full p-2 ${getNotificationColor(notification.type)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            {new Date(notification.createdAt).toLocaleString("tr-TR", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </p>
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="h-auto p-0 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              Okundu olarak işaretle
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <p className="text-xs text-muted-foreground">
            Bildirimleriniz 30 gün boyunca saklanır.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
} 
"use client"
import React, { useEffect, useState } from "react"

import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/ui/admnin-navigation/Sidebar"
import { cx } from "@/lib/utils"

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  const [isCollapsed, setIsCollapsed] = useState(false)
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  useEffect(() => {
    // Check if user is admin on component mount
    async function checkAdminStatus() {
      try {
        const response = await fetch('/api/auth/check-admin')
        
        if (!response.ok) {
          // Request failed
          router.push('/auth/login')
          return
        }
        
        const data = await response.json()
        
        if (!data.isAuthenticated || !data.isAdmin) {
          // Not authenticated or not an admin
          router.push('/auth/login')
          return
        }
        
        setIsAdmin(true)
        setIsLoading(false)
      } catch (error) {
        console.error("Error checking admin status:", error)
        router.push('/auth/login')
      }
    }
    
    checkAdminStatus()
  }, [router])

  // Toggle sidebar collapsed state

  // Show loading state or nothing while checking admin status
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-2">Yetki kontrol ediliyor...</p>
        </div>
      </div>
    )
  }

  // Only render admin layout if user is an admin
  if (!isAdmin) {
    return null
  }
 
  return (
    <div className="mx-auto max-w-screen-1xl h-screen">
      <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
      <main
        className={cx(
          isCollapsed ? "lg:pl-[60px]" : "lg:pl-64",
          "h-full ease transform-gpu transition-all duration-75 will-change-transform lg:bg-gray-50 lg:py-3 lg:pr-3 lg:dark:bg-gray-950",
        )}
      >
        <div className="bg-white p-4 sm:p-6 lg:rounded-lg lg:border lg:border-gray-200 dark:bg-gray-925 lg:dark:border-gray-900 h-full">
          {children}
        </div>
      </main>
    </div>
  )
}

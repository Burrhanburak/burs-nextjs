"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function AdminPage() {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  
  useEffect(() => {
    async function checkAndRedirect() {
      try {
        // Check admin status first
        const response = await fetch('/api/auth/check-admin')
        
        if (!response.ok) {
          // If not authenticated, redirect to login
          router.push('/auth/login')
          return
        }
        
        const data = await response.json()
        
        if (!data.isAuthenticated || !data.isAdmin) {
          // Not admin, redirect to login
          router.push('/auth/login')
          return
        }
        
        // Admin is authenticated, redirect to dashboard
        router.push("/admin/dashboard")
      } catch (error) {
        console.error("Authentication check failed:", error)
        router.push('/auth/login')
      } finally {
        setIsChecking(false)
      }
    }
    
    checkAndRedirect()
  }, [router])
  
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-2rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-2">Yetki kontrol ediliyor...</p>
          <hr className="border-t border-gray-200 my-4 w-48 mx-auto" />
        </div>
      </div>
    )
  }
  
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-2rem)]">
      <div className="text-center">
        <p>Yönetim paneline yönlendiriliyorsunuz...</p>
        <hr className="border-t border-gray-200 my-4 w-48 mx-auto" />
      </div>
    </div>
  )
} 
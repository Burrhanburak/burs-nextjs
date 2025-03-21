"use client"

import { SessionProvider } from "next-auth/react"
import { Sidebar } from "@/components/ui/user-navigation/Sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <div className="mx-auto max-w-screen-2xl">
        <Sidebar />
        <main className="lg:pl-72 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="rounded-xl border border-border bg-white dark:bg-gray-900 shadow-sm p-6 sm:p-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </SessionProvider>
  )
} 
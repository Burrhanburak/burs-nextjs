"use client"
import { ThemeProvider } from "next-themes"
import { Inter } from "next/font/google"
import "../globals.css"
// import { siteConfig } from "./siteConfig"

import { SessionProvider } from "next-auth/react"

import { Sidebar } from "@/components/ui/user-navigation/Sidebar"
import { Toaster } from "sonner"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <SessionProvider>
      <body
        className={`${inter.className} overflow-y-scroll scroll-auto antialiased selection:bg-indigo-100 selection:text-indigo-700 dark:bg-gray-950`}
        suppressHydrationWarning
      >
        <div className="mx-auto max-w-screen-2xl">
          <ThemeProvider defaultTheme="system" attribute="class">
            <Sidebar />
            <main className="lg:pl-72 p-4 sm:p-6 lg:p-8">
              <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="rounded-xl border border-border bg-white dark:bg-gray-900 shadow-sm p-6 sm:p-8">
                  {children}
                </div>
              </div>
            </main>
            <Toaster position="top-right" richColors closeButton />
          </ThemeProvider>
        </div>
      </body>
      </SessionProvider>
    </html>
  )
}



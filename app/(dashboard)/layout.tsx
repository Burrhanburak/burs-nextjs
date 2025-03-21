"use client"

// import { Inter } from "next/font/google"
// import "../globals.css"
// import { Sidebar } from "@/components/ui/navigation/Sidebar"
// import { useState, useEffect } from "react"
// import { ThemeProvider } from "next-themes"
// import { SessionProvider } from "next-auth/react"
// import { Toaster } from "sonner"

// const inter = Inter({
//   subsets: ["latin"],
//   display: "swap",
//   variable: "--font-inter",
// })

// export default function DashboardLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode
// }>) {
//   const [isCollapsed, setIsCollapsed] = useState(false)
//   const [mounted, setMounted] = useState(false)
  
//   // Prevent hydration mismatch with theme
//   useEffect(() => {
//     setMounted(true)
//   }, [])
  
//   const toggleSidebar = () => {
//     setIsCollapsed(!isCollapsed)
//   }
  
//   return (
//     <div className={`${inter.className} antialiased selection:bg-indigo-100 selection:text-indigo-700 dark:selection:bg-indigo-900 dark:selection:text-indigo-200`}>
//       <SessionProvider>
//         <ThemeProvider defaultTheme="system" attribute="class">
//           {mounted && (
//             <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
//               <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
//               <main className={`flex-1 ${isCollapsed ? 'lg:pl-[60px]' : 'lg:pl-72'} transition-all duration-200 ease-in-out`}>
//                 <div className="h-full">
//                   <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
//                     <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
//                       <div className="p-6">
//                         {children}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </main>
//             </div>
//           )}
//           <Toaster position="top-right" richColors closeButton />
//         </ThemeProvider>
//       </SessionProvider>
//     </div>
//   )
// }

// import type { Metadata } from "next"
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

// export const metadata: Metadata = {
//   metadataBase: new URL("https://yoururl.com"),
//   title: siteConfig.name,
//   description: siteConfig.description,
//   keywords: [],
//   authors: [
//     {
//       name: "yourname",
//       url: "",
//     },
//   ],
//   creator: "yourname",
//   openGraph: {
//     type: "website",
//     locale: "en_US",
//     url: siteConfig.url,
//     title: siteConfig.name,
//     description: siteConfig.description,
//     siteName: siteConfig.name,
//   },
//   icons: {
//     icon: "/favicon.ico",
//   },
// }

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



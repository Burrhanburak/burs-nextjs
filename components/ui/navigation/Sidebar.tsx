"use client"
import { cx, focusRing } from "@/lib/utils"
import {
  RiDashboardLine,
  RiFileListLine,
  RiNotificationLine,
  RiUserLine,
  RiMenuFoldLine,
  RiMenuUnfoldLine,
  RiFileLine,
  RiHomeSmileLine
} from "@remixicon/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import MobileSidebar from "./MobileSidebar"
import { UserProfileDesktop, UserProfileMobile } from "./UserProfile"

const navigation = [
  { name: "Dashboard", href: "/user/dashboard", icon: RiDashboardLine },
  { name: "Başvurularım", href: "/user/applications", icon: RiFileListLine },
  { name: "Evraklarım", href: "/user/documents", icon: RiFileLine },
  { name: "Bildirimler", href: "/user/notifications", icon: RiNotificationLine },
  { name: "Profilim", href: "/user/profile", icon: RiUserLine },
] as const

interface SidebarProps {
  isCollapsed: boolean
  toggleSidebar: () => void
}

export function Sidebar({ isCollapsed, toggleSidebar }: SidebarProps) {
  const pathname = usePathname()
  const isActive = (itemHref: string) => {
    return pathname === itemHref || pathname.startsWith(itemHref)
  }

  return (
    <>
      {/* Sidebar (lg+) */}
      <nav className={cx(
        "hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col",
        isCollapsed ? "lg:w-[68px]" : "lg:w-72",
        "transition-all duration-300 ease-in-out"
      )}>
        <aside className="flex h-full grow flex-col overflow-y-auto border-r border-gray-200 bg-white px-3 py-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between mb-6 px-2">
            <div className="flex items-center">
              {!isCollapsed && (
                <Link href="/user/dashboard" className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-600 text-white">
                    <RiHomeSmileLine className="h-5 w-5" />
                  </div>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">Bursiyer</span>
                </Link>
              )}
              {isCollapsed && (
                <Link href="/user/dashboard" className="flex items-center justify-center">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-indigo-600 text-white">
                    <RiHomeSmileLine className="h-5 w-5" />
                  </div>
                </Link>
              )}
            </div>
            <button
              onClick={toggleSidebar}
              className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-50"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <RiMenuUnfoldLine className="h-5 w-5" aria-hidden="true" />
              ) : (
                <RiMenuFoldLine className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
          
          <nav className="flex flex-1 flex-col">
            <ul className="flex flex-1 flex-col gap-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cx(
                      isActive(item.href)
                        ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white",
                      "group flex gap-x-3 rounded-md p-2 text-sm font-medium",
                      isCollapsed ? "justify-center" : "",
                      focusRing,
                    )}
                  >
                    <item.icon 
                      className={cx(
                        isActive(item.href) 
                          ? "text-indigo-600 dark:text-indigo-400" 
                          : "text-gray-500 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white",
                        "h-5 w-5 shrink-0"
                      )} 
                      aria-hidden="true" 
                    />
                    {!isCollapsed && <span>{item.name}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          
          <div className="mt-auto pt-2 border-t border-gray-200 dark:border-gray-800">
            <UserProfileDesktop isCollapsed={isCollapsed} />
          </div>
        </aside>
      </nav>
      
      {/* Mobile header (xs-lg) */}
      <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm lg:hidden dark:border-gray-800 dark:bg-gray-900">
        <Link href="/user/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-600 text-white">
            <RiHomeSmileLine className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">Bursiyer</span>
        </Link>
        <div className="flex items-center gap-3">
          <UserProfileMobile />
          <MobileSidebar />
        </div>
      </div>
    </>
  )
} 
"use client"
import { cx, focusRing } from "@/lib/utils"
import {
  RiDashboardLine,
  RiFileListLine,
  RiUserLine,
  RiMenuFoldLine,
  RiMenuUnfoldLine,
  RiSettings4Line,
  RiCalendarEventLine,
  RiFileTextLine,
  RiBarChartBoxLine,
  RiUserSearchLine,
  RiShieldUserLine,
  RiChatHistoryLine,
} from "@remixicon/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserProfileDesktop, UserProfileMobile } from "./UserProfile"
import MobileSidebar from "./MobileSidebar"

const adminNavigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: RiDashboardLine },
  { name: "Başvurular", href: "/admin/applicants", icon: RiUserSearchLine },
  { name: "Belgeler", href: "/admin/documents", icon: RiFileTextLine },
  { name: "Mülakatlar", href: "/admin/interviews", icon: RiCalendarEventLine },
  { name: "Bursiyer Durumu", href: "/admin/bursiyer-status", icon: RiShieldUserLine },
  // { name: "Raporlar", href: "/admin/reports", icon: RiBarChartBoxLine },
  { 
    name: "Ayarlar", 
    href: "/admin/settings", 
    icon: RiSettings4Line,
    subItems: [
      { name: "Kullanıcılar", href: "/admin/settings/users" },
      { name: "Denetim", href: "/admin/settings/audit" },
      // { name: "Fatura", href: "/admin/settings/billing" },
    ]
  },
] as const

interface AdminSidebarProps {
  isCollapsed: boolean
  toggleSidebar: () => void
}

export function AdminSidebar({ isCollapsed, toggleSidebar }: AdminSidebarProps) {
  const pathname = usePathname()
  
  const isActive = (itemHref: string) => {
    return pathname === itemHref || pathname.startsWith(itemHref)
  }

  const isSubActive = (mainHref: string, subHref: string) => {
    return pathname.startsWith(mainHref) && pathname.includes(subHref)
  }

  return (
    <>
      {/* sidebar (lg+) */}
      <nav className={cx(
        "hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col",
        isCollapsed ? "lg:w-[60px]" : "lg:w-72",
        "transition-all duration-200 ease-in-out"
      )}>
        <aside className="flex grow flex-col gap-y-6 overflow-y-auto border-r border-gray-200 bg-white p-4 text-gray-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {!isCollapsed && (
                <span className="text-xl font-bold">Admin Panel</span>
              )}
              {isCollapsed && (
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-600 text-white">
                  A
                </span>
              )}
            </div>
            <button
              onClick={toggleSidebar}
              className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            >
              {isCollapsed ? (
                <RiMenuUnfoldLine className="size-5" aria-hidden="true" />
              ) : (
                <RiMenuFoldLine className="size-5" aria-hidden="true" />
              )}
            </button>
          </div>
          
          <div className="h-[1px] bg-gray-200" />
          
          <nav
            aria-label="admin navigation links"
            className="flex flex-1 flex-col space-y-1"
          >
            <ul role="list" className="space-y-1">
              {adminNavigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cx(
                      isActive(item.href) && !item.subItems
                        ? "bg-indigo-100 text-indigo-700"
                        : "text-gray-700 hover:bg-gray-100 hover:text-indigo-600",
                      "group flex items-center gap-x-3 rounded-md px-3 py-2 text-sm font-medium transition-all",
                      focusRing,
                    )}
                  >
                    <item.icon className="size-5 shrink-0" aria-hidden="true" />
                    {!isCollapsed && item.name}
                  </Link>
                  
                  {!isCollapsed && item.subItems && (
                    <ul className="mt-1 space-y-1 pl-10">
                      {item.subItems.map((subItem) => (
                        <li key={subItem.name}>
                          <Link
                            href={subItem.href}
                            className={cx(
                              isSubActive(item.href, subItem.href)
                                ? "bg-indigo-50 text-indigo-700"
                                : "text-gray-700 hover:bg-gray-100 hover:text-indigo-600",
                              "block rounded-md px-3 py-2 text-sm font-medium transition-all",
                              focusRing,
                            )}
                          >
                            {subItem.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </nav>
          
          <div className="h-[1px] bg-gray-200" />
          
          <div className="mt-auto">
            <UserProfileDesktop isCollapsed={isCollapsed} />
          </div>
        </aside>
      </nav>
      
      {/* top navbar (xs-lg) */}
      <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 text-gray-900 shadow-sm lg:hidden">
        <div className="flex items-center">
          <span className="text-xl font-bold">Admin Panel</span>
        </div>
        <div className="flex items-center gap-2">
          <UserProfileMobile />
          <MobileAdminSidebar />
        </div>
      </div>
    </>
  )
}

function MobileAdminSidebar() {
  const pathname = usePathname()
  
  const isActive = (itemHref: string) => {
    return pathname === itemHref || pathname.startsWith(itemHref)
  }

  const isSubActive = (mainHref: string, subHref: string) => {
    return pathname.startsWith(mainHref) && pathname.includes(subHref)
  }
  
  return (
    <div className="lg:hidden">
      <MobileSidebar>
        <div className="flex flex-col gap-y-6 px-1 py-4">
          <nav
            aria-label="admin mobile navigation"
            className="flex flex-1 flex-col space-y-1"
          >
            <ul role="list" className="space-y-1">
              {adminNavigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cx(
                      isActive(item.href) && !item.subItems
                        ? "bg-indigo-100 text-indigo-700"
                        : "text-gray-700 hover:bg-gray-100 hover:text-indigo-600",
                      "group flex items-center gap-x-3 rounded-md px-3 py-2 text-sm font-medium transition-all",
                      focusRing,
                    )}
                  >
                    <item.icon className="size-5 shrink-0" aria-hidden="true" />
                    {item.name}
                  </Link>
                  
                  {item.subItems && (
                    <ul className="mt-1 space-y-1 pl-10">
                      {item.subItems.map((subItem) => (
                        <li key={subItem.name}>
                          <Link
                            href={subItem.href}
                            className={cx(
                              isSubActive(item.href, subItem.href)
                                ? "bg-indigo-50 text-indigo-700"
                                : "text-gray-700 hover:bg-gray-100 hover:text-indigo-600",
                              "block rounded-md px-3 py-2 text-sm font-medium transition-all",
                              focusRing,
                            )}
                          >
                            {subItem.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </MobileSidebar>
    </div>
  )
} 
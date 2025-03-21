"use client"
import { AdminSiteConfig } from "@/app/siteConfig"
import { Tooltip } from "@/components/Tooltip"
import { cx, focusRing } from "@/lib/utils"
import {
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import MobileSidebar from "./MobileSidebar"
import { UserProfileDesktop, UserProfileMobile } from "./UserProfile"
import { RiCalendarEventLine, RiDashboardLine, RiFileTextLine, RiSettings4Line, RiShieldUserLine, RiUserSearchLine } from "@remixicon/react"


export const adminNavigation = [ 
  { name: "Dashboard", href: AdminSiteConfig.admin.dashboard, icon: RiDashboardLine },
  { name: "Başvurular", href: AdminSiteConfig.admin.applicants, icon: RiUserSearchLine },
  { name: "Belgeler", href: AdminSiteConfig.admin.documents, icon: RiFileTextLine },
  { name: "Mülakatlar", href: AdminSiteConfig.admin.interviews, icon: RiCalendarEventLine },
  { name: "Bursiyer Durumu", href: AdminSiteConfig.admin.bursiyerStatus, icon: RiShieldUserLine },
  { name: "Ayarlar", href: AdminSiteConfig.admin.settings.audit, icon: RiSettings4Line },
] as const


interface AdminSidebarProps {
  isCollapsed: boolean
  toggleSidebar: () => void
}

export function Sidebar({ isCollapsed, toggleSidebar }: AdminSidebarProps) {
  const pathname = usePathname()
  const isActive = (itemHref: string) => {
    return pathname === itemHref || pathname.startsWith(itemHref + "/")
  }
  
  return (
    <>
      {/* sidebar (lg+) */}
      <nav
        className={cx(
          isCollapsed ? "lg:w-[60px]" : "lg:w-64",
          "hidden overflow-x-hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col",
          "transition-width duration-150 ease-in-out",
        )}
      >
        <aside className="flex grow flex-col gap-y-4 overflow-y-auto whitespace-nowrap px-3 py-4">
          <div>
            <div className="flex items-center gap-x-1.5">
              <button
                className="group inline-flex rounded-md p-2 hover:bg-gray-200/50 hover:dark:bg-gray-900"
                onClick={toggleSidebar}
              >
                {isCollapsed ? (
                  <PanelRightClose
                    className="size-5 shrink-0 text-gray-500 group-hover:text-gray-700 dark:text-gray-500 group-hover:dark:text-gray-300"
                    aria-hidden="true"
                  />
                ) : (
                  <PanelRightOpen
                    className="size-5 shrink-0 text-gray-500 group-hover:text-gray-700 dark:text-gray-500 group-hover:dark:text-gray-300"
                    aria-hidden="true"
                  />
                )}
              </button>
              <span
                className={cx(
                  "text-sm font-semibold text-gray-900 transition-opacity dark:text-gray-50",
                  isCollapsed ? "opacity-0" : "opacity-100",
                )}
              >
                <Link href="/admin">
                  Admin Paneli
                </Link>
              </span>
            </div>
          </div>
          <nav
            aria-label="core navigation links"
            className="flex flex-1 flex-col space-y-10"
          >
            <div>
            
              <ul role="list" className="mt-1 space-y-2">
                {adminNavigation.map((item) => (
                  <li key={item.name}>
                    {isCollapsed ? (
                      <Tooltip
                        side="right"
                        content={item.name}
                        sideOffset={6}
                        showArrow={false}
                        className="z-[999]"
                      >
                        <Link
                          href={item.href}
                          className={cx(
                            isActive(item.href)
                              ? "text-blue-600 dark:text-blue-500"
                              : "text-gray-700 dark:text-gray-300",
                            "inline-flex items-center rounded-md p-2 text-sm font-medium transition-colors hover:bg-gray-200/50 hover:dark:bg-gray-900",
                            focusRing,
                          )}
                        >
                          <item.icon
                            className="size-5 shrink-0"
                            aria-hidden="true"
                          />
                          {/* {item.name} */}
                        </Link>
                      </Tooltip>
                    ) : (
                      <Link
                        href={item.href}
                        className={cx(
                          isActive(item.href)
                            ? "text-blue-600 dark:text-blue-500"
                            : "text-gray-700 dark:text-gray-300",
                          "flex items-center gap-x-2.5 rounded-md p-2 text-sm font-medium transition-colors hover:bg-gray-200/50 hover:dark:bg-gray-900",
                          focusRing,
                        )}
                      >
                        <item.icon
                          className="size-5 shrink-0"
                          aria-hidden="true"
                        />
                        {item.name} 
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <span
                aria-hidden={isCollapsed}
                className={cx(
                  "block h-6 text-xs font-medium leading-6 text-gray-500 transition-opacity dark:text-gray-500",
                  isCollapsed ? "opacity-0" : "opacity-100",
                )}
              >
             
              </span>
              <ul role="list" className="mt-1 space-y-2">
                <li>
                
                </li>
              </ul>
            </div>
          </nav>
          <div className="mt-auto border-t border-gray-200 pt-3 dark:border-gray-800">
            <UserProfileDesktop isCollapsed={isCollapsed} />
          </div>
        </aside>
      </nav>
      {/* top navbar (xs-lg) */}
      <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm sm:px-6 lg:hidden dark:border-gray-800 dark:bg-gray-950">
        <span
          className={cx(
            "font-semibold text-gray-900 sm:text-sm dark:text-gray-50",
            isCollapsed ? "opacity-0" : "opacity-100",
          )}
        >
          <Link aria-label="Home Link" href="/">
        Admin Paneli
          </Link>
        </span>
        <div className="flex items-center gap-1 sm:gap-2">
          <UserProfileMobile />
          <MobileSidebar />
        </div>
      </div>
    </>
  )
}

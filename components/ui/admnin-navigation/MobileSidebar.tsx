import { siteConfig } from "@/app/siteConfig"
import { Button } from "@/components/Button"
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/Drawer"
import { cx, focusRing } from "@/lib/utils"
import { RiCalendarEventLine, RiDashboard2Line, RiFileTextLine, RiShieldUserLine, RiUserSearchLine } from "@remixicon/react"

import { BarChartBig, Compass, Menu, Settings2,} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"


const adminNavigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: RiDashboard2Line },
  { name: "Başvurular", href: "/admin/applicants", icon: RiUserSearchLine

   },
  { name: "Belgeler", href: "/admin/documents", icon: RiFileTextLine },
  { name: "Mülakatlar", href: "/admin/interviews", icon: RiCalendarEventLine },
  { name: "Bursiyer Durumu", href: "/admin/bursiyer-status", icon: RiShieldUserLine },
  // { name: "Raporlar", href: "/admin/reports", icon: RiBarChartBoxLine },
  { 
    name: "Ayarlar", 
    href: "/admin/settings", 
    Settings2,
    subItems: [
      { name: "Kullanıcılar", href: "/admin/settings/users" },
      { name: "Denetim", href: "/admin/settings/audit" },
      // { name: "Fatura", href: "/admin/settings/billing" },
    ]
  },
] as const
export default function MobileSidebar() {
  const pathname = usePathname()
  const isActive = (itemHref: string) => {
    return pathname === itemHref || pathname.startsWith(itemHref)
  }

  const isSubActive = (mainHref: string, subHref: string) => {
    return pathname.startsWith(mainHref) && pathname.includes(subHref)
  }
  
  return (
    <>
      <Drawer>
        <DrawerTrigger asChild>
          <Button
            variant="ghost"
            aria-label="open sidebar"
            className="group flex items-center rounded-md p-1.5 text-sm font-medium hover:bg-gray-100 data-[state=open]:bg-gray-100 data-[state=open]:bg-gray-400/10 hover:dark:bg-gray-400/10"
          >
            <Menu className="size-6 shrink-0 text-gray-600 dark:text-gray-400" aria-hidden="true" />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="sm:max-w-lg">
          <DrawerHeader>
            <DrawerTitle>Admin Paneli</DrawerTitle>
          </DrawerHeader>
          <DrawerBody>
            <nav
              aria-label="core mobile navigation links"
              className="flex flex-1 flex-col space-y-10"
            >
              <div>
                <span
                  className={cx(
                    "block h-6 text-xs font-medium leading-6 text-gray-500 transition-opacity dark:text-gray-400",
                  )}
                >
                 Admin Paneli yönetimi
                </span>
                <ul role="list" className="mt-1 space-y-1.5">
                  {adminNavigation.map((item) => (
                    <li key={item.name}>
                      <DrawerClose asChild>
                        <Link
                          href={item.href}
                          className={cx(
                            isActive(item.href)
                              ? "text-blue-600 dark:text-blue-500"
                              : "text-gray-600 hover:text-gray-900 dark:text-gray-400 hover:dark:text-gray-50",
                            "flex items-center gap-x-2.5 rounded-md px-2 py-1.5 text-base font-medium transition hover:bg-gray-100 sm:text-sm hover:dark:bg-gray-900",
                            focusRing,
                          )}
                        >
                          <item.icon
                            className="size-5 shrink-0"
                            aria-hidden="true"
                          />
                          {item.name}
                        </Link>
                      </DrawerClose>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <span
                  className={cx(
                    "block h-6 text-xs font-medium leading-6 text-gray-500 transition-opacity dark:text-gray-400",
                  )}
                >
                  Diğer
                </span>
                <ul role="list" className="mt-1 space-y-1.5">
                  <li>
                    <Link
                      href="/admin/settings"
                      className={cx(
                        isActive("/admin/settings ")
                          ? "text-blue-600 dark:text-blue-500"
                          : "text-gray-600 hover:text-gray-900 dark:text-gray-400 hover:dark:text-gray-50",
                        "flex items-center gap-x-2.5 rounded-md px-2 py-1.5 text-base font-medium transition hover:bg-gray-100 sm:text-sm hover:dark:bg-gray-900",
                        focusRing,
                      )}
                    >
                      <Compass className="size-5 shrink-0" aria-hidden="true" />
                      Ayarlar
                    </Link>
                  </li>
                </ul>
              </div>
            </nav>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}

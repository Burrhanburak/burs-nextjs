"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { siteConfig } from "@/lib/siteConfig"

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const navigationSettings = [
    { name: "Denetim", href: siteConfig.baseLinks.settings.audit },
    { name: "Bursiyer Bilgileri", href: siteConfig.baseLinks.settings.bursiyer },
    { name: "Kullanıcılar", href: siteConfig.baseLinks.settings.users },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button
          variant="outline"
          size="sm"
          className="gap-1"
          asChild
        >
          <Link href="/admin/dashboard">
            <ArrowLeft className="h-4 w-4" />
            <span>Geri Dön</span>
          </Link>
        </Button>
      </div>

      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="lg:w-1/5">
          <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
            {navigationSettings.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground lg:justify-start",
                  pathname === item.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  )
}

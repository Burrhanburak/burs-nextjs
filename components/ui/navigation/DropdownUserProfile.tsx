"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSubMenu,
  DropdownMenuSubMenuContent,
  DropdownMenuSubMenuTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/Dropdown"
import {
  RiComputerLine,
  RiMoonLine,
  RiSunLine,
  RiUser3Line,
  RiLogoutBoxLine,
  RiSettings4Line
} from "@remixicon/react"
import { useTheme } from "next-themes"
import * as React from "react"

interface UserData {
  name?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

export type DropdownUserProfileProps = {
  children: React.ReactNode;
  align?: "center" | "start" | "end";
  userData: UserData;
}

export function DropdownUserProfile({
  children,
  align = "start",
  userData
}: DropdownUserProfileProps) {
  const [mounted, setMounted] = React.useState(false)
  const { theme, setTheme } = useTheme()
  React.useEffect(() => {
    setMounted(true)
  }, [])

  const email = userData?.email || "kullanici@example.com";

  if (!mounted) {
    return null
  }
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent align={align}>
          <DropdownMenuLabel>{email}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <div className="flex w-full items-center" onClick={() => window.location.href = "/profile"}>
                <RiUser3Line className="mr-2 h-4 w-4" />
                Profil
              </div>
            </DropdownMenuItem>
            <DropdownMenuSubMenu>
              <DropdownMenuSubMenuTrigger>
                <div className="flex items-center">
                  <RiSettings4Line className="mr-2 h-4 w-4" />
                  Görünüm
                </div>
              </DropdownMenuSubMenuTrigger>
              <DropdownMenuSubMenuContent>
                <DropdownMenuRadioGroup
                  value={theme}
                  onValueChange={(value) => {
                    setTheme(value)
                  }}
                >
                  <DropdownMenuRadioItem
                    aria-label="Işık Modu"
                    value="light"
                    iconType="check"
                  >
                    <RiSunLine className="size-4 shrink-0" aria-hidden="true" />
                    Işık
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem
                    aria-label="Karanlık Modu"
                    value="dark"
                    iconType="check"
                  >
                    <RiMoonLine
                      className="size-4 shrink-0"
                      aria-hidden="true"
                    />
                    Karanlık
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem
                    aria-label="Sistem Modu"
                    value="system"
                    iconType="check"
                  >
                    <RiComputerLine
                      className="size-4 shrink-0"
                      aria-hidden="true"
                    />
                    Sistem
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubMenuContent>
            </DropdownMenuSubMenu>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <div className="flex w-full items-center text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400" onClick={() => window.location.href = "/auth/login"}>
                <RiLogoutBoxLine className="mr-2 h-4 w-4" />
                Çıkış Yap
              </div>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

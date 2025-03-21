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
} from "@/components/ui/user-navigation/Dropdown"
import {
  RiComputerLine,
  RiLogoutBoxLine,
  RiMoonLine,
  RiSunLine,
  RiUser3Line,
} from "@remixicon/react"
import { useTheme } from "next-themes"
import * as React from "react"
import { signOut } from "next-auth/react"

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

  const handleSignOut = async () => {
    try {
      await signOut({ 
        callbackUrl: '/auth/login',
        redirect: true
      });
    } catch (error) {
      console.error("Logout error:", error);
      // Fallback manual redirect
      window.location.href = '/auth/login';
    }
  };
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent align={align}>
          <DropdownMenuLabel>{email}</DropdownMenuLabel>
          <DropdownMenuGroup>
          <DropdownMenuItem>
              <div className="flex w-full items-center" onClick={() => window.location.href = "/profile"}>
                <RiUser3Line className="mr-2 h-4 w-4" />
                Profil
              </div>
            </DropdownMenuItem>
            <DropdownMenuSubMenu>
              <DropdownMenuSubMenuTrigger>Görünüm</DropdownMenuSubMenuTrigger>
              <DropdownMenuSubMenuContent>
                <DropdownMenuRadioGroup
                  value={theme}
                  onValueChange={(value) => {
                    setTheme(value)
                  }}
                >
                  <DropdownMenuRadioItem
                    aria-label="Switch to Light Mode"
                    value="light"
                    iconType="check"
                  >
                    <RiSunLine className="size-4 shrink-0" aria-hidden="true" />
                    Light
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem
                    aria-label="Switch to Dark Mode"
                    value="dark"
                    iconType="check"
                  >
                    <RiMoonLine
                      className="size-4 shrink-0"
                      aria-hidden="true"
                    />
                    Dark
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem
                    aria-label="Switch to System Mode"
                    value="system"
                    iconType="check"
                  >
                    <RiComputerLine
                      className="size-4 shrink-0"
                      aria-hidden="true"
                    />
                    System
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubMenuContent>
            </DropdownMenuSubMenu>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
         
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <div className="flex w-full items-center text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400" onClick={handleSignOut}>
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

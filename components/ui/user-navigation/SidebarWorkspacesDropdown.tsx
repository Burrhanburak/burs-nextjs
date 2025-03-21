"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/user-navigation/Dropdown"
import { cx, focusInput } from "@/lib/utils"
import { RiArrowRightSLine, RiExpandUpDownLine, RiLogoutBoxLine, RiUserSettingsLine } from "@remixicon/react"
import React, { useEffect, useState } from "react"
import { signOut } from "next-auth/react"

interface UserData {
  name?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

export const WorkspacesDropdownDesktop = () => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false)
  const focusRef = React.useRef<null | HTMLButtonElement>(null)
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    
    fetch('/api/users/me', { 
      signal: controller.signal,
      cache: 'no-store',
      next: { revalidate: 0 } // Next.js 15 approach
    })
      .then(response => response.ok ? response.json() : null)
      .then(data => {
        if (data) setUserData(data);
      })
      .catch(error => {
        if (error.name !== 'AbortError') {
          console.error('Error fetching user data:', error);
        }
      });
    
    return () => controller.abort();
  }, []);

  // Don't render anything if no data is available
  if (!userData) {
    return null;
  }

  // Get initials from name
  const getInitials = () => {
    if (userData.name) {
      return userData.name
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    } else if (userData.firstName && userData.lastName) {
      return `${userData.firstName[0]}${userData.lastName[0]}`.toUpperCase();
    }
    return '';
  };

  const displayName = userData.name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
  const role = userData.role === 'ADMIN' ? 'Yönetici' : 'Bursiyer';

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/auth/login' });
  };

  return (
    <>
      {/* sidebar (lg+) */}
      <DropdownMenu
        open={dropdownOpen}
        onOpenChange={setDropdownOpen}
        modal={false}
      >
        <DropdownMenuTrigger asChild>
          <button
            className={cx(
              "flex w-full items-center gap-x-2.5 rounded-md border border-gray-300 bg-white p-2 text-sm shadow-sm transition-all hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-950 hover:dark:bg-gray-900",
              focusInput,
            )}
          >
            <span
              className="flex aspect-square size-8 items-center justify-center rounded bg-indigo-600 p-2 text-xs font-medium text-white dark:bg-indigo-500"
              aria-hidden="true"
            >
              {getInitials()}
            </span>
            <div className="flex w-full items-center justify-between gap-x-4 truncate">
              <div className="truncate">
                <p className="truncate whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-50">
                {displayName}
                </p>
                <p className="whitespace-nowrap text-left text-xs text-gray-700 dark:text-gray-300">
                {role}
                </p>
              </div>
              <RiExpandUpDownLine
                className="size-5 shrink-0 text-gray-500"
                aria-hidden="true"
              />
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          onCloseAutoFocus={(event) => {
            if (focusRef.current) {
              focusRef.current.focus()
              focusRef.current = null
              event.preventDefault()
            }
          }}
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel>
             Profil Bilgileri
            </DropdownMenuLabel>
            <DropdownMenuItem>
              <div className="flex w-full items-center gap-x-2.5">
                <span
                  className="flex aspect-square size-8 items-center justify-center rounded bg-indigo-600 p-2 text-xs font-medium text-white dark:bg-indigo-500"
                  aria-hidden="true"
                >
                  {getInitials()}
                </span>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
                    {displayName}
                  </p>
                  <p className="text-xs text-gray-700 dark:text-gray-400">
                    {role}
                  </p>
                </div>
              </div>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => window.location.href = "/profile"}>
            <div className="flex items-center">
              <RiUserSettingsLine className="mr-2 h-4 w-4" />
              Profili Düzenle
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout}>
            <div className="flex items-center text-red-600">
              <RiLogoutBoxLine className="mr-2 h-4 w-4" />
              Çıkış Yap
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

export const WorkspacesDropdownMobile = () => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false)
  const focusRef = React.useRef<null | HTMLButtonElement>(null)
  const [userData, setUserData] = useState<UserData | null>(null);
  
  useEffect(() => {
    const controller = new AbortController();
    
    fetch('/api/users/me', { 
      signal: controller.signal,
      cache: 'no-store',
      next: { revalidate: 0 } // Next.js 15 approach
    })
      .then(response => response.ok ? response.json() : null)
      .then(data => {
        if (data) setUserData(data);
      })
      .catch(error => {
        if (error.name !== 'AbortError') {
          console.error('Error fetching user data:', error);
        }
      });
    
    return () => controller.abort();
  }, []);

  // Don't render anything if no data is available
  if (!userData) {
    return null;
  }

  // Get initials from name
  const getInitials = () => {
    if (userData.name) {
      return userData.name
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    } else if (userData.firstName && userData.lastName) {
      return `${userData.firstName[0]}${userData.lastName[0]}`.toUpperCase();
    }
    return '';
  };

  const displayName = userData.name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
  const role = userData.role === 'ADMIN' ? 'Yönetici' : 'Bursiyer';

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/auth/login' });
  };

  return (
    <>
      {/* sidebar (xs-lg) */}
      <DropdownMenu
        open={dropdownOpen}
        onOpenChange={setDropdownOpen}
        modal={false}
      >
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-x-1.5 rounded-md p-2 hover:bg-gray-100 focus:outline-none hover:dark:bg-gray-900">
            <span
              className={cx(
                "flex aspect-square size-7 items-center justify-center rounded bg-indigo-600 p-2 text-xs font-medium text-white dark:bg-indigo-500",
              )}
              aria-hidden="true"
            >
              {getInitials()}
            </span>
            <RiArrowRightSLine
              className="size-4 shrink-0 text-gray-500"
              aria-hidden="true"
            />
            <div className="flex w-full items-center justify-between gap-x-3 truncate">
              <p className="truncate whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-50">
              {displayName}
              </p>
              <RiExpandUpDownLine
                className="size-4 shrink-0 text-gray-500"
                aria-hidden="true"
              />
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="!min-w-72"
          onCloseAutoFocus={(event) => {
            if (focusRef.current) {
              focusRef.current.focus()
              focusRef.current = null
              event.preventDefault()
            }
          }}
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel>
            Profil Bilgileri
            </DropdownMenuLabel>
         
              <DropdownMenuItem >
                <div className="flex w-full items-center gap-x-2.5">
                  <span
                    className={cx(
                      "flex size-8 items-center justify-center rounded bg-indigo-600 p-2 text-xs font-medium text-white dark:bg-indigo-500",
                    )}
                    aria-hidden="true"
                  >
                    {getInitials()}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
                    {displayName}
                    </p>
                    <p className="text-xs text-gray-700 dark:text-gray-300">
                    {role}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
      
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => window.location.href = "/profile"}>
          <div className="flex items-center">
            <RiUserSettingsLine className="mr-2 h-4 w-4" />
            Profili Düzenle
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout}>
          <div className="flex items-center text-red-600">
            <RiLogoutBoxLine className="mr-2 h-4 w-4" />
            Çıkış Yap
          </div>
        </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

"use client"

import { Button } from "@/components/Button"
import { cx, focusRing } from "@/lib/utils"
import { ChevronsUpDown, User } from "lucide-react"

import { DropdownUserProfile } from "./DropdownUserProfile"
import { useEffect, useState } from "react"


interface AdminData {
  name?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

interface UserProfileDesktopProps {
  isCollapsed?: boolean
}

export const UserProfileDesktop = ({
  isCollapsed,
}: UserProfileDesktopProps) => {
  const [adminData, setadminData] = useState<AdminData | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    
    fetch('/api/users/me', { 
      signal: controller.signal,
      cache: 'no-store',
      next: { revalidate: 0 } // Next.js 15 approach
    })
      .then(response => response.ok ? response.json() : null)
      .then(data => {
        if (data) setadminData(data);
      })
      .catch(error => {
        if (error.name !== 'AbortError') {
          console.error('Error fetching user data:', error);
        }
      });
    
    return () => controller.abort();
  }, []);

  // Don't render anything if no data is available
  if (!adminData) {
    return null;
  }

  // Get initials from name or first/last name
  const getInitials = () => {
    if (adminData.name) {
      return adminData.name
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    } else if (adminData.firstName && adminData.lastName) {
      return `${adminData.firstName[0]}${adminData.lastName[0]}`.toUpperCase();
    }
    return '';
  };

  const displayName = adminData.name || `${adminData.firstName || ''} ${adminData.lastName || ''}`.trim();

  return (
    <DropdownUserProfile adminData={adminData}>
      <Button
        aria-label="User settings"
        variant="ghost"
        className={cx(
          isCollapsed ? "justify-center" : "justify-between",
          focusRing,
          "group flex w-full items-center rounded-md px-1 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200/50 data-[state=open]:bg-gray-200/50 hover:dark:bg-gray-800/50 data-[state=open]:dark:bg-gray-900",
        )}
      >
        {isCollapsed ? (
          // h-8 to avoid layout shift with icon shown in isCollapsibled == false
          <div className="flex h-8 items-center">
            <User
              className="size-5 shrink-0 text-gray-500 group-hover:text-gray-700 dark:text-gray-500 group-hover:dark:text-gray-300"
              aria-hidden="true"
            />
          </div>
        ) : (
          <span className="flex items-center gap-3">
            <span
              className={cx(
                isCollapsed ? "size-5" : "size-8",
                "flex shrink-0 items-center justify-center rounded-full border border-gray-300 bg-white text-xs text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300",
              )}
              aria-hidden="true"
            >
               {getInitials()}
            </span>
            <span className={cx(isCollapsed ? "hidden" : "block")}>
            <span>{displayName}</span>
            </span>
          </span>
        )}
        {!isCollapsed && (
          <ChevronsUpDown
            className="size-4 shrink-0 text-gray-500 group-hover:text-gray-700 group-hover:dark:text-gray-400"
            aria-hidden="true"
          />
        )}
      </Button>
    </DropdownUserProfile>
  )
}

export const UserProfileMobile = () => {
  const [adminData, setadminData] = useState<AdminData | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    
    fetch('/api/users/me', { 
      signal: controller.signal,
      cache: 'no-store',
      next: { revalidate: 0 } // Next.js 15 approach
    })
      .then(response => response.ok ? response.json() : null)
      .then(data => {
        if (data) setadminData(data);
      })
      .catch(error => {
        if (error.name !== 'AbortError') {
          console.error('Error fetching user data:', error);
        }
      });
    
    return () => controller.abort();
  }, []);

  // Don't render anything if no data is available
  if (!adminData) {
    return null;
  }

  // Get initials from name or first/last name
  const getInitials = () => {
    if (adminData.name) {
      return adminData.name
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    } else if (adminData.firstName && adminData.lastName) {
      return `${adminData.firstName[0]}${adminData.lastName[0]}`.toUpperCase();
    }
    return '';
  };


  return (
    <DropdownUserProfile align="end" adminData={adminData}>
      <Button
        aria-label="User settings"
        variant="ghost"
        className={cx(
          "group flex items-center rounded-md p-0.5 sm:p-1 text-sm font-medium text-gray-900 hover:bg-gray-200/50 data-[state=open]:bg-gray-200/50 hover:dark:bg-gray-800/50 data-[state=open]:dark:bg-gray-800/50",
        )}
      >
        <span
          className="flex size-8 sm:size-7 shrink-0 items-center justify-center rounded-full border border-gray-300 bg-white text-xs text-gray-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300"
          aria-hidden="true"
        >
         {getInitials()}
        </span>
      </Button>
    </DropdownUserProfile>
  )
}

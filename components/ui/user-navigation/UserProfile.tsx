"use client"

import { Button } from "@/components/Button"
import { cx, focusRing } from "@/lib/utils"
import { RiMore2Fill } from "@remixicon/react"

import { DropdownUserProfile } from "./DropdownUserProfile"
import { useEffect, useState } from "react"


interface UserData {
  name?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

export const UserProfileDesktop = () => {
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

  // Get initials from name or first/last name
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

  return (
    <DropdownUserProfile userData={userData}>
      <Button
        aria-label="User settings"
        variant="ghost"
        className={cx(
          focusRing,
          "group flex w-full items-center justify-between rounded-md p-2 text-sm font-medium text-gray-900 hover:bg-gray-100 data-[state=open]:bg-gray-100 data-[state=open]:bg-gray-400/10 hover:dark:bg-gray-400/10",
        )}
      >
        <span className="flex items-center gap-3">
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-full border border-gray-300 bg-white text-xs text-gray-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300"
            aria-hidden="true"
          >
            {getInitials()}
          </span>
          <span>{displayName}</span>
        </span>
        <RiMore2Fill
          className="size-4 shrink-0 text-gray-500 group-hover:text-gray-700 group-hover:dark:text-gray-400"
          aria-hidden="true"
        />
      </Button>
    </DropdownUserProfile>
  )
}

export const UserProfileMobile = () => {
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

  // Get initials from name or first/last name
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
  
  return (
    <DropdownUserProfile align="end" userData={userData}>
      <Button
        aria-label="User settings"
        variant="ghost"
        className={cx(
          "group flex items-center rounded-md p-1 text-sm font-medium text-gray-900 hover:bg-gray-100 data-[state=open]:bg-gray-100 data-[state=open]:bg-gray-400/10 hover:dark:bg-gray-400/10",
        )}
      >
        <span
          className="flex size-7 shrink-0 items-center justify-center rounded-full border border-gray-300 bg-white text-xs text-gray-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300"
          aria-hidden="true"
        >
         {getInitials()}
        </span>
      </Button>
    </DropdownUserProfile>
  )
}

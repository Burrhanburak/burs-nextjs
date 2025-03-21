"use client"

import { Button } from "@/components/Button"
import { cx, focusRing } from "@/lib/utils"
import { RiMore2Fill } from "@remixicon/react"
import { useEffect, useState } from "react"
import { DropdownUserProfile } from "./DropdownUserProfile"

interface UserData {
  name?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

interface UserProfileDesktopProps {
  isCollapsed: boolean
}

export const UserProfileDesktop = ({ isCollapsed }: UserProfileDesktopProps) => {
  const [userData, setUserData] = useState<UserData>({
    name: "Ahmet Yılmaz",
    email: "ahmet.yilmaz@example.com",
    firstName: "Ahmet",
    lastName: "Yılmaz",
  });

  useEffect(() => {
    // Fetch user data when component mounts
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/users/me');
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        } else {
          console.error('Failed to fetch user data');
          // Already using default mock data from initial state
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Already using default mock data from initial state
      }
    };

    fetchUserData();
  }, []);

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
    return 'KL'; // Default fallback
  };

  const displayName = userData.name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim();

  return (
    <DropdownUserProfile userData={userData}>
      <Button
        aria-label="Kullanıcı ayarları"
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
          {!isCollapsed && <span>{displayName}</span>}
        </span>
        {!isCollapsed && (
          <RiMore2Fill
            className="size-4 shrink-0 text-gray-500 group-hover:text-gray-700 group-hover:dark:text-gray-400"
            aria-hidden="true"
          />
        )}
      </Button>
    </DropdownUserProfile>
  )
}

export const UserProfileMobile = () => {
  const [userData, setUserData] = useState<UserData>({
    name: "Ahmet Yılmaz",
    email: "ahmet.yilmaz@example.com",
    firstName: "Ahmet",
    lastName: "Yılmaz",
  });

  useEffect(() => {
    // Fetch user data when component mounts
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/users/me');
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        } else {
          console.error('Failed to fetch user data');
          // Already using default mock data from initial state
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Already using default mock data from initial state
      }
    };

    fetchUserData();
  }, []);

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
    return 'KL'; // Default fallback
  };

  return (
    <DropdownUserProfile userData={userData} align="end">
      <Button
        aria-label="Kullanıcı ayarları"
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

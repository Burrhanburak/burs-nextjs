"use client"

import { useState } from "react"
import { Sidebar } from "./Sidebar"

export function SidebarWrapper() {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev)
  }

  return <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
} 
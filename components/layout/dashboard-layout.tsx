"use client"

import React, { useState, createContext, useContext } from "react"
import { Sidebar } from './sidebar'

interface SidebarContextType {
  isOpen: boolean
  toggle: () => void
  close: () => void
}

const SidebarContext = createContext<SidebarContextType>({
  isOpen: false,
  toggle: () => {},
  close: () => {}
})

export const useSidebar = () => useContext(SidebarContext)

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const contextValue = {
    isOpen: sidebarOpen,
    toggle: () => setSidebarOpen(!sidebarOpen),
    close: () => setSidebarOpen(false)
  }

  return (
    <SidebarContext.Provider value={contextValue}>
      <div className="flex min-h-screen overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-[#f6f7f8] dark:bg-[#14181e] w-full">
          {children}
        </main>
      </div>
    </SidebarContext.Provider>
  )
}

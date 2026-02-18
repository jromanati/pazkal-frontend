"use client"

import React from "react"

interface HeaderProps {
  icon?: string
  title?: string
  subtitle?: string
  showVersion?: boolean
  children?: React.ReactNode
  onMenuClick?: () => void
}

export function Header({ 
  icon, 
  title, 
  subtitle,
  showVersion = true,
  children,
  onMenuClick
}: HeaderProps) {
  return (
    <header className="h-14 lg:h-16 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#14181e]/50 backdrop-blur-md px-4 lg:px-8 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-2 lg:gap-3 text-[#2c528c] min-w-0">
        {/* Botón hamburguesa móvil */}
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-1.5 -ml-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <span className="material-symbols-outlined text-slate-600 dark:text-gray-300">menu</span>
        </button>
        
        {icon && <span className="material-symbols-outlined hidden sm:block">{icon}</span>}
        {title && (
          <div className="flex items-center gap-1 lg:gap-2 min-w-0">
            <h2 className="font-semibold text-slate-800 dark:text-gray-100 text-sm lg:text-base truncate">{title}</h2>
            {subtitle && (
              <>
                <span className="material-symbols-outlined text-xs lg:text-sm text-gray-400 hidden sm:block">chevron_right</span>
                <span className="text-xs lg:text-sm font-bold text-[#2c528c] truncate hidden sm:block">{subtitle}</span>
              </>
            )}
          </div>
        )}
        {children}
      </div>
    </header>
  )
}

"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { AuthService } from '@/services/auth.service'
import { canView, getCurrentUserFromStorage, type Section } from '@/lib/permissions'

interface NavItem {
  href: string
  icon: string
  label: string
  disabled?: boolean
}

const navItems: NavItem[] = [
  { href: '/inicio', icon: 'home', label: 'Inicio' },
  { href: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { href: '/empresas', icon: 'corporate_fare', label: 'Empresas' },
  { href: '/operadores', icon: 'engineering', label: 'Operadores' },
  { href: '/ordenes-vuelo', icon: 'assignment', label: 'Órdenes de vuelo' },
  { href: '/bitacora-vuelo', icon: 'menu_book', label: 'Bitácora de vuelo' },
  { href: '/reportes', icon: 'analytics', label: 'Reportes', disabled: true },
  { href: '/usuarios', icon: 'manage_accounts', label: 'Usuarios' },
  { href: '/perfil', icon: 'account_circle', label: 'Mi perfil' },
]

const sectionByHref: Partial<Record<string, Section>> = {
  '/inicio': 'dashboard',
  '/dashboard': 'dashboard',
  '/empresas': 'empresas',
  '/operadores': 'operadores',
  '/ordenes-vuelo': 'ordenes_vuelo',
  '/bitacora-vuelo': 'bitacora_vuelo',
  '/usuarios': 'usuarios',
}

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<ReturnType<typeof getCurrentUserFromStorage>>(null)

  useEffect(() => {
    setMounted(true)
    setUser(getCurrentUserFromStorage())
  }, [])

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  const handleLogout = async () => {
    try {
      await AuthService.logout()
    } finally {
      onClose()
      router.push('/')
    }
  }

  const handleNavClick = () => {
    // Cerrar sidebar en móvil al navegar
    if (window.innerWidth < 1024) {
      onClose()
    }
  }

  return (
    <>
      {/* Backdrop para móvil */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-[#36454F] text-white flex-shrink-0 flex flex-col shadow-xl
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-4 lg:p-6 flex items-center gap-3">
          <div className="size-10 rounded-lg bg-[#2c528c] flex items-center justify-center shadow-inner">
            <span className="material-symbols-outlined text-white text-2xl">flight_takeoff</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold tracking-wider leading-none">PAZKAL</h1>
            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">Aviation Mgmt</span>
          </div>
          {/* Botón cerrar en móvil */}
          <button 
            onClick={onClose}
            className="lg:hidden ml-auto p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-4 lg:mt-6 flex-1 px-3 lg:px-4 space-y-1 lg:space-y-2 overflow-y-auto">
          {(mounted
            ? navItems.filter((item) => {
              const section = sectionByHref[item.href]
              if (!section) return true
              return canView(section)
            })
            : navItems
          )
            .map((item) => (
            item.disabled ? (
              <div
                key={item.href}
                className="flex items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg text-gray-500 cursor-not-allowed opacity-50"
              >
                <span className="material-symbols-outlined text-[20px] lg:text-[22px]">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNavClick}
                className={`flex items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-[#2c528c] text-white shadow-lg'
                    : 'hover:bg-white/10'
                }`}
              >
                <span className="material-symbols-outlined text-[20px] lg:text-[22px]">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            )
          ))}
        </nav>

        {/* Logout button */}
        <div className="px-3 lg:px-4 pb-3 lg:pb-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px] lg:text-[22px]">logout</span>
            <span className="text-sm font-medium">Cerrar sesión</span>
          </button>
        </div>

        {/* User info */}
        <div className="p-4 lg:p-6 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-full bg-gray-600 overflow-hidden flex-shrink-0 flex items-center justify-center">
              {user && (user as any).avatar ? (
                <img
                  alt="User profile portrait"
                  className="w-full h-full object-cover"
                  src={(user as any).avatar || "/placeholder.svg"}
                />
              ) : (
                <span className="text-[10px] font-bold text-white">
                  {String((user as any)?.first_name ?? 'U').slice(0, 1)}{String((user as any)?.last_name ?? '').slice(0, 1)}
                </span>
              )}
            </div>
            <div className="flex flex-col overflow-hidden min-w-0">
              <p className="text-xs font-semibold truncate">
                {user
                  ? `${String((user as any)?.first_name ?? '').trim()} ${String((user as any)?.last_name ?? '').trim()}`.trim() || String((user as any)?.email ?? '')
                  : ''}
              </p>
              <p className="text-[10px] text-gray-400 truncate uppercase">
                {user
                  ? String((user as any)?.groups?.[0]?.name ?? (user as any)?.group_name ?? (user as any)?.group ?? '')
                  : ''}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

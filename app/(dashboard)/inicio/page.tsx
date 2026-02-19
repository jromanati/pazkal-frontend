"use client"

import { useEffect, useMemo, useState } from 'react'
import { Header } from '@/components/layout/header'
import { useSidebar } from '@/components/layout/dashboard-layout'
import { canAction, canView, getCurrentRole, getCurrentUserFromStorage } from '@/lib/permissions'

type MenuHint = {
  sectionKey: Parameters<typeof canView>[0]
  title: string
  href: string
}

const menuHints: MenuHint[] = [
  { sectionKey: 'empresas', title: 'Empresas', href: '/empresas' },
  { sectionKey: 'operadores', title: 'Operadores', href: '/operadores' },
  { sectionKey: 'ordenes_vuelo', title: 'Órdenes de vuelo', href: '/ordenes-vuelo' },
  { sectionKey: 'bitacora_vuelo', title: 'Bitácora de vuelo', href: '/bitacora-vuelo' },
  { sectionKey: 'usuarios', title: 'Usuarios', href: '/usuarios' },
]

function getSectionVerb(section: MenuHint['sectionKey']): string {
  const canCreate = canAction(section, 'create')
  const canUpdate = canAction(section, 'update')
  const canDelete = canAction(section, 'delete')

  if (canCreate && canUpdate && canDelete) return 'crear, editar y eliminar'
  if (canCreate && canUpdate) return 'crear y editar'
  if (canCreate) return 'crear'
  if (canUpdate) return 'editar'
  return 'ver'
}

export default function InicioPage() {
  const { toggle } = useSidebar()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const user = useMemo(() => (mounted ? getCurrentUserFromStorage() : null), [mounted])
  const role = useMemo(() => (mounted ? getCurrentRole() : null), [mounted])

  const displayName = useMemo(() => {
    const first = String((user as any)?.first_name ?? '').trim()
    const last = String((user as any)?.last_name ?? '').trim()
    return `${first} ${last}`.trim() || String((user as any)?.email ?? '').trim() || 'Usuario'
  }, [user])

  const displayGroup = useMemo(() => {
    return String((user as any)?.groups?.[0]?.name ?? (user as any)?.group_name ?? (user as any)?.group ?? role ?? '').trim()
  }, [role, user])

  const allowed = useMemo(() => {
    if (!mounted) return [] as Array<MenuHint & { verb: string }>
    return menuHints
      .filter((i) => canView(i.sectionKey))
      .map((i) => ({ ...i, verb: getSectionVerb(i.sectionKey) }))
  }, [mounted])

  return (
    <>
      <Header icon="home" title="Inicio" onMenuClick={toggle} />

      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative min-h-[calc(100vh-3.5rem)] lg:min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center">
          <div className="mb-6 sm:mb-8 flex flex-col items-center">
            <div className="size-20 sm:size-24 lg:size-32 rounded-2xl bg-[#2c528c] flex items-center justify-center shadow-2xl mb-4 sm:mb-6 ring-4 sm:ring-6 lg:ring-8 ring-white dark:ring-gray-800">
              <span className="material-symbols-outlined text-white text-4xl sm:text-5xl lg:text-7xl">flight_takeoff</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-[0.15em] sm:tracking-[0.2em] text-[#36454F] dark:text-white leading-none">
              PAZKAL
            </h2>
            <div className="mt-2 h-1 w-16 sm:w-20 lg:w-24 bg-[#2c528c] rounded-full" />
            <p className="mt-3 sm:mt-4 text-[10px] sm:text-xs lg:text-sm font-medium text-gray-400 uppercase tracking-[0.2em] sm:tracking-[0.3em]">
              Aviation Management System
            </p>
          </div>

          <div className="text-center max-w-sm sm:max-w-md lg:max-w-lg">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-700 dark:text-gray-200 mb-2">
              Bienvenido, {displayName}
            </h3>
            {displayGroup && (
              <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-widest font-bold mb-4">
                {displayGroup}
              </p>
            )}

            <p className="text-gray-500 dark:text-gray-500 text-sm sm:text-base leading-relaxed px-2 sm:px-0">
              Dependiendo de tu rol, en el menú lateral podrás:
            </p>

            <div className="mt-4 text-left bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
              <div className="p-3 sm:p-4 bg-slate-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#2c528c]">info</span>
                <h4 className="font-bold text-slate-700 dark:text-gray-200 text-sm sm:text-base">Tus accesos</h4>
              </div>

              <div className="p-4 sm:p-6">
                {mounted && allowed.length === 0 ? (
                  <p className="text-sm text-gray-500">No tienes secciones disponibles para tu rol.</p>
                ) : (
                  <div className="space-y-2">
                    {allowed.map((i) => (
                      <div key={i.href} className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-base text-[#2c528c] mt-0.5">check_circle</span>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          <strong className="text-slate-700 dark:text-gray-200">{i.title}:</strong> puedes {i.verb}.
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

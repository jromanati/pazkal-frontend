"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { useSidebar } from '@/components/layout/dashboard-layout'
import { ConfirmModal } from '@/components/ui/confirm-modal'
import { useToast } from '@/hooks/use-toast'
import { ordenesVueloMock, type OrdenVuelo } from '@/lib/mock-data'
import { canAction, canView } from '@/lib/permissions'

export default function OrdenesVueloPage() {
  const { toggle } = useSidebar()
  const { toast } = useToast()
  const canRead = canView('ordenes_vuelo')
  const canCreate = canAction('ordenes_vuelo', 'create')
  const canUpdate = canAction('ordenes_vuelo', 'update')
  const canDelete = canAction('ordenes_vuelo', 'delete')
  const [ordenes, setOrdenes] = useState<OrdenVuelo[]>(ordenesVueloMock)
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; orden: OrdenVuelo | null }>({
    open: false,
    orden: null
  })

  const handleDelete = (orden: OrdenVuelo) => {
    setDeleteModal({ open: true, orden })
  }

  const confirmDelete = () => {
    if (deleteModal.orden) {
      const codigoOrden = deleteModal.orden.codigo
      setOrdenes(ordenes.filter(o => o.id !== deleteModal.orden!.id))
      toast({
        title: "Orden eliminada",
        description: `La orden "${codigoOrden}" ha sido eliminada exitosamente.`,
      })
    }
  }

  const getEstadoBadge = (estado: OrdenVuelo['estado']) => {
    const estilos = {
      completado: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      en_vuelo: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      pendiente: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
      cancelado: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
    }
    const etiquetas = {
      completado: 'Completado',
      en_vuelo: 'En Vuelo',
      pendiente: 'Pendiente',
      cancelado: 'Cancelado'
    }
    return (
      <span className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full ${estilos[estado]} text-[9px] sm:text-[10px] font-bold uppercase tracking-wider`}>
        {etiquetas[estado]}
      </span>
    )
  }

  const formatFecha = (fecha: string) => {
    const date = new Date(fecha)
    return date.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  if (!canRead) {
    return (
      <>
        <Header icon="assignment" title="Módulo de Órdenes de Vuelo" onMenuClick={toggle} />
        <div className="p-8 text-center">
          <p className="text-gray-500">No tienes permisos para acceder a esta sección.</p>
        </div>
      </>
    )
  }

  return (
    <>
      <Header icon="assignment" title="Módulo de Órdenes de Vuelo" onMenuClick={toggle} />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-6 lg:mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-gray-100">Órdenes de vuelo</h2>
            <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-1">Planificación y seguimiento de misiones de vuelo activas.</p>
          </div>
          {canCreate && (
            <Link
              href="/ordenes-vuelo/nueva"
              className="bg-[#2c528c] hover:bg-blue-800 text-white text-xs sm:text-sm font-bold px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
            >
              <span className="material-symbols-outlined text-lg sm:text-xl">add</span>
              Nueva Orden
            </Link>
          )}
        </div>

        {/* Tabla - Desktop */}
        <div className="hidden lg:block bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">ID Orden</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Piloto</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Lugar</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Trabajo</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {ordenes.map((orden) => (
                  <tr key={orden.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-[#2c528c]">{orden.codigo}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="size-7 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                          {orden.pilotoIniciales}
                        </div>
                        <span className="text-sm font-medium text-slate-800 dark:text-gray-200">{orden.pilotoNombre}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-gray-400">{formatFecha(orden.fecha)}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-gray-400">{orden.lugar}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-gray-400">{orden.trabajo}</td>
                    <td className="px-6 py-4">{getEstadoBadge(orden.estado)}</td>
                    <td className="px-6 py-4 text-right">
                      {(canUpdate || canDelete) && (
                        <div className="flex items-center justify-end gap-1">
                          {canUpdate && (
                            <Link
                              href={`/ordenes-vuelo/${orden.id}/editar`}
                              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-slate-400 hover:text-[#2c528c] transition-colors"
                            >
                              <span className="material-symbols-outlined text-xl">edit</span>
                            </Link>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(orden)}
                              className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded text-slate-400 hover:text-red-500 transition-colors"
                            >
                              <span className="material-symbols-outlined text-xl">delete</span>
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Paginación */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Mostrando 1 a {ordenes.length} de {ordenes.length} órdenes registradas
            </p>
            <div className="flex gap-1">
              <button className="p-1 rounded border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 transition-colors disabled:opacity-50">
                <span className="material-symbols-outlined text-lg">chevron_left</span>
              </button>
              <button className="px-3 py-1 text-xs font-bold rounded bg-[#2c528c] text-white shadow-sm">1</button>
              <button className="p-1 rounded border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 transition-colors">
                <span className="material-symbols-outlined text-lg">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        {/* Cards - Mobile/Tablet */}
        <div className="lg:hidden space-y-3">
          {ordenes.map((orden) => (
            <div key={orden.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-bold text-[#2c528c]">{orden.codigo}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="size-6 rounded-full bg-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-600">
                      {orden.pilotoIniciales}
                    </div>
                    <span className="text-xs font-medium text-slate-800 dark:text-gray-200">{orden.pilotoNombre}</span>
                  </div>
                </div>
                {getEstadoBadge(orden.estado)}
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                <div>
                  <p className="text-gray-400 uppercase text-[10px] font-semibold">Fecha</p>
                  <p className="text-slate-600 dark:text-gray-300">{formatFecha(orden.fecha)}</p>
                </div>
                <div>
                  <p className="text-gray-400 uppercase text-[10px] font-semibold">Lugar</p>
                  <p className="text-slate-600 dark:text-gray-300 truncate">{orden.lugar}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-400 uppercase text-[10px] font-semibold">Trabajo</p>
                  <p className="text-slate-600 dark:text-gray-300">{orden.trabajo}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                {canUpdate && (
                  <Link
                    href={`/ordenes-vuelo/${orden.id}/editar`}
                    className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium text-[#2c528c] hover:bg-[#2c528c]/5 rounded-lg transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">edit</span>
                    Editar
                  </Link>
                )}
                {canDelete && (
                  <button
                    onClick={() => handleDelete(orden)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                    Eliminar
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Paginación móvil */}
          <div className="flex items-center justify-between pt-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {ordenes.length} órdenes
            </p>
            <div className="flex gap-1">
              <button className="p-1.5 rounded border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 transition-colors">
                <span className="material-symbols-outlined text-base">chevron_left</span>
              </button>
              <button className="px-3 py-1.5 text-xs font-bold rounded bg-[#2c528c] text-white">1</button>
              <button className="p-1.5 rounded border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 transition-colors">
                <span className="material-symbols-outlined text-base">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación */}
      <ConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, orden: null })}
        onConfirm={confirmDelete}
        title="Eliminar orden de vuelo"
        description={`¿Está seguro que desea eliminar la orden "${deleteModal.orden?.codigo}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="danger"
      />
    </>
  )
}

"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { useSidebar } from '@/components/layout/dashboard-layout'
import { ConfirmModal } from '@/components/ui/confirm-modal'
import { useToast } from '@/hooks/use-toast'
import { bitacorasVueloMock, type BitacoraVuelo } from '@/lib/mock-data'
import { canAction, canView } from '@/lib/permissions'

export default function BitacoraVueloPage() {
  const { toggle } = useSidebar()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const canRead = mounted && canView('bitacora_vuelo')
  const canCreate = mounted && canAction('bitacora_vuelo', 'create')
  const canUpdate = mounted && canAction('bitacora_vuelo', 'update')
  const canDelete = mounted && canAction('bitacora_vuelo', 'delete')
  const [bitacoras, setBitacoras] = useState<BitacoraVuelo[]>(bitacorasVueloMock)
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; bitacora: BitacoraVuelo | null }>({
    open: false,
    bitacora: null
  })

  const handleDelete = (bitacora: BitacoraVuelo) => {
    setDeleteModal({ open: true, bitacora })
  }

  const confirmDelete = () => {
    if (deleteModal.bitacora) {
      const codigoBitacora = deleteModal.bitacora.codigo
      setBitacoras(bitacoras.filter(b => b.id !== deleteModal.bitacora!.id))
      toast({
        title: "Bitácora eliminada",
        description: `La bitácora "${codigoBitacora}" ha sido eliminada exitosamente.`,
      })
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  if (mounted && !canRead) {
    return (
      <>
        <Header icon="menu_book" title="Bitácora de Vuelo" onMenuClick={toggle} />
        <div className="p-8 text-center">
          <p className="text-gray-500">No tienes permisos para acceder a esta sección.</p>
        </div>
      </>
    )
  }

  return (
    <>
      <Header icon="menu_book" title="Bitácora de Vuelo" onMenuClick={toggle} />

      <div className="p-4 sm:p-6 lg:p-8 h-full overflow-y-auto">
        {/* Header con título y botón */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 lg:mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-gray-100">Bitácora de Vuelo</h2>
            <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-1">Gestione y visualice los registros de vuelo realizados.</p>
          </div>
          {canCreate && (
            <Link
              href="/bitacora-vuelo/nueva"
              className="bg-[#2c528c] hover:bg-blue-800 text-white text-sm font-bold px-4 sm:px-6 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
            >
              <span className="material-symbols-outlined text-xl">add</span>
              <span className="hidden sm:inline">Nueva Bitácora</span>
              <span className="sm:hidden">Nueva</span>
            </Link>
          )}
        </div>

        {/* Tabla en desktop / Cards en móvil */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
          {/* Vista de tabla - desktop */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Folio/Orden N°</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Operador</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">RPA</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider text-center">Tiempo (Min)</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {bitacoras.map((bitacora) => (
                  <tr key={bitacora.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-[#2c528c]">{bitacora.codigo}</span>
                      <p className="text-[10px] text-gray-400 uppercase">Orden: {bitacora.ordenNumero}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-gray-300">{formatDate(bitacora.fecha)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="size-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300">
                          {bitacora.operadorIniciales}
                        </div>
                        <span className="text-sm text-slate-700 dark:text-gray-200">{bitacora.operadorNombre}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-[10px] font-bold bg-blue-50 text-blue-700 rounded-md dark:bg-blue-900/30 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
                        {bitacora.rpa1Registro || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-center font-medium text-slate-700 dark:text-gray-200">{bitacora.tiempoVuelo}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link 
                          href={`/bitacora-vuelo/${bitacora.id}/editar`}
                          className="p-1.5 text-slate-400 hover:text-[#2c528c] transition-colors"
                          title={canUpdate ? 'Editar' : 'Ver detalle'}
                        >
                          <span className="material-symbols-outlined text-xl">{canUpdate ? 'edit' : 'visibility'}</span>
                        </Link>
                        <button 
                          className="p-1.5 text-slate-400 hover:text-[#2c528c] transition-colors"
                          title="Descargar PDF"
                        >
                          <span className="material-symbols-outlined text-xl">picture_as_pdf</span>
                        </button>
                        {canDelete && (
                          <button 
                            onClick={() => handleDelete(bitacora)}
                            className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                            title="Eliminar"
                          >
                            <span className="material-symbols-outlined text-xl">delete</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Vista de cards - móvil y tablet */}
          <div className="lg:hidden divide-y divide-gray-100 dark:divide-gray-800">
            {bitacoras.map((bitacora) => (
              <div key={bitacora.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="text-sm font-bold text-[#2c528c]">{bitacora.codigo}</span>
                    <p className="text-[10px] text-gray-400 uppercase">Orden: {bitacora.ordenNumero}</p>
                  </div>
                  <span className="px-2 py-1 text-[10px] font-bold bg-blue-50 text-blue-700 rounded-md dark:bg-blue-900/30 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
                    {bitacora.rpa1Registro || 'N/A'}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">Fecha</p>
                    <p className="text-slate-700 dark:text-gray-200">{formatDate(bitacora.fecha)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">Tiempo</p>
                    <p className="text-slate-700 dark:text-gray-200 font-medium">{bitacora.tiempoVuelo} min</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300">
                      {bitacora.operadorIniciales}
                    </div>
                    <span className="text-sm text-slate-700 dark:text-gray-200">{bitacora.operadorNombre}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Link 
                      href={`/bitacora-vuelo/${bitacora.id}/editar`}
                      className="p-1.5 text-slate-400 hover:text-[#2c528c] transition-colors"
                      title={canUpdate ? 'Editar' : 'Ver detalle'}
                    >
                      <span className="material-symbols-outlined text-lg">{canUpdate ? 'edit' : 'visibility'}</span>
                    </Link>
                    <button className="p-1.5 text-slate-400 hover:text-[#2c528c] transition-colors">
                      <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
                    </button>
                    {canDelete && (
                      <button 
                        onClick={() => handleDelete(bitacora)}
                        className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Paginación */}
          <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-gray-500 font-medium order-2 sm:order-1">Mostrando 1 a {bitacoras.length} de {bitacoras.length} registros</span>
            <div className="flex items-center gap-1 sm:gap-2 order-1 sm:order-2">
              <button className="p-1 rounded border border-gray-200 dark:border-gray-700 text-gray-400 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                <span className="material-symbols-outlined text-lg">chevron_left</span>
              </button>
              <button className="size-7 sm:size-8 text-xs font-bold bg-[#2c528c] text-white rounded">1</button>
              <button className="size-7 sm:size-8 text-xs font-bold text-slate-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">2</button>
              <button className="p-1 rounded border border-gray-200 dark:border-gray-700 text-gray-400 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                <span className="material-symbols-outlined text-lg">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, bitacora: null })}
        onConfirm={confirmDelete}
        title="Eliminar Bitácora"
        description={`¿Está seguro que desea eliminar la bitácora "${deleteModal.bitacora?.codigo}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="danger"
      />
    </>
  )
}

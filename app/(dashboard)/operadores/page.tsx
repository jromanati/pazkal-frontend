"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { useSidebar } from '@/components/layout/dashboard-layout'
import { ConfirmModal } from '@/components/ui/confirm-modal'
import { useToast } from '@/hooks/use-toast'
import useSWR from 'swr'
import { type Operador } from '@/lib/mock-data'
import { UsersService, type PaginatedResponse, type User } from '@/services/users.service'
import { canAction, canView } from '@/lib/permissions'

export default function OperadoresPage() {
  const { toggle } = useSidebar()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const canRead = mounted && canView('operadores')
  const canCreate = mounted && canAction('operadores', 'create')
  const canUpdate = mounted && canAction('operadores', 'update')
  const canDelete = mounted && canAction('operadores', 'delete')
  const [operadores, setOperadores] = useState<Operador[]>([])
  const [page] = useState(1)
  const [pageSize] = useState(100)
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; operador: Operador | null }>({
    open: false,
    operador: null
  })

  const fetchedUsers = async () => {
    const response = await UsersService.getUsers({ page, page_size: pageSize })
    if (!response.success || !response.data) return null
    return response.data
  }

  const { data: users } = useSWR<PaginatedResponse<User> | null>(
    ['users_operadores', page, pageSize],
    fetchedUsers,
  )

  useEffect(() => {
    if (!users?.results) return

    const mapped: Operador[] = users.results
      .filter((u) => {
        const g = String(u.groups?.[0]?.name ?? '').trim().toLowerCase()
        return g === 'operador'
      })
      .map((u) => {
        const firstName = u.first_name ?? ''
        const lastName = u.last_name ?? ''
        const nombre = `${firstName} ${lastName}`.trim() || u.email
        const iniciales = `${(firstName?.[0] || '').toUpperCase()}${(lastName?.[0] || '').toUpperCase()}` || '?'
        const rut = u.profile?.rut ?? ''
        const empresaId = String(u.companies?.[0]?.id ?? '')
        const empresaNombre = u.companies?.[0]?.name ?? ''
        return {
          id: String(u.id),
          nombre,
          rut,
          correo: u.email,
          telefono: u.profile?.telefono ?? u.phone ?? '',
          fechaNacimiento: u.profile?.fecha_nacimiento ?? '',
          numeroCredencial: String(u.profile?.numero_credencial ?? ''),
          empresaId,
          empresaNombre,
          iniciales,
        }
      })

    setOperadores(mapped)
  }, [users])

  const handleDelete = (operador: Operador) => {
    setDeleteModal({ open: true, operador })
  }

  const confirmDelete = async () => {
    if (!deleteModal.operador) return

    const operadorToDelete = deleteModal.operador
    const response = await UsersService.deleteUser(operadorToDelete.id)
    if (!response.success) {
      toast({
        title: 'Error al eliminar',
        description: response.error || 'No se pudo eliminar el operador.',
        variant: 'destructive',
      })
      return
    }

    setOperadores(operadores.filter(o => o.id !== operadorToDelete.id))
    toast({
      title: 'Operador eliminado',
      description: `El operador "${operadorToDelete.nombre}" ha sido eliminado exitosamente.`,
    })
    setDeleteModal({ open: false, operador: null })
  }

  if (mounted && !canRead) {
    return (
      <>
        <Header onMenuClick={toggle} />
        <div className="p-8 text-center">
          <p className="text-gray-500">No tienes permisos para acceder a esta sección.</p>
        </div>
      </>
    )
  }

  return (
    <>
      <Header onMenuClick={toggle} />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 lg:mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-gray-100">Operadores</h2>
            <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-1">
              Gestione el personal técnico y administrativo de las operaciones aéreas.
            </p>
          </div>
          {canCreate && (
            <Link
              href="/operadores/nuevo"
              className="bg-white border border-gray-300 dark:border-gray-700 hover:bg-gray-50 text-slate-700 dark:text-gray-200 dark:bg-gray-800 text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm w-full sm:w-auto"
            >
              <span className="material-symbols-outlined text-lg sm:text-xl">add</span>
              Nuevo Operador
            </Link>
          )}
        </div>

        {/* Mobile Cards View */}
        <div className="block lg:hidden space-y-3">
          {operadores.map((operador) => (
            <div key={operador.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-10 rounded-full bg-[#2c528c]/10 flex items-center justify-center text-[#2c528c] font-bold text-xs flex-shrink-0">
                    {operador.iniciales}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-700 dark:text-gray-200 truncate">{operador.nombre}</p>
                    <p className="text-xs text-gray-500 truncate">{operador.correo}</p>
                  </div>
                </div>
                {(canUpdate || canDelete) && (
                  <div className="flex gap-1 flex-shrink-0">
                    <Link
                      href={`/operadores/${operador.id}/editar`}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-slate-400 hover:text-[#2c528c] transition-colors"
                      title={canUpdate ? 'Editar operador' : 'Ver detalle'}
                    >
                      <span className="material-symbols-outlined text-lg">{canUpdate ? 'edit' : 'visibility'}</span>
                    </Link>
                    {canDelete && (
                      <button 
                        onClick={() => handleDelete(operador)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">RUT</p>
                  <p className="text-xs text-slate-600 dark:text-gray-400">{operador.rut}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Empresa</p>
                  <span className="inline-block text-xs font-medium px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 truncate max-w-full">
                    {operador.empresaNombre}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">Nombre</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">RUT</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">Correo</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">Empresa</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {operadores.map((operador) => (
                  <tr key={operador.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-[#2c528c]/10 flex items-center justify-center text-[#2c528c] font-bold text-xs">
                          {operador.iniciales}
                        </div>
                        <span className="text-sm font-semibold text-slate-700 dark:text-gray-200">{operador.nombre}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-gray-400">{operador.rut}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-gray-400">{operador.correo}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium px-2 py-1 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
                        {operador.empresaNombre}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {(canUpdate || canDelete) && (
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/operadores/${operador.id}/editar`}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-slate-400 hover:text-[#2c528c] transition-colors"
                            title={canUpdate ? 'Editar operador' : 'Ver detalle'}
                          >
                            <span className="material-symbols-outlined text-lg">{canUpdate ? 'edit' : 'visibility'}</span>
                          </Link>
                          {canDelete && (
                            <button 
                              onClick={() => handleDelete(operador)}
                              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-slate-400 hover:text-red-600 transition-colors"
                              title="Eliminar operador"
                            >
                              <span className="material-symbols-outlined text-lg">delete</span>
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

          {/* Pagination */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <p className="text-xs text-slate-500 dark:text-gray-400 font-medium uppercase tracking-wider">
              Mostrando 1 - {operadores.length} de {operadores.length} operadores
            </p>
            <div className="flex items-center gap-2">
              <button className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-slate-500 transition-colors disabled:opacity-30" disabled>
                <span className="material-symbols-outlined text-xl">chevron_left</span>
              </button>
              <button className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-slate-500 transition-colors">
                <span className="material-symbols-outlined text-xl">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Pagination */}
        <div className="lg:hidden mt-4 flex items-center justify-between">
          <p className="text-[10px] sm:text-xs text-slate-500 dark:text-gray-400 font-medium uppercase tracking-wider">
            {operadores.length} operadores
          </p>
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-slate-500 transition-colors disabled:opacity-30" disabled>
              <span className="material-symbols-outlined text-base">chevron_left</span>
            </button>
            <button className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-slate-500 transition-colors">
              <span className="material-symbols-outlined text-base">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, operador: null })}
        onConfirm={confirmDelete}
        title="Eliminar Operador"
        description={`¿Está seguro que desea eliminar al operador "${deleteModal.operador?.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="danger"
      />
    </>
  )
}

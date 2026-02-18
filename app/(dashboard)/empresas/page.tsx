"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { Header } from '@/components/layout/header'
import { useSidebar } from '@/components/layout/dashboard-layout'
import { ConfirmModal } from '@/components/ui/confirm-modal'
import { useToast } from '@/hooks/use-toast'
import { type Empresa } from '@/lib/mock-data'
import { CompanyService, type CompanyListItem, type PaginatedResponse } from '@/services/company.service'
import { canAction } from '@/lib/permissions'

export default function EmpresasPage() {
  const { toggle } = useSidebar()
  const { toast } = useToast()
  const canCreate = canAction('empresas', 'create')
  const canUpdate = canAction('empresas', 'update')
  const canDelete = canAction('empresas', 'delete')
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; empresa: Empresa | null }>({
    open: false,
    empresa: null
  })

  const fetchedCompanies = async () => {
    const response = await CompanyService.getCompanies({ page, page_size: pageSize })
    if (!response.success || !response.data) return null
    return response.data
  }

  const { data: companies } = useSWR<PaginatedResponse<CompanyListItem> | null>(
    ['companies', page, pageSize],
    fetchedCompanies,
  )

  useEffect(() => {
    if (!companies) {
      setEmpresas([])
      return
    }

    const mapped: Empresa[] = (companies.results ?? []).map((c) => ({
      id: String(c.id),
      nombre: c.name ?? '',
      rut: c.tax_id ?? '',
      razonSocial: c.legal_name ?? '',
      aocCeo: c.aoc_ceo_number ?? '',
      numeroAoc: '',
      especificacion: '',
      nombreGerente: '',
      correoGerente: '',
      telefonoGerente: '',
      inspectorDgac: '',
      correoDgac: '',
    }))

    setEmpresas(mapped)
  }, [companies])

  const totalPages = companies?.total_pages ?? 1
  const currentPage = companies?.current_page ?? page
  const count = companies?.count ?? 0
  const start = count === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const end = Math.min(currentPage * pageSize, count)

  const canPrev = Boolean(companies?.previous) && currentPage > 1
  const canNext = Boolean(companies?.next) && currentPage < totalPages

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages) return
    setPage(p)
  }

  const pagesToShow = Array.from({ length: totalPages }, (_, i) => i + 1)

  const handleDelete = (empresa: Empresa) => {
    setDeleteModal({ open: true, empresa })
  }

  const confirmDelete = async () => {
    if (!deleteModal.empresa) return

    const empresaToDelete = deleteModal.empresa
    const response = await CompanyService.deleteCompany(empresaToDelete.id)
    if (!response.success) {
      toast({
        title: 'Error al eliminar',
        description: response.error || 'No se pudo eliminar la empresa.',
        variant: 'destructive',
      })
      return
    }

    setEmpresas(empresas.filter(e => e.id !== empresaToDelete.id))
    toast({
      title: 'Empresa eliminada',
      description: `La empresa "${empresaToDelete.nombre}" ha sido eliminada exitosamente.`,
    })
    setDeleteModal({ open: false, empresa: null })
  }

  return (
    <>
      <Header icon="corporate_fare" onMenuClick={toggle}>
        <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-500 hidden sm:block">Módulo de Empresas</span>
      </Header>

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-6 lg:mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-gray-100">Empresas</h2>
            <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-1">
              Gestión y registro de entidades corporativas en el sistema.
            </p>
          </div>
          {canCreate && (
            <Link 
              href="/empresas/nueva"
              className="bg-[#2c528c] hover:bg-blue-800 text-white text-xs sm:text-sm font-bold px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 w-full sm:w-auto"
            >
              <span className="material-symbols-outlined text-lg sm:text-xl">add</span>
              Nueva Empresa
            </Link>
          )}
        </div>

        {/* Mobile Cards View */}
        <div className="block lg:hidden space-y-3">
          {empresas.map((empresa) => (
            <div key={empresa.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-10 rounded-lg bg-[#2c528c]/10 flex items-center justify-center text-[#2c528c] font-bold text-xs flex-shrink-0">
                    {empresa.nombre.split(' ').map(w => w[0]).join('').slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-gray-200 truncate">{empresa.nombre}</p>
                    <p className="text-xs text-gray-500 truncate">{empresa.razonSocial}</p>
                  </div>
                </div>
                {(canUpdate || canDelete) && (
                  <div className="flex gap-1 flex-shrink-0">
                    {canUpdate && (
                      <Link
                        href={`/empresas/${empresa.id}/editar`}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-slate-400 hover:text-[#2c528c] transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </Link>
                    )}
                    {canDelete && (
                      <button 
                        onClick={() => handleDelete(empresa)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
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
                  <p className="text-xs text-slate-600 dark:text-gray-400">{empresa.rut}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">AOC/CEO</p>
                  <span className="inline-block px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
                    {empresa.aocCeo}
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
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Rut Empresa</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Razón Social</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">AOC/CEO</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {empresas.map((empresa) => (
                  <tr key={empresa.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded bg-[#2c528c]/10 flex items-center justify-center text-[#2c528c] font-bold text-xs">
                          {empresa.nombre.split(' ').map(w => w[0]).join('').slice(0, 2)}
                        </div>
                        <span className="text-sm font-semibold text-slate-800 dark:text-gray-200">{empresa.nombre}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-gray-400">{empresa.rut}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-gray-400">{empresa.razonSocial}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[11px] font-bold">
                        {empresa.aocCeo}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {(canUpdate || canDelete) && (
                        <div className="flex justify-end gap-2">
                          {canUpdate && (
                            <Link
                              href={`/empresas/${empresa.id}/editar`}
                              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-slate-400 hover:text-[#2c528c] transition-colors"
                              title="Editar empresa"
                            >
                              <span className="material-symbols-outlined text-xl">edit</span>
                            </Link>
                          )}
                          {canDelete && (
                            <button 
                              onClick={() => handleDelete(empresa)}
                              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-slate-400 hover:text-red-500 transition-colors"
                              title="Eliminar empresa"
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

          {/* Pagination */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Mostrando {start}-{end} de {count} empresas registradas
            </p>
            <div className="flex gap-1">
              <button
                className="p-1 rounded border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                disabled={!canPrev}
                onClick={() => goToPage(currentPage - 1)}
              >
                <span className="material-symbols-outlined text-lg">chevron_left</span>
              </button>

              {pagesToShow.map((p) => (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  className={
                    p === currentPage
                      ? "px-3 py-1 text-xs font-bold rounded bg-[#2c528c] text-white shadow-sm"
                      : "px-3 py-1 text-xs font-medium rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  }
                >
                  {p}
                </button>
              ))}

              <button
                className="p-1 rounded border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                disabled={!canNext}
                onClick={() => goToPage(currentPage + 1)}
              >
                <span className="material-symbols-outlined text-lg">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Pagination */}
        <div className="lg:hidden mt-4 flex items-center justify-between">
          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium">
            {count} empresas
          </p>
          <div className="flex gap-1">
            <button
              className="p-1.5 rounded border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              disabled={!canPrev}
              onClick={() => goToPage(currentPage - 1)}
            >
              <span className="material-symbols-outlined text-base">chevron_left</span>
            </button>
            <button className="px-3 py-1.5 text-xs font-bold rounded bg-[#2c528c] text-white shadow-sm">
              {currentPage}
            </button>
            <button
              className="p-1.5 rounded border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              disabled={!canNext}
              onClick={() => goToPage(currentPage + 1)}
            >
              <span className="material-symbols-outlined text-base">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, empresa: null })}
        onConfirm={confirmDelete}
        title="Eliminar Empresa"
        description={`¿Está seguro que desea eliminar la empresa "${deleteModal.empresa?.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="danger"
      />
    </>
  )
}

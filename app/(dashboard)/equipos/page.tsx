"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { useSidebar } from '@/components/layout/dashboard-layout'
import { ConfirmModal } from '@/components/ui/confirm-modal'
import { useToast } from '@/hooks/use-toast'
import { CompanyService, type CompanyListItem } from '@/services/company.service'
import { BranchService, type Branch } from '@/services/branches.service'
import { DronesService, type DroneListItem, type PaginatedResponse } from '@/services/drones.service'

export default function EquiposPage() {
  const { toggle } = useSidebar()
  const { toast } = useToast()
  const [equipos, setEquipos] = useState<DroneListItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const [companies, setCompanies] = useState<CompanyListItem[]>([])
  const [branches, setBranches] = useState<Branch[]>([])

  const [filters, setFilters] = useState<{
    companyId: string
    branchId: string
    hasParachute: '' | 'true' | 'false'
    ordering: string
    search: string
  }>({
    companyId: '',
    branchId: '',
    hasParachute: '',
    ordering: '',
    search: '',
  })

  const [deleteModal, setDeleteModal] = useState<{ open: boolean; equipo: DroneListItem | null }>({
    open: false,
    equipo: null,
  })

  const normalizeList = (data: DroneListItem[] | PaginatedResponse<DroneListItem>) => {
    if (Array.isArray(data)) return data
    return data?.results ?? []
  }

  const loadCompanies = async () => {
    const res = await CompanyService.getCompanies({ page: 1, page_size: 500 })
    if (res.success && res.data?.results) {
      setCompanies(res.data.results)
      return
    }
    toast({
      title: 'No se pudieron cargar las empresas',
      description: res.error || 'Error al obtener empresas.',
      variant: 'destructive',
    })
  }

  const loadBranches = async (companyId: string) => {
    if (!companyId) {
      setBranches([])
      return
    }
    const res = await BranchService.listBranches({ company_id: companyId })
    if (res.success && res.data) {
      const data: any = res.data
      const list: Branch[] = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : []
      setBranches(list)
      return
    }
    toast({
      title: 'No se pudieron cargar las sucursales',
      description: res.error || 'Error al obtener sucursales.',
      variant: 'destructive',
    })
  }

  const fetchEquipos = async () => {
    setIsLoading(true)
    try {
      const res = await DronesService.listDrones({
        branch_id: filters.branchId || undefined,
        has_parachute: filters.hasParachute === '' ? undefined : filters.hasParachute === 'true',
        ordering: filters.ordering || undefined,
        search: filters.search || undefined,
      })

      if (!res.success || !res.data) {
        toast({
          title: 'No se pudieron cargar los equipos',
          description: res.error || 'Error al obtener equipos.',
          variant: 'destructive',
        })
        return
      }

      setEquipos(normalizeList(res.data))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCompanies()
  }, [])

  useEffect(() => {
    loadBranches(filters.companyId)
    setFilters(prev => ({ ...prev, branchId: '' }))
  }, [filters.companyId])

  useEffect(() => {
    fetchEquipos()
  }, [filters.branchId, filters.hasParachute, filters.ordering, filters.search])

  const confirmDelete = () => {
    ;(async () => {
      if (!deleteModal.equipo) return
      const equipo = deleteModal.equipo
      const nombre = `${equipo.brand} ${equipo.model}`
      const res = await DronesService.deleteDrone(equipo.id)
      if (!res.success) {
        toast({
          title: 'No se pudo eliminar',
          description: res.error || 'Error al eliminar el equipo.',
          variant: 'destructive',
        })
        return
      }
      toast({ title: 'Equipo eliminado', description: `El equipo "${nombre}" ha sido eliminado exitosamente.` })
      setDeleteModal({ open: false, equipo: null })
      fetchEquipos()
    })()
  }

  const estadoBadge = (estado: string) => {
    const styles: Record<string, string> = {
      activo: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      mantenimiento: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      inactivo: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    }
    const labels: Record<string, string> = { activo: 'Activo', mantenimiento: 'Mantenimiento', inactivo: 'Inactivo' }
    return <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[estado]}`}>{labels[estado]}</span>
  }

  return (
    <>
      <Header icon="flight" title="Equipos (Drones)" onMenuClick={toggle} />
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-gray-100">Listado de Equipos</h2>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">
              {isLoading ? 'Cargando...' : `${equipos.length} equipos registrados`}
            </p>
          </div>
          <Link href="/equipos/nuevo" className="bg-[#2c528c] hover:bg-blue-800 text-white text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-md">
            <span className="material-symbols-outlined text-base sm:text-lg">add</span>
            Nuevo Equipo
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="px-5 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-sm font-bold text-slate-800 dark:text-gray-200 flex items-center gap-2">
              <span className="material-symbols-outlined text-lg text-[#2c528c]">filter_alt</span>
              Filtros
            </h3>
          </div>
          <div className="p-5 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Empresa</label>
                <select
                  value={filters.companyId}
                  onChange={(e) => setFilters(prev => ({ ...prev, companyId: e.target.value }))}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:ring-[#2c528c] focus:border-[#2c528c]"
                >
                  <option value="">Todas</option>
                  {companies.map(c => (
                    <option key={c.id} value={String(c.id)}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Sucursal</label>
                <select
                  value={filters.branchId}
                  onChange={(e) => setFilters(prev => ({ ...prev, branchId: e.target.value }))}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:ring-[#2c528c] focus:border-[#2c528c]"
                  disabled={!filters.companyId}
                >
                  <option value="">Todas</option>
                  {branches.map(b => (
                    <option key={b.id} value={String(b.id)}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Paracaídas</label>
                <select
                  value={filters.hasParachute}
                  onChange={(e) => setFilters(prev => ({ ...prev, hasParachute: e.target.value as '' | 'true' | 'false' }))}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:ring-[#2c528c] focus:border-[#2c528c]"
                >
                  <option value="">Todos</option>
                  <option value="true">Con paracaídas</option>
                  <option value="false">Sin paracaídas</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Orden</label>
                <select
                  value={filters.ordering}
                  onChange={(e) => setFilters(prev => ({ ...prev, ordering: e.target.value }))}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:ring-[#2c528c] focus:border-[#2c528c]"
                >
                  <option value="">Por defecto</option>
                  <option value="registration_number">Registro (A-Z)</option>
                  <option value="-registration_number">Registro (Z-A)</option>
                  <option value="created_at">Más antiguos</option>
                  <option value="-created_at">Más recientes</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Buscar</label>
                <input
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  placeholder="Registro, marca, modelo..."
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:ring-[#2c528c] focus:border-[#2c528c]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Registro</th>
                <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Marca / Modelo</th>
                <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">N. Serie</th>
                <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Peso Max.</th>
                <th className="text-center px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Baterias</th>
                <th className="text-center px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Paracaidas</th>
                <th className="text-center px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Estado</th>
                <th className="text-center px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {equipos.map((equipo) => (
                <tr key={equipo.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-[#2c528c]">{equipo.registration_number}</span>
                    <p className="text-[11px] text-gray-400 mt-0.5">{equipo.branch_name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-slate-800 dark:text-gray-100">{equipo.brand}</p>
                    <p className="text-xs text-gray-500">{equipo.model}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 font-mono text-xs">{equipo.serial_number}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{equipo.max_takeoff_weight_kg} kg</td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700 dark:text-gray-300">
                      <span className="material-symbols-outlined text-base text-[#2c528c]">battery_full</span>
                      {equipo.battery_count}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {equipo.has_parachute ? (
                      <span className="material-symbols-outlined text-green-500 text-xl">check_circle</span>
                    ) : (
                      <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 text-xl">cancel</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">{estadoBadge(equipo.is_active ? 'activo' : 'inactivo')}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-1">
                      <Link href={`/equipos/${equipo.id}/editar`} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" title="Editar">
                        <span className="material-symbols-outlined text-lg text-gray-500 hover:text-[#2c528c]">edit</span>
                      </Link>
                      <button onClick={() => setDeleteModal({ open: true, equipo })} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Eliminar">
                        <span className="material-symbols-outlined text-lg text-gray-500 hover:text-red-500">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-3">
          {equipos.map((equipo) => (
            <div key={equipo.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-xs font-bold text-[#2c528c]">{equipo.registration_number}</span>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-gray-100">{equipo.brand} {equipo.model}</h3>
                  <p className="text-[11px] text-gray-500 font-mono">{equipo.serial_number}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{equipo.branch_name}</p>
                </div>
                {estadoBadge(equipo.is_active ? 'activo' : 'inactivo')}
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">scale</span> {equipo.max_takeoff_weight_kg} kg</span>
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">battery_full</span> {equipo.battery_count} bat.</span>
                {equipo.has_parachute && (
                  <span className="flex items-center gap-1 text-green-600">
                    <span className="material-symbols-outlined text-sm">paragliding</span> Paracaídas
                  </span>
                )}
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                <Link href={`/equipos/${equipo.id}/editar`} className="text-xs font-semibold text-[#2c528c] flex items-center gap-1">
                  <span className="material-symbols-outlined text-base">edit</span> Editar
                </Link>
                <button onClick={() => setDeleteModal({ open: true, equipo })} className="text-xs font-semibold text-red-500 flex items-center gap-1">
                  <span className="material-symbols-outlined text-base">delete</span> Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, equipo: null })}
        onConfirm={confirmDelete}
        title="Eliminar equipo"
        description={`¿Está seguro de eliminar el equipo "${deleteModal.equipo?.brand} ${deleteModal.equipo?.model}" (${deleteModal.equipo?.registration_number})? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="danger"
      />
    </>
  )
}

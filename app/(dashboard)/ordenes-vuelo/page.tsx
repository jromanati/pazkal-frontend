"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { useSidebar } from '@/components/layout/dashboard-layout'
import { ConfirmModal } from '@/components/ui/confirm-modal'
import { useToast } from '@/hooks/use-toast'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { FlightOrdersService, type FlightOrder, type FlightOrderStatus } from '@/services/flight-orders.service'
import { CompanyService, type CompanyListItem } from '@/services/company.service'
import { UsersService, type User } from '@/services/users.service'
import { canAction, canView } from '@/lib/permissions'

export default function OrdenesVueloPage() {
  const { toggle } = useSidebar()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const canRead = mounted && canView('ordenes_vuelo')
  const canCreate = mounted && canAction('ordenes_vuelo', 'create')
  const canUpdate = mounted && canAction('ordenes_vuelo', 'update')
  const canDelete = mounted && canAction('ordenes_vuelo', 'delete')
  const [ordenes, setOrdenes] = useState<FlightOrder[]>([])
  const [companies, setCompanies] = useState<CompanyListItem[]>([])
  const [operators, setOperators] = useState<User[]>([])
  const [filters, setFilters] = useState({
    company_id: '',
    operator_id: '',
    date_from: '',
    date_to: '',
    status: '' as '' | FlightOrderStatus,
    search: '',
    ordering: '-scheduled_date',
  })
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; orden: FlightOrder | null }>({
    open: false,
    orden: null
  })

  const handleDelete = (orden: FlightOrder) => {
    setDeleteModal({ open: true, orden })
  }

  const confirmDelete = async () => {
    const orden = deleteModal.orden as unknown as FlightOrder | null
    if (!orden) return

    setLoading(true)
    try {
      const res = await FlightOrdersService.deleteOrder(orden.id)
      if (!res.success) {
        toast({
          title: 'No se pudo eliminar',
          description: res.error || 'Error al eliminar la orden.',
          variant: 'destructive',
        })
        return
      }

      toast({
        title: 'Orden eliminada',
        description: `La orden "${orden.order_number}" ha sido eliminada exitosamente.`,
      })
      setOrdenes((prev) => prev.filter((o) => o.id !== orden.id))
    } finally {
      setLoading(false)
    }
  }

  const getEstadoBadge = (estado: FlightOrder['status'], estadoDisplay?: string) => {
    const estilos: Record<string, string> = {
      COMPLETED: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      IN_FLIGHT: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      PENDING: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    }
    return (
      <span className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full ${estilos[estado] ?? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'} text-[9px] sm:text-[10px] font-bold uppercase tracking-wider`}>
        {estadoDisplay || estado}
      </span>
    )
  }

  const formatFecha = (fecha: string) => {
    const date = new Date(fecha)
    return date.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  useEffect(() => {
    if (!mounted || !canRead) return

    const loadFiltersData = async () => {
      const [companiesRes, usersRes] = await Promise.all([
        CompanyService.getCompanies({ page: 1, page_size: 1000 }),
        UsersService.getUsers({ page: 1, page_size: 1000 }),
      ])

      if (companiesRes.success && companiesRes.data?.results) {
        setCompanies(companiesRes.data.results)
      }

      if (usersRes.success && usersRes.data?.results) {
        const ops = usersRes.data.results.filter((u) => String(u.groups?.[0]?.name ?? '').toLowerCase() === 'operador')
        setOperators(ops)
      }
    }

    loadFiltersData()
  }, [mounted, canRead])

  useEffect(() => {
    if (!mounted || !canRead) return

    const run = async () => {
      setLoading(true)
      try {
        const res = await FlightOrdersService.listOrders({
          company_id: filters.company_id ? Number(filters.company_id) : undefined,
          operator_id: filters.operator_id ? Number(filters.operator_id) : undefined,
          date_from: filters.date_from || undefined,
          date_to: filters.date_to || undefined,
          status: filters.status || undefined,
          search: filters.search || undefined,
          ordering: filters.ordering || undefined,
        })

        if (!res.success || !res.data) {
          toast({
            title: 'Error al cargar órdenes',
            description: res.error || 'No se pudieron cargar las órdenes de vuelo.',
            variant: 'destructive',
          })
          setOrdenes([])
          return
        }

        const data: unknown = res.data
        if (Array.isArray(data)) {
          setOrdenes(data)
        } else if (data && typeof data === 'object' && Array.isArray((data as any).results)) {
          setOrdenes((data as any).results)
        } else {
          setOrdenes([])
        }
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [mounted, canRead, filters.company_id, filters.operator_id, filters.date_from, filters.date_to, filters.status, filters.search, filters.ordering, toast])

  if (mounted && !canRead) {
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

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-4 sm:p-5 mb-4 sm:mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1" htmlFor="f_company">
                Empresa
              </label>
              <SearchableSelect<string>
                value={filters.company_id}
                onChange={(v) => setFilters((p) => ({ ...p, company_id: v }))}
                options={[
                  { value: '', label: 'Todas' },
                  ...companies.map((c) => ({ value: String(c.id), label: c.name })),
                ]}
                placeholder="Todas"
                searchPlaceholder="Buscar empresa..."
                triggerClassName="text-xs"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1" htmlFor="f_operator">
                Operador
              </label>
              <SearchableSelect<string>
                value={filters.operator_id}
                onChange={(v) => setFilters((p) => ({ ...p, operator_id: v }))}
                options={[
                  { value: '', label: 'Todos' },
                  ...operators.map((u) => ({
                    value: String(u.id),
                    label: `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim() || u.email,
                  })),
                ]}
                placeholder="Todos"
                searchPlaceholder="Buscar operador..."
                triggerClassName="text-xs"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1" htmlFor="f_from">
                Desde
              </label>
              <input
                id="f_from"
                type="date"
                value={filters.date_from}
                onChange={(e) => setFilters((p) => ({ ...p, date_from: e.target.value }))}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-xs focus:ring-[#2c528c] focus:border-[#2c528c]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1" htmlFor="f_to">
                Hasta
              </label>
              <input
                id="f_to"
                type="date"
                value={filters.date_to}
                onChange={(e) => setFilters((p) => ({ ...p, date_to: e.target.value }))}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-xs focus:ring-[#2c528c] focus:border-[#2c528c]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1" htmlFor="f_status">
                Estado
              </label>
              <select
                id="f_status"
                value={filters.status}
                onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value as any }))}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-xs focus:ring-[#2c528c] focus:border-[#2c528c]"
              >
                <option value="">Todos</option>
                <option value="PENDING">Pendiente</option>
                <option value="IN_FLIGHT">En vuelo</option>
                <option value="COMPLETED">Completado</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1" htmlFor="f_search">
                Buscar
              </label>
              <input
                id="f_search"
                type="text"
                value={filters.search}
                onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
                placeholder="Número de orden"
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-xs focus:ring-[#2c528c] focus:border-[#2c528c]"
              />
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1" htmlFor="f_ordering">
                Orden
              </label>
              <select
                id="f_ordering"
                value={filters.ordering}
                onChange={(e) => setFilters((p) => ({ ...p, ordering: e.target.value }))}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-xs focus:ring-[#2c528c] focus:border-[#2c528c]"
              >
                <option value="-scheduled_date">Fecha (desc)</option>
                <option value="scheduled_date">Fecha (asc)</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() =>
                setFilters({
                  company_id: '',
                  operator_id: '',
                  date_from: '',
                  date_to: '',
                  status: '',
                  search: '',
                  ordering: '-scheduled_date',
                })
              }
              className="text-xs font-bold text-gray-500 hover:text-slate-800 dark:hover:text-gray-200 transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        </div>

        {loading && (
          <div className="mb-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-4 py-3 text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
            <span className="material-symbols-outlined animate-spin">progress_activity</span>
            Cargando...
          </div>
        )}

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
                    <td className="px-6 py-4 text-sm font-bold text-[#2c528c]">{orden.order_number}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="size-7 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                          {String(orden.operator?.full_name || `${orden.operator?.first_name ?? ''} ${orden.operator?.last_name ?? ''}`)
                            .trim()
                            .split(' ')
                            .filter(Boolean)
                            .slice(0, 2)
                            .map((s) => s[0]?.toUpperCase())
                            .join('')}
                        </div>
                        <span className="text-sm font-medium text-slate-800 dark:text-gray-200">{orden.operator?.full_name || `${orden.operator?.first_name ?? ''} ${orden.operator?.last_name ?? ''}`}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-gray-400">{formatFecha(orden.scheduled_date)}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-gray-400">{orden.location}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-gray-400">{orden.aerial_work_type || '-'}</td>
                    <td className="px-6 py-4">{getEstadoBadge(orden.status, orden.status_display)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/ordenes-vuelo/${orden.id}/editar`}
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-slate-400 hover:text-[#2c528c] transition-colors"
                          title={canUpdate ? 'Editar orden' : 'Ver detalle'}
                        >
                          <span className="material-symbols-outlined text-xl">{canUpdate ? 'edit' : 'visibility'}</span>
                        </Link>
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(orden)}
                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded text-slate-400 hover:text-red-500 transition-colors"
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
                  <p className="text-sm font-bold text-[#2c528c]">{orden.order_number}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="size-6 rounded-full bg-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-600">
                      {String(orden.operator?.full_name || `${orden.operator?.first_name ?? ''} ${orden.operator?.last_name ?? ''}`)
                        .trim()
                        .split(' ')
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((s) => s[0]?.toUpperCase())
                        .join('')}
                    </div>
                    <span className="text-xs font-medium text-slate-800 dark:text-gray-200">{orden.operator?.full_name || `${orden.operator?.first_name ?? ''} ${orden.operator?.last_name ?? ''}`}</span>
                  </div>
                </div>
                {getEstadoBadge(orden.status, orden.status_display)}
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                <div>
                  <p className="text-gray-400 uppercase text-[10px] font-semibold">Fecha</p>
                  <p className="text-slate-600 dark:text-gray-300">{formatFecha(orden.scheduled_date)}</p>
                </div>
                <div>
                  <p className="text-gray-400 uppercase text-[10px] font-semibold">Lugar</p>
                  <p className="text-slate-600 dark:text-gray-300 truncate">{orden.location}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-400 uppercase text-[10px] font-semibold">Trabajo</p>
                  <p className="text-slate-600 dark:text-gray-300">{orden.aerial_work_type || '-'}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                <Link
                  href={`/ordenes-vuelo/${orden.id}/editar`}
                  className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium text-[#2c528c] hover:bg-[#2c528c]/5 rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined text-base">{canUpdate ? 'edit' : 'visibility'}</span>
                  {canUpdate ? 'Editar' : 'Ver'}
                </Link>
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
        description={`¿Está seguro que desea eliminar la orden "${deleteModal.orden?.order_number}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="danger"
      />
    </>
  )
}

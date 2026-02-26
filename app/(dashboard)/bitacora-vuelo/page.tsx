"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { useSidebar } from '@/components/layout/dashboard-layout'
import { ConfirmModal } from '@/components/ui/confirm-modal'
import { useToast } from '@/hooks/use-toast'
import { FlightLogsService, type FlightLog } from '@/services/flights-logs.service'
import { FlightOrdersService, type FlightOrder } from '@/services/flight-orders.service'
import { UsersService, type User } from '@/services/users.service'
import { DronesService } from '@/services/drones.service'
import { BranchService } from '@/services/branches.service'
import { canAction, canView } from '@/lib/permissions'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { buildFlightLogPdfHtml, downloadPdfFromHtml, openPrintPdf, type PdfDroneSection } from '@/lib/pdf'

export default function BitacoraVueloPage() {
  const { toggle } = useSidebar()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const canRead = mounted && canView('bitacora_vuelo')
  const canCreate = mounted && canAction('bitacora_vuelo', 'create')
  const canUpdate = mounted && canAction('bitacora_vuelo', 'update')
  const canDelete = mounted && canAction('bitacora_vuelo', 'delete')
  const [bitacoras, setBitacoras] = useState<FlightLog[]>([])
  const [flightOrders, setFlightOrders] = useState<FlightOrder[]>([])
  const [operators, setOperators] = useState<User[]>([])
  const [filters, setFilters] = useState({
    date_from: '',
    date_to: '',
    flight_order_id: '',
    operator_id: '',
    ordering: '-flight_date',
    search: '',
  })
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; bitacora: FlightLog | null }>({
    open: false,
    bitacora: null
  })

  const handleDelete = (bitacora: FlightLog) => {
    setDeleteModal({ open: true, bitacora })
  }

  const confirmDelete = async () => {
    const b = deleteModal.bitacora
    if (!b) return

    setLoading(true)
    try {
      const res = await FlightLogsService.deleteLog(b.id)
      if (!res.success) {
        toast({
          title: 'No se pudo eliminar',
          description: res.error || 'Error al eliminar la bitácora.',
          variant: 'destructive',
        })
        return
      }

      toast({
        title: 'Bitácora eliminada',
        description: `La bitácora "${b.log_number}" ha sido eliminada exitosamente.`,
      })
      setBitacoras((prev) => prev.filter((x) => x.id !== b.id))
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const handlePdf = async (logId: number) => {
    setLoading(true)
    try {
      const res = await FlightLogsService.getLog(logId)
      if (!res.success || !res.data) {
        toast({
          title: 'No se pudo generar PDF',
          description: res.error || 'Error al obtener la bitácora.',
          variant: 'destructive',
        })
        return
      }

      const log: any = res.data

      let branchId: string = String(log?.branch?.id ?? log?.branch_id ?? '')
      if (!branchId) {
        const orderId = log?.flight_order?.id
        if (orderId) {
          const orderRes = await FlightOrdersService.getOrder(orderId)
          if (orderRes.success && orderRes.data) {
            const o: any = orderRes.data
            branchId = String(o?.branch?.id ?? o?.branch_id ?? '')
          }
        }
      }

      if (branchId) {
        const branchRes = await BranchService.getBranch(branchId)
        if (branchRes.success && branchRes.data) {
          log.branch = log.branch ?? { id: Number(branchId) }
          log.branch.name = log.branch.name ?? branchRes.data.name
          log.company = log.company ?? branchRes.data.company
        }
      }

      const rawDrones: unknown = log.drones
      const dronesArray: any[] = Array.isArray(rawDrones) ? rawDrones : []

      const drones: PdfDroneSection[] = []
      for (const d of dronesArray) {
        const droneId = (d as any)?.id
        if (!droneId) continue

        const detailRes = await DronesService.getDrone(droneId)
        const detail: any = detailRes.success ? detailRes.data : undefined
        const batteriesRaw: unknown = detail?.batteries
        const batteries = Array.isArray(batteriesRaw) ? batteriesRaw : []

        drones.push({
          title: `${(detail?.brand ?? d.brand ?? '').trim()} ${(detail?.model ?? d.model ?? '').trim()}`.trim() || `ID ${droneId}`,
          registration_number: detail?.registration_number ?? d.registration_number,
          serial_number: detail?.serial_number ?? d.serial_number,
          batteries: batteries.map((b: any) => ({
            battery_label: String(b?.name ?? b?.label ?? b?.id ?? 'Batería'),
            cycle_count: b?.cycle_count,
          })),
        })
      }

      const pdf = buildFlightLogPdfHtml({ log, drones })
      try {
        await downloadPdfFromHtml({
          title: pdf.title,
          html: pdf.html,
          filename: `${pdf.documentTitle || 'bitacora_vuelo'}.pdf`,
        })
      } catch {
        openPrintPdf({ title: pdf.title, html: pdf.html, documentTitle: pdf.documentTitle })
      }
    } catch {
      toast({
        title: 'No se pudo generar PDF',
        description: 'Error al generar el PDF.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!mounted || !canRead) return

    const loadFiltersData = async () => {
      const [ordersRes, usersRes] = await Promise.all([
        FlightOrdersService.listOrders({ ordering: '-scheduled_date' }),
        UsersService.getUsers({ page: 1, page_size: 1000 }),
      ])

      if (ordersRes.success && ordersRes.data) {
        const data: unknown = ordersRes.data
        if (Array.isArray(data)) {
          setFlightOrders(data)
        } else if (data && typeof data === 'object' && Array.isArray((data as any).results)) {
          setFlightOrders((data as any).results)
        }
      }

      if (usersRes.success && usersRes.data?.results) {
        setOperators(usersRes.data.results)
      }
    }

    loadFiltersData()
  }, [mounted, canRead])

  useEffect(() => {
    if (!mounted || !canRead) return

    const run = async () => {
      setLoading(true)
      try {
        const res = await FlightLogsService.listLogs({
          date_from: filters.date_from || undefined,
          date_to: filters.date_to || undefined,
          flight_order_id: filters.flight_order_id ? Number(filters.flight_order_id) : undefined,
          operator_id: filters.operator_id ? Number(filters.operator_id) : undefined,
          ordering: filters.ordering || undefined,
          search: filters.search || undefined,
        })

        if (!res.success || !res.data) {
          toast({
            title: 'Error al cargar bitácoras',
            description: res.error || 'No se pudieron cargar las bitácoras de vuelo.',
            variant: 'destructive',
          })
          setBitacoras([])
          return
        }

        const data: unknown = res.data
        if (Array.isArray(data)) {
          setBitacoras(data)
        } else if (data && typeof data === 'object' && Array.isArray((data as any).results)) {
          setBitacoras((data as any).results)
        } else {
          setBitacoras([])
        }
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [mounted, canRead, filters.date_from, filters.date_to, filters.flight_order_id, filters.operator_id, filters.ordering, filters.search, toast])

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

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden mb-4 sm:mb-6">
          <div className="p-3 sm:p-4 bg-slate-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#2c528c]">filter_alt</span>
            <h3 className="font-bold text-slate-700 dark:text-gray-200 text-sm sm:text-base">Filtros</h3>
          </div>
          <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider" htmlFor="f_from">Desde</label>
              <input
                id="f_from"
                type="date"
                value={filters.date_from}
                onChange={(e) => setFilters((p) => ({ ...p, date_from: e.target.value }))}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-xs focus:ring-[#2c528c] focus:border-[#2c528c]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider" htmlFor="f_to">Hasta</label>
              <input
                id="f_to"
                type="date"
                value={filters.date_to}
                onChange={(e) => setFilters((p) => ({ ...p, date_to: e.target.value }))}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-xs focus:ring-[#2c528c] focus:border-[#2c528c]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider" htmlFor="f_order">Orden</label>
              <SearchableSelect<string>
                value={filters.flight_order_id}
                onChange={(v) => setFilters((p) => ({ ...p, flight_order_id: v }))}
                options={[
                  { value: '', label: 'Todas' },
                  ...flightOrders.map((o) => ({ value: String(o.id), label: o.order_number })),
                ]}
                placeholder="Todas"
                searchPlaceholder="Buscar orden..."
                triggerClassName="text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider" htmlFor="f_op">Operador</label>
              <SearchableSelect<string>
                value={filters.operator_id}
                onChange={(v) => setFilters((p) => ({ ...p, operator_id: v }))}
                options={[
                  { value: '', label: 'Todos' },
                  ...operators
                    .filter((u) => String(u.groups?.[0]?.name ?? '').toLowerCase() === 'operador')
                    .map((u) => ({
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
              <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider" htmlFor="f_ordering">Ordenar</label>
              <select
                id="f_ordering"
                value={filters.ordering}
                onChange={(e) => setFilters((p) => ({ ...p, ordering: e.target.value }))}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-xs focus:ring-[#2c528c] focus:border-[#2c528c]"
              >
                <option value="-flight_date">Fecha (desc)</option>
                <option value="flight_date">Fecha (asc)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider" htmlFor="f_search">Buscar folio</label>
              <input
                id="f_search"
                type="text"
                value={filters.search}
                onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
                placeholder="Número de folio"
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-xs focus:ring-[#2c528c] focus:border-[#2c528c]"
              />
            </div>
          </div>
          <div className="px-4 sm:px-6 pb-4">
            <button
              type="button"
              onClick={() => setFilters({ date_from: '', date_to: '', flight_order_id: '', operator_id: '', ordering: '-flight_date', search: '' })}
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
                      <span className="text-sm font-bold text-[#2c528c]">{bitacora.log_number}</span>
                      <p className="text-[10px] text-gray-400 uppercase">Orden: {bitacora.flight_order?.order_number}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-gray-300">{formatDate(bitacora.flight_date)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="size-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300">
                          {String(bitacora.operator?.full_name || `${bitacora.operator?.first_name ?? ''} ${bitacora.operator?.last_name ?? ''}`)
                            .trim()
                            .split(' ')
                            .filter(Boolean)
                            .slice(0, 2)
                            .map((s) => s[0]?.toUpperCase())
                            .join('')}
                        </div>
                        <span className="text-sm text-slate-700 dark:text-gray-200">{bitacora.operator?.full_name || `${bitacora.operator?.first_name ?? ''} ${bitacora.operator?.last_name ?? ''}`}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-[10px] font-bold bg-blue-50 text-blue-700 rounded-md dark:bg-blue-900/30 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
                        {bitacora.rpa1_registration || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-center font-medium text-slate-700 dark:text-gray-200">{bitacora.flight_duration_minutes}</td>
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
                          onClick={() => handlePdf(bitacora.id)}
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
                    <span className="text-sm font-bold text-[#2c528c]">{bitacora.log_number}</span>
                    <p className="text-[10px] text-gray-400 uppercase">Orden: {bitacora.flight_order?.order_number}</p>
                  </div>
                  <span className="px-2 py-1 text-[10px] font-bold bg-blue-50 text-blue-700 rounded-md dark:bg-blue-900/30 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
                    {bitacora.rpa1_registration || 'N/A'}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">Fecha</p>
                    <p className="text-slate-700 dark:text-gray-200">{formatDate(bitacora.flight_date)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">Tiempo</p>
                    <p className="text-slate-700 dark:text-gray-200 font-medium">{bitacora.flight_duration_minutes} min</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300">
                      {String(bitacora.operator?.full_name || `${bitacora.operator?.first_name ?? ''} ${bitacora.operator?.last_name ?? ''}`)
                        .trim()
                        .split(' ')
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((s) => s[0]?.toUpperCase())
                        .join('')}
                    </div>
                    <span className="text-sm text-slate-700 dark:text-gray-200">{bitacora.operator?.full_name || `${bitacora.operator?.first_name ?? ''} ${bitacora.operator?.last_name ?? ''}`}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Link 
                      href={`/bitacora-vuelo/${bitacora.id}/editar`}
                      className="p-1.5 text-slate-400 hover:text-[#2c528c] transition-colors"
                      title={canUpdate ? 'Editar' : 'Ver detalle'}
                    >
                      <span className="material-symbols-outlined text-lg">{canUpdate ? 'edit' : 'visibility'}</span>
                    </Link>
                    <button
                      className="p-1.5 text-slate-400 hover:text-[#2c528c] transition-colors"
                      title="Descargar PDF"
                      onClick={() => handlePdf(bitacora.id)}
                    >
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
        description={`¿Está seguro que desea eliminar la bitácora "${deleteModal.bitacora?.log_number}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="danger"
      />
    </>
  )
}

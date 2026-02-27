"use client"

import React from "react"

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { useSidebar } from '@/components/layout/dashboard-layout'
import { useToast } from '@/hooks/use-toast'
import { FlightOrdersService, type FlightOrder } from '@/services/flight-orders.service'
import { FlightLogsService, type FlightLog } from '@/services/flights-logs.service'
import { DronesService, type DroneDetail, type DroneListItem } from '@/services/drones.service'
import { canAction, canView } from '@/lib/permissions'
import { SearchableSelect } from '@/components/ui/searchable-select'

export default function EditarBitacoraPage() {
  const router = useRouter()
  const params = useParams()
  const { toggle } = useSidebar()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [bitacora, setBitacora] = useState<FlightLog | null>(null)
  const [flightOrders, setFlightOrders] = useState<FlightOrder[]>([])
  const [selectedOrder, setSelectedOrder] = useState<FlightOrder | null>(null)
  const [orderBranchId, setOrderBranchId] = useState<string>('')
  const [availableDrones, setAvailableDrones] = useState<DroneListItem[]>([])
  const [logDrones, setLogDrones] = useState<DroneListItem[]>([])
  const [selectedDroneIds, setSelectedDroneIds] = useState<string[]>([''])
  const [droneDetails, setDroneDetails] = useState<Record<string, DroneDetail>>({})
  const [droneBatteries, setDroneBatteries] = useState<Record<string, Array<{ key: string; label: string; inicio: string; termino: string }>>>({})
  const [logDronePayloads, setLogDronePayloads] = useState<Array<{ drone_id: number; batteries: Array<{ battery_id: number; start_percentage: number; end_percentage: number }> }>>([])
  const canRead = mounted && canView('bitacora_vuelo')
  const canUpdate = mounted && canAction('bitacora_vuelo', 'update')
  
  const [formData, setFormData] = useState({
    folio: '',
    ordenN: '',
    fecha: '',
    lugar: '',
    copiloto: '',
    rpa1Modelo: '',
    rpa1Registro: '',
    rpa2Modelo: '',
    rpa2Registro: '',
    utcSalida: '',
    utcLlegada: '',
    gtmSalida: '',
    gtmLlegada: '',
    tiempoVuelo: '',
    trabajoAereo: '',
    actividadRealizada: '',
    comentarios: ''
  })

  const [baterias, setBaterias] = useState([
    { bateria: 'BATERÍA 1', inicio: '', termino: '' },
    { bateria: 'BATERÍA 2', inicio: '', termino: '' },
    { bateria: 'BATERÍA 3', inicio: '', termino: '' }
  ])

  useEffect(() => {
    setMounted(true)
  }, [params.id])

  useEffect(() => {
    if (!mounted || !canRead) return

    const loadLists = async () => {
      const ordersRes = await FlightOrdersService.listOrders({ ordering: '-scheduled_date' })

      if (ordersRes.success && ordersRes.data) {
        const data: unknown = ordersRes.data
        if (Array.isArray(data)) {
          setFlightOrders(data)
        } else if (data && typeof data === 'object' && Array.isArray((data as any).results)) {
          setFlightOrders((data as any).results)
        }
      }
    }

    loadLists()
  }, [mounted, canRead])

  useEffect(() => {
    if (!mounted || !canRead) return

    const logId = Array.isArray(params.id) ? params.id[0] : params.id
    if (!logId) {
      setBitacora(null)
      return
    }

    const loadLog = async () => {
      setLoading(true)
      try {
        const res = await FlightLogsService.getLog(logId)
        if (!res.success || !res.data) {
          setBitacora(null)
          return
        }

        const b = res.data
        setBitacora(b)
        setLogDrones(() => {
          const dronesRaw: unknown = (b as any).drones
          return Array.isArray(dronesRaw) ? (dronesRaw as DroneListItem[]) : []
        })
        setLogDronePayloads(() => {
          const raw: unknown = (b as any).drones
          if (!Array.isArray(raw)) return []
          return raw
            .map((d: any) => {
              const drone_id = Number(d?.drone_id ?? d?.id)
              const batsRaw: unknown = d?.batteries
              const bats = Array.isArray(batsRaw) ? batsRaw : []
              const batteries = bats
                .map((bt: any) => ({
                  battery_id: Number(bt?.battery_id ?? bt?.id),
                  start_percentage: Number(bt?.start_percentage),
                  end_percentage: Number(bt?.end_percentage),
                }))
                .filter((bt: any) => Number.isFinite(bt.battery_id) && Number.isFinite(bt.start_percentage) && Number.isFinite(bt.end_percentage))

              return { drone_id, batteries }
            })
            .filter((d: any) => Number.isFinite(d.drone_id))
        })
        setSelectedDroneIds(() => {
          const dronesRaw: unknown = (b as any).drones
          const drones = Array.isArray(dronesRaw) ? dronesRaw : []
          const ids = drones
            .map((d) => String((d as any)?.drone_id ?? (d as any)?.id ?? ''))
            .filter(Boolean)

          return ids.length ? ids : ['']
        })
        setFormData({
          folio: b.log_number ?? '',
          ordenN: String(b.flight_order?.id ?? ''),
          fecha: b.flight_date ?? '',
          lugar: b.location ?? '',
          copiloto: b.copilot_name ?? '',
          rpa1Modelo: '',
          rpa1Registro: '',
          rpa2Modelo: '',
          rpa2Registro: '',
          utcSalida: b.departure_time_utc ? b.departure_time_utc.slice(0, 5) : '',
          utcLlegada: b.arrival_time_utc ? b.arrival_time_utc.slice(0, 5) : '',
          gtmSalida: b.departure_time_local ? b.departure_time_local.slice(0, 5) : '',
          gtmLlegada: b.arrival_time_local ? b.arrival_time_local.slice(0, 5) : '',
          tiempoVuelo: String(b.flight_duration_minutes ?? ''),
          trabajoAereo: b.aerial_work_type ?? '',
          actividadRealizada: b.activity_description ?? '',
          comentarios: b.comments ?? '',
        })
      } finally {
        setLoading(false)
      }
    }

    loadLog()
  }, [mounted, canRead, params.id])

  useEffect(() => {
    const id = Number(formData.ordenN)
    if (!id) {
      setSelectedOrder(null)
      setOrderBranchId('')
      setAvailableDrones([])
      setSelectedDroneIds([''])
      setDroneDetails({})
      setDroneBatteries({})
      return
    }
    const found = flightOrders.find((o) => o.id === id) ?? null
    setSelectedOrder(found)
  }, [formData.ordenN, flightOrders])

  useEffect(() => {
    if (!mounted || !canRead) return

    const id = Number(formData.ordenN)
    if (!id) return

    const run = async () => {
      const orderRes = await FlightOrdersService.getOrder(id)
      if (!orderRes.success || !orderRes.data) {
        toast({
          title: 'No se pudo cargar la orden',
          description: orderRes.error || 'Error al obtener la orden de vuelo.',
          variant: 'destructive',
        })
        setOrderBranchId('')
        setAvailableDrones([])
        return
      }

      const branchId = String(orderRes.data.branch?.id ?? orderRes.data.branch_id ?? '')
      setOrderBranchId(branchId)
      if (!branchId) {
        setAvailableDrones([])
        return
      }

      const dronesRes = await DronesService.listAvailableDrones({ branch_id: branchId })
      if (!dronesRes.success || !dronesRes.data) {
        toast({
          title: 'No se pudieron cargar los equipos',
          description: dronesRes.error || 'Error al obtener equipos disponibles.',
          variant: 'destructive',
        })
        setAvailableDrones([])
        return
      }

      const list = dronesRes.data
      setAvailableDrones((prev) => {
        const map = new Map<string, DroneListItem>()
        for (const d of [...logDrones, ...list, ...prev]) {
          map.set(String(d.id), d)
        }
        return Array.from(map.values())
      })

      setSelectedDroneIds((prev) => {
        const mergedIds = new Set<string>([...logDrones, ...list].map((d) => String(d.id)))
        const valid = prev.filter((id) => !id || mergedIds.has(String(id)))
        return valid.length ? valid : ['']
      })
    }

    run()
  }, [mounted, canRead, formData.ordenN, toast, logDrones])

  useEffect(() => {
    const ids = Array.from(new Set(selectedDroneIds.filter(Boolean)))
    if (!ids.length) return

    const missing = ids.filter((id) => !droneDetails[id])
    if (!missing.length) return

    const run = async () => {
      for (const id of missing) {
        const res = await DronesService.getDrone(id)
        if (!res.success || !res.data) continue

        const detail = res.data as DroneDetail
        setDroneDetails((prev) => ({ ...prev, [id]: detail }))

        const batteriesRaw: unknown = (detail as any).batteries
        const batteries = Array.isArray(batteriesRaw) ? batteriesRaw : []
        setDroneBatteries((prev) => ({
          ...prev,
          [id]: batteries.map((b) => ({
            key: String((b as any)?.id ?? b),
            label: String((b as any)?.name ?? b),
            inicio: (() => {
              const match = logDronePayloads.find((x) => String(x.drone_id) === String(id))
              const val = match?.batteries?.find((bt) => String(bt.battery_id) === String((b as any)?.id))?.start_percentage
              return val === null || val === undefined || Number.isNaN(Number(val)) ? '' : String(val)
            })(),
            termino: (() => {
              const match = logDronePayloads.find((x) => String(x.drone_id) === String(id))
              const val = match?.batteries?.find((bt) => String(bt.battery_id) === String((b as any)?.id))?.end_percentage
              return val === null || val === undefined || Number.isNaN(Number(val)) ? '' : String(val)
            })(),
          })),
        }))
      }
    }

    run()
  }, [selectedDroneIds, droneDetails, logDronePayloads])

  const toApiTime = (t: string) => {
    if (!t) return undefined
    if (t.includes('Z')) return t
    const padded = t.length === 5 ? `${t}:00` : t
    return `${padded}.000Z`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!canUpdate) return

    const logId = Array.isArray(params.id) ? params.id[0] : params.id
    if (!logId) return

    if (!formData.folio.trim()) {
      toast({
        title: 'Faltan datos',
        description: 'Debe ingresar el folio de la bitácora.',
        variant: 'destructive',
      })
      return
    }
    if (!formData.ordenN) {
      toast({
        title: 'Faltan datos',
        description: 'Debe seleccionar una orden de vuelo.',
        variant: 'destructive',
      })
      return
    }
    if (!formData.fecha) {
      toast({
        title: 'Faltan datos',
        description: 'Debe seleccionar una fecha de vuelo.',
        variant: 'destructive',
      })
      return
    }

    const operatorId = selectedOrder?.operator?.id
    if (!operatorId) {
      toast({
        title: 'Faltan datos',
        description: 'La orden de vuelo seleccionada no tiene operador asignado.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      const droneIds = selectedDroneIds
        .filter(Boolean)
        .map((x) => Number(x))
        .filter((x) => Number.isFinite(x))

      const dronesPayload = selectedDroneIds
        .filter(Boolean)
        .map((droneId) => {
          const bats = droneBatteries[droneId] ?? []
          const batteries = bats
            .map((b) => ({
              battery_id: Number(b.key),
              start_percentage: b.inicio === '' ? NaN : Number(b.inicio),
              end_percentage: b.termino === '' ? NaN : Number(b.termino),
            }))
            .filter((b) => Number.isFinite(b.battery_id) && Number.isFinite(b.start_percentage) && Number.isFinite(b.end_percentage))

          return {
            drone_id: Number(droneId),
            batteries,
          }
        })
        .filter((d) => Number.isFinite(d.drone_id))

      const payload = {
        flight_order_id: Number(formData.ordenN),
        log_number: formData.folio.trim(),
        flight_date: formData.fecha,
        drones: dronesPayload.length ? dronesPayload : undefined,
        copilot_name: formData.copiloto,
        location: formData.lugar,
        departure_time_utc: toApiTime(formData.utcSalida),
        arrival_time_utc: toApiTime(formData.utcLlegada),
        departure_time_local: toApiTime(formData.gtmSalida),
        arrival_time_local: toApiTime(formData.gtmLlegada),
        flight_duration_minutes: formData.tiempoVuelo ? Number(formData.tiempoVuelo) : undefined,
        aerial_work_type: formData.trabajoAereo,
        activity_description: formData.actividadRealizada,
        comments: formData.comentarios,
      }

      const res = await FlightLogsService.updateLog(logId, payload)
      if (!res.success || !res.data) {
        toast({
          title: 'No se pudo actualizar',
          description: res.error || 'Error al actualizar la bitácora de vuelo.',
          variant: 'destructive',
        })
        return
      }

      toast({
        title: 'Bitácora actualizada',
        description: `Los datos de "${res.data.log_number}" han sido guardados exitosamente.`,
      })
      router.push('/bitacora-vuelo')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleBateriaChange = (index: number, field: 'inicio' | 'termino', value: string) => {
    setBaterias(prev => prev.map((bat, i) => 
      i === index ? { ...bat, [field]: value } : bat
    ))
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

  if (!bitacora) {
    return (
      <>
        <Header icon="menu_book" title="Bitácora de Vuelo" onMenuClick={toggle} />
        <div className="p-8 text-center">
          <p className="text-gray-500">Bitácora no encontrada</p>
          <Link href="/bitacora-vuelo" className="text-[#2c528c] hover:underline mt-2 inline-block">
            Volver al listado
          </Link>
        </div>
      </>
    )
  }

  return (
    <>
      <Header icon="menu_book" title="Bitácora de Vuelo" onMenuClick={toggle} />

      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full overflow-y-auto">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex mb-4">
          <ol className="inline-flex items-center space-x-1 md:space-x-3 text-xs text-gray-500 uppercase tracking-widest font-semibold">
            <li className="inline-flex items-center">
              <Link href="/bitacora-vuelo" className="hover:text-[#2c528c] transition-colors">Bitácoras</Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="material-symbols-outlined text-sm mx-1">chevron_right</span>
                <span className="text-slate-400">Editar {bitacora.log_number}</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Título */}
        <div className="mb-6 lg:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-gray-100">Editar Bitácora: {bitacora.log_number}</h2>
          <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-1">Modifique los datos del vuelo registrado.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <fieldset disabled={!canUpdate} className="contents">
          {/* Información General */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden mb-6">
            <div className="p-3 sm:p-4 bg-slate-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#2c528c]">assignment</span>
              <h3 className="font-bold text-slate-700 dark:text-gray-200 text-sm sm:text-base">Información General</h3>
            </div>
            <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
              <div>
                <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 sm:mb-2">Orden N°</label>
                <SearchableSelect<string>
                  value={formData.ordenN}
                  onChange={(v) => setFormData((prev) => ({ ...prev, ordenN: v }))}
                  options={[
                    { value: '', label: 'Seleccionar Orden' },
                    ...flightOrders.map((orden) => ({ value: String(orden.id), label: orden.order_number })),
                  ]}
                  placeholder="Seleccionar Orden"
                  searchPlaceholder="Buscar orden..."
                  triggerClassName="text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 sm:mb-2">Folio</label>
                <input
                  type="text"
                  name="folio"
                  value={formData.folio}
                  onChange={handleInputChange}
                  placeholder="Folio de bitácora"
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-[#2c528c] focus:border-[#2c528c]"
                />
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 sm:mb-2">Fecha</label>
                <input 
                  type="date"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-[#2c528c] focus:border-[#2c528c]"
                />
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 sm:mb-2">Lugar</label>
                <input 
                  type="text"
                  name="lugar"
                  value={formData.lugar}
                  onChange={handleInputChange}
                  placeholder="Ciudad / Aeródromo"
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-[#2c528c] focus:border-[#2c528c]"
                />
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 sm:mb-2">Operador (Piloto)</label>
                <input
                  type="text"
                  value={selectedOrder?.operator?.full_name ?? ''}
                  readOnly
                  className="w-full bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 sm:mb-2">Copiloto / Obs.</label>
                <input 
                  type="text"
                  name="copiloto"
                  value={formData.copiloto}
                  onChange={handleInputChange}
                  placeholder="Nombre completo"
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-[#2c528c] focus:border-[#2c528c]"
                />
              </div>
            </div>
          </div>

          {/* Equipos RPA y Baterías */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
            {/* Equipos RPA */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
              <div className="p-3 sm:p-4 bg-slate-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#2c528c]">precision_manufacturing</span>
                <h3 className="font-bold text-slate-700 dark:text-gray-200 text-sm sm:text-base">Equipos RPA</h3>
              </div>
              <div className="p-4 sm:p-6 space-y-4">
                {selectedDroneIds.map((value, idx) => {
                  const allDrones = (() => {
                    const map = new Map<string, DroneListItem>()
                    for (const d of [...logDrones, ...availableDrones]) map.set(String(d.id), d)
                    return Array.from(map.values())
                  })()
                  const selectedSet = new Set(selectedDroneIds.filter(Boolean))
                  const options = allDrones
                    .filter((d) => String(d.id) === String(value) || !selectedSet.has(String(d.id)))
                    .map((d) => ({
                      value: String(d.id),
                      label: `${d.brand ?? ''} ${d.model ?? ''} (${d.registration_number ?? ''})`.trim(),
                    }))

                  return (
                    <div key={idx} className="flex items-end gap-2">
                      <div className="flex-1">
                        <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 sm:mb-2">
                          Equipo {idx + 1}
                        </label>
                        <SearchableSelect<string>
                          value={value}
                          onChange={(v) => {
                            setSelectedDroneIds((prev) => {
                              const next = [...prev]
                              next[idx] = v
                              return next
                            })

                            setDroneBatteries((prev) => {
                              const prevId = value
                              if (!prevId || v) return prev
                              const { [prevId]: _, ...rest } = prev
                              return rest
                            })
                          }}
                          options={[{ value: '', label: 'Seleccionar' }, ...options]}
                          placeholder="Seleccionar"
                          searchPlaceholder="Buscar equipo..."
                          triggerClassName="text-xs"
                          disabled={!orderBranchId}
                        />
                      </div>

                      {selectedDroneIds.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const idToRemove = selectedDroneIds[idx]
                            setSelectedDroneIds((prev) => prev.filter((_, i) => i !== idx))
                            if (idToRemove) {
                              setDroneBatteries((prev) => {
                                const { [idToRemove]: _, ...rest } = prev
                                return rest
                              })
                            }
                          }}
                          className="h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-bold text-slate-600 hover:text-red-600 hover:border-red-200 dark:text-gray-300 dark:hover:text-red-400 transition-colors"
                        >
                          Quitar
                        </button>
                      )}
                    </div>
                  )
                })}

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDroneIds((prev) => [...prev, ''])}
                    disabled={!orderBranchId || selectedDroneIds.filter(Boolean).length >= availableDrones.length}
                    className="text-xs font-bold text-[#2c528c] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Agregar equipo
                  </button>
                </div>
              </div>
            </div>

            {/* Ciclos de Baterías */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
              <div className="p-3 sm:p-4 bg-slate-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#2c528c]">battery_charging_full</span>
                <h3 className="font-bold text-slate-700 dark:text-gray-200 text-sm sm:text-base">Ciclos de Baterías</h3>
              </div>
              <div className="p-4 sm:p-6">
                <div className="space-y-4">
                  {selectedDroneIds.filter(Boolean).map((droneId, index) => {
                    const detail = droneDetails[droneId]
                    const bats = droneBatteries[droneId] ?? []

                    return (
                      <div key={droneId} className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                          <div className="text-xs font-bold text-slate-700 dark:text-gray-200">
                            Equipo {index + 1}: {detail ? `${detail.brand ?? ''} ${detail.model ?? ''}`.trim() : 'Cargando...'}
                          </div>
                          <div className="text-[10px] text-gray-500 dark:text-gray-400 uppercase">
                            {detail?.registration_number ? `Registro: ${detail.registration_number}` : ''}
                          </div>
                        </div>

                        <div className="p-3 sm:p-4">
                          {bats.length ? (
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-800/50">
                                  <tr>
                                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] font-bold text-gray-500 uppercase">Batería</th>
                                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] font-bold text-gray-500 uppercase">Inicio (%)</th>
                                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] font-bold text-gray-500 uppercase">Término (%)</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                  {bats.map((bat, batIdx) => (
                                    <tr key={`${droneId}-${bat.key}`}>
                                      <td className="px-3 sm:px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300">{bat.label}</td>
                                      <td className="px-2 py-2">
                                        <input
                                          type="number"
                                          value={bat.inicio}
                                          onChange={(e) =>
                                            setDroneBatteries((prev) => ({
                                              ...prev,
                                              [droneId]: (prev[droneId] ?? []).map((x, i) => (i === batIdx ? { ...x, inicio: e.target.value } : x)),
                                            }))
                                          }
                                          placeholder="0"
                                          className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-xs focus:ring-[#2c528c] focus:border-[#2c528c]"
                                        />
                                      </td>
                                      <td className="px-2 py-2">
                                        <input
                                          type="number"
                                          value={bat.termino}
                                          onChange={(e) =>
                                            setDroneBatteries((prev) => ({
                                              ...prev,
                                              [droneId]: (prev[droneId] ?? []).map((x, i) => (i === batIdx ? { ...x, termino: e.target.value } : x)),
                                            }))
                                          }
                                          placeholder="0"
                                          className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-xs focus:ring-[#2c528c] focus:border-[#2c528c]"
                                        />
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="text-xs text-gray-500">
                              {detail ? 'Este equipo no tiene baterías registradas.' : 'Cargando baterías...'}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}

                  {!selectedDroneIds.filter(Boolean).length && (
                    <div className="text-xs text-gray-500 text-center">
                      Selecciona un equipo para ver sus baterías disponibles.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Registro de Tiempo */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden mb-6">
            <div className="p-3 sm:p-4 bg-slate-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#2c528c]">schedule</span>
              <h3 className="font-bold text-slate-700 dark:text-gray-200 text-sm sm:text-base">Registro de Tiempo</h3>
            </div>
            <div className="p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6">
              <div>
                <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 sm:mb-2">Hora Salida (UTC)</label>
                <input 
                  type="time"
                  name="utcSalida"
                  value={formData.utcSalida}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-xs focus:ring-[#2c528c] focus:border-[#2c528c]"
                />
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 sm:mb-2">Hora Llegada (UTC)</label>
                <input 
                  type="time"
                  name="utcLlegada"
                  value={formData.utcLlegada}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-xs focus:ring-[#2c528c] focus:border-[#2c528c]"
                />
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 sm:mb-2">Hora Salida (GTM)</label>
                <input 
                  type="time"
                  name="gtmSalida"
                  value={formData.gtmSalida}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-xs focus:ring-[#2c528c] focus:border-[#2c528c]"
                />
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 sm:mb-2">Hora Llegada (GTM)</label>
                <input 
                  type="time"
                  name="gtmLlegada"
                  value={formData.gtmLlegada}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-xs focus:ring-[#2c528c] focus:border-[#2c528c]"
                />
              </div>
              <div className="col-span-2 sm:col-span-1 bg-[#2c528c]/5 dark:bg-[#2c528c]/10 p-3 rounded-lg border border-[#2c528c]/20">
                <label className="block text-xs font-bold text-[#2c528c] dark:text-blue-400 mb-1.5 uppercase tracking-wider">T. Vuelo (Minutos)</label>
                <input 
                  type="number"
                  name="tiempoVuelo"
                  value={formData.tiempoVuelo}
                  onChange={handleInputChange}
                  placeholder="00"
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-xs font-bold text-[#2c528c] focus:ring-[#2c528c] focus:border-[#2c528c]"
                />
              </div>
            </div>
          </div>

          {/* Detalles de Operación */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden mb-6">
            <div className="p-3 sm:p-4 bg-slate-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#2c528c]">description</span>
              <h3 className="font-bold text-slate-700 dark:text-gray-200 text-sm sm:text-base">Detalles de Operación</h3>
            </div>
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div>
                <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 sm:mb-2">Trabajo Aéreo</label>
                <input 
                  type="text"
                  name="trabajoAereo"
                  value={formData.trabajoAereo}
                  onChange={handleInputChange}
                  placeholder="Tipo de misión realizada"
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-[#2c528c] focus:border-[#2c528c]"
                />
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 sm:mb-2">Actividad Realizada y Condiciones Operacionales</label>
                <textarea 
                  name="actividadRealizada"
                  value={formData.actividadRealizada}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Detalle la actividad y el clima/entorno..."
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-[#2c528c] focus:border-[#2c528c]"
                />
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 sm:mb-2">Comentarios y Endosos</label>
                <textarea 
                  name="comentarios"
                  value={formData.comentarios}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Notas adicionales o novedades técnicas..."
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-[#2c528c] focus:border-[#2c528c]"
                />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pb-8 sm:pb-12">
            <Link
              href="/bitacora-vuelo"
              className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors text-center"
            >
              Cancelar
            </Link>
            {canUpdate && (
              <button 
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto bg-[#2c528c] hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold px-8 sm:px-10 py-2.5 sm:py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
              >
                <span className="material-symbols-outlined text-xl">save</span>
                Guardar Cambios
              </button>
            )}
          </div>
          </fieldset>
        </form>
      </div>
    </>
  )
}

"use client"

import React from "react"

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { useSidebar } from '@/components/layout/dashboard-layout'
import { useToast } from '@/hooks/use-toast'
import { rpasDisponiblesMock } from '@/lib/mock-data'
import { FlightOrdersService, type FlightOrder } from '@/services/flight-orders.service'
import { UsersService, type User } from '@/services/users.service'
import { FlightLogsService, type FlightLog } from '@/services/flights-logs.service'
import { canAction, canView } from '@/lib/permissions'

export default function EditarBitacoraPage() {
  const router = useRouter()
  const params = useParams()
  const { toggle } = useSidebar()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [bitacora, setBitacora] = useState<FlightLog | null>(null)
  const [flightOrders, setFlightOrders] = useState<FlightOrder[]>([])
  const [operators, setOperators] = useState<User[]>([])
  const canRead = mounted && canView('bitacora_vuelo')
  const canUpdate = mounted && canAction('bitacora_vuelo', 'update')
  
  const [formData, setFormData] = useState({
    folio: '',
    ordenN: '',
    fecha: '',
    lugar: '',
    operador: '',
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
        setFormData({
          folio: b.log_number ?? '',
          ordenN: String(b.flight_order?.id ?? ''),
          fecha: b.flight_date ?? '',
          lugar: b.location ?? '',
          operador: String(b.operator?.id ?? ''),
          copiloto: b.copilot_name ?? '',
          rpa1Modelo: b.rpa1_model ?? '',
          rpa1Registro: b.rpa1_registration ?? '',
          rpa2Modelo: b.rpa2_model ?? '',
          rpa2Registro: b.rpa2_registration ?? '',
          utcSalida: b.departure_time_utc ? b.departure_time_utc.slice(0, 5) : '',
          utcLlegada: b.arrival_time_utc ? b.arrival_time_utc.slice(0, 5) : '',
          gtmSalida: b.departure_time_local ? b.departure_time_local.slice(0, 5) : '',
          gtmLlegada: b.arrival_time_local ? b.arrival_time_local.slice(0, 5) : '',
          tiempoVuelo: String(b.flight_duration_minutes ?? ''),
          trabajoAereo: b.aerial_work_type ?? '',
          actividadRealizada: b.activity_description ?? '',
          comentarios: b.comments ?? '',
        })

        setBaterias([
          { bateria: 'BATERÍA 1', inicio: b.battery1_start != null ? String(b.battery1_start) : '', termino: b.battery1_end != null ? String(b.battery1_end) : '' },
          { bateria: 'BATERÍA 2', inicio: b.battery2_start != null ? String(b.battery2_start) : '', termino: b.battery2_end != null ? String(b.battery2_end) : '' },
          { bateria: 'BATERÍA 3', inicio: b.battery3_start != null ? String(b.battery3_start) : '', termino: b.battery3_end != null ? String(b.battery3_end) : '' },
        ])
      } finally {
        setLoading(false)
      }
    }

    loadLog()
  }, [mounted, canRead, params.id])

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
    if (!formData.operador) {
      toast({
        title: 'Faltan datos',
        description: 'Debe seleccionar un operador.',
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

    setLoading(true)
    try {
      const payload = {
        flight_order_id: Number(formData.ordenN),
        log_number: formData.folio.trim(),
        flight_date: formData.fecha,
        copilot_name: formData.copiloto,
        location: formData.lugar,
        rpa1_model: formData.rpa1Modelo,
        rpa1_registration: formData.rpa1Registro,
        rpa2_model: formData.rpa2Modelo,
        rpa2_registration: formData.rpa2Registro,
        battery1_start: baterias[0]?.inicio ? Number(baterias[0].inicio) : undefined,
        battery1_end: baterias[0]?.termino ? Number(baterias[0].termino) : undefined,
        battery2_start: baterias[1]?.inicio ? Number(baterias[1].inicio) : undefined,
        battery2_end: baterias[1]?.termino ? Number(baterias[1].termino) : undefined,
        battery3_start: baterias[2]?.inicio ? Number(baterias[2].inicio) : undefined,
        battery3_end: baterias[2]?.termino ? Number(baterias[2].termino) : undefined,
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
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-3 sm:p-4 bg-slate-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#2c528c]">assignment</span>
              <h3 className="font-bold text-slate-700 dark:text-gray-200 text-sm sm:text-base">Información General</h3>
            </div>
            <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Folio</label>
                <input
                  type="text"
                  name="folio"
                  value={formData.folio}
                  onChange={handleInputChange}
                  placeholder="Folio de bitácora"
                  className="w-full rounded-lg border-gray-300 dark:border-gray-700 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-sm dark:bg-gray-800 dark:text-gray-200"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Orden N°</label>
                <select 
                  name="ordenN"
                  value={formData.ordenN}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border-gray-300 dark:border-gray-700 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-sm dark:bg-gray-800 dark:text-gray-200"
                >
                  <option value="">Seleccionar Orden</option>
                  {flightOrders.map((orden) => (
                    <option key={orden.id} value={orden.id}>{orden.order_number}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Fecha</label>
                <input 
                  type="date"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border-gray-300 dark:border-gray-700 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-sm dark:bg-gray-800 dark:text-gray-200"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Lugar</label>
                <input 
                  type="text"
                  name="lugar"
                  value={formData.lugar}
                  onChange={handleInputChange}
                  placeholder="Ciudad / Aeródromo"
                  className="w-full rounded-lg border-gray-300 dark:border-gray-700 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-sm dark:bg-gray-800 dark:text-gray-200"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Operador (Piloto)</label>
                <select 
                  name="operador"
                  value={formData.operador}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border-gray-300 dark:border-gray-700 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-sm dark:bg-gray-800 dark:text-gray-200"
                >
                  <option value="">Seleccionar Operador</option>
                  {operators
                    .filter((u) => String(u.groups?.[0]?.name ?? '').toLowerCase() === 'operador')
                    .map((op) => (
                      <option key={op.id} value={op.id}>{op.first_name} {op.last_name}</option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Copiloto / Obs.</label>
                <input 
                  type="text"
                  name="copiloto"
                  value={formData.copiloto}
                  onChange={handleInputChange}
                  placeholder="Nombre completo"
                  className="w-full rounded-lg border-gray-300 dark:border-gray-700 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-sm dark:bg-gray-800 dark:text-gray-200"
                />
              </div>
            </div>
          </div>

          {/* Equipos RPA y Baterías */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Equipos RPA */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
              <div className="p-3 sm:p-4 bg-slate-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#2c528c]">precision_manufacturing</span>
                <h3 className="font-bold text-slate-700 dark:text-gray-200 text-sm sm:text-base">Equipos RPA</h3>
              </div>
              <div className="p-4 sm:p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">RPA 1 (Modelo)</label>
                    <select 
                      name="rpa1Modelo"
                      value={formData.rpa1Modelo}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border-gray-300 dark:border-gray-700 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-sm dark:bg-gray-800 dark:text-gray-200"
                    >
                      <option value="">Seleccionar</option>
                      {rpasDisponiblesMock.map(rpa => (
                        <option key={rpa.value} value={rpa.label}>{rpa.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Registro RPA 1</label>
                    <input 
                      type="text"
                      name="rpa1Registro"
                      value={formData.rpa1Registro}
                      onChange={handleInputChange}
                      placeholder="DGAC-XXXX"
                      className="w-full rounded-lg border-gray-300 dark:border-gray-700 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-sm dark:bg-gray-800 dark:text-gray-200"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">RPA 2 (Modelo)</label>
                    <select 
                      name="rpa2Modelo"
                      value={formData.rpa2Modelo}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border-gray-300 dark:border-gray-700 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-sm dark:bg-gray-800 dark:text-gray-200"
                    >
                      <option value="">Seleccionar</option>
                      {rpasDisponiblesMock.map(rpa => (
                        <option key={rpa.value} value={rpa.label}>{rpa.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Registro RPA 2</label>
                    <input 
                      type="text"
                      name="rpa2Registro"
                      value={formData.rpa2Registro}
                      onChange={handleInputChange}
                      placeholder="DGAC-YYYY"
                      className="w-full rounded-lg border-gray-300 dark:border-gray-700 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-sm dark:bg-gray-800 dark:text-gray-200"
                    />
                  </div>
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
                <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                      <tr>
                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] font-bold text-gray-500 uppercase">Batería</th>
                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] font-bold text-gray-500 uppercase">Inicio (%)</th>
                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] font-bold text-gray-500 uppercase">Término (%)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {baterias.map((bat, index) => (
                        <tr key={bat.bateria}>
                          <td className="px-3 sm:px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300">{bat.bateria}</td>
                          <td className="px-2 py-2">
                            <input 
                              type="number"
                              value={bat.inicio}
                              onChange={(e) => handleBateriaChange(index, 'inicio', e.target.value)}
                              placeholder="0"
                              className="w-full rounded-lg border-gray-300 dark:border-gray-700 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-xs dark:bg-gray-800 dark:text-gray-200"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input 
                              type="number"
                              value={bat.termino}
                              onChange={(e) => handleBateriaChange(index, 'termino', e.target.value)}
                              placeholder="0"
                              className="w-full rounded-lg border-gray-300 dark:border-gray-700 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-xs dark:bg-gray-800 dark:text-gray-200"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Registro de Tiempo */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-3 sm:p-4 bg-slate-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#2c528c]">schedule</span>
              <h3 className="font-bold text-slate-700 dark:text-gray-200 text-sm sm:text-base">Registro de Tiempo</h3>
            </div>
            <div className="p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Hora Salida (UTC)</label>
                <input 
                  type="time"
                  name="utcSalida"
                  value={formData.utcSalida}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border-gray-300 dark:border-gray-700 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-sm dark:bg-gray-800 dark:text-gray-200"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Hora Llegada (UTC)</label>
                <input 
                  type="time"
                  name="utcLlegada"
                  value={formData.utcLlegada}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border-gray-300 dark:border-gray-700 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-sm dark:bg-gray-800 dark:text-gray-200"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Hora Salida (GTM)</label>
                <input 
                  type="time"
                  name="gtmSalida"
                  value={formData.gtmSalida}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border-gray-300 dark:border-gray-700 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-sm dark:bg-gray-800 dark:text-gray-200"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Hora Llegada (GTM)</label>
                <input 
                  type="time"
                  name="gtmLlegada"
                  value={formData.gtmLlegada}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border-gray-300 dark:border-gray-700 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-sm dark:bg-gray-800 dark:text-gray-200"
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
                  className="w-full rounded-lg border-gray-300 dark:border-gray-700 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-sm font-bold text-[#2c528c] dark:bg-gray-800 dark:text-blue-400"
                />
              </div>
            </div>
          </div>

          {/* Detalles de Operación */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-3 sm:p-4 bg-slate-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#2c528c]">description</span>
              <h3 className="font-bold text-slate-700 dark:text-gray-200 text-sm sm:text-base">Detalles de Operación</h3>
            </div>
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Trabajo Aéreo</label>
                <input 
                  type="text"
                  name="trabajoAereo"
                  value={formData.trabajoAereo}
                  onChange={handleInputChange}
                  placeholder="Tipo de misión realizada"
                  className="w-full rounded-lg border-gray-300 dark:border-gray-700 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-sm dark:bg-gray-800 dark:text-gray-200"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Actividad Realizada y Condiciones Operacionales</label>
                <textarea 
                  name="actividadRealizada"
                  value={formData.actividadRealizada}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Detalle la actividad y el clima/entorno..."
                  className="w-full rounded-lg border-gray-300 dark:border-gray-700 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-sm dark:bg-gray-800 dark:text-gray-200"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Comentarios y Endosos</label>
                <textarea 
                  name="comentarios"
                  value={formData.comentarios}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Notas adicionales o novedades técnicas..."
                  className="w-full rounded-lg border-gray-300 dark:border-gray-700 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-sm dark:bg-gray-800 dark:text-gray-200"
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
                className="w-full sm:w-auto bg-[#2c528c] hover:bg-blue-800 text-white text-sm font-bold px-8 sm:px-10 py-2.5 sm:py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
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

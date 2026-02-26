"use client"

import React from "react"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { useSidebar } from '@/components/layout/dashboard-layout'
import { useToast } from '@/hooks/use-toast'
import { tiposTrabajoAereoMock } from '@/lib/mock-data'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { CompanyService, type CompanyListItem } from '@/services/company.service'
import { BranchService, type Branch } from '@/services/branches.service'
import { UsersService, type User } from '@/services/users.service'
import { FlightOrdersService, type FlightOrderStatus } from '@/services/flight-orders.service'
import { canAction } from '@/lib/permissions'

export default function NuevaOrdenVueloPage() {
  const router = useRouter()
  const { toggle } = useSidebar()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [companies, setCompanies] = useState<CompanyListItem[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [operators, setOperators] = useState<User[]>([])

  useEffect(() => {
    setMounted(true)
  }, [])

  const canCreate = mounted && canAction('ordenes_vuelo', 'create')
  const [formData, setFormData] = useState({
    empresa: '',
    sucursal: '',
    numeroOrden: '',
    piloto: '',
    observador: '',
    rpa: '',
    tipoVuelo: '',
    fecha: '',
    trabajoAereo: '',
    lugar: '',
    trabajo: '',
    utcActividad: '',
    notam: '',
    areaGeografica: '',
    areasPeligrosas: '',
    gerenteResponsable: '',
    estado: 'PENDING' as FlightOrderStatus,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  useEffect(() => {
    if (!mounted || !canCreate) return

    const load = async () => {
      const companiesRes = await CompanyService.getCompanies({ page: 1, page_size: 1000 })

      if (companiesRes.success && companiesRes.data?.results) {
        setCompanies(companiesRes.data.results)
      }
    }

    load()
  }, [mounted, canCreate])

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

  const loadOperators = async (branchId: string) => {
    if (!branchId) {
      setOperators([])
      return
    }

    const res = await UsersService.getUsers({ page: 1, page_size: 1000, branch_id: branchId })
    if (!res.success || !res.data?.results) {
      toast({
        title: 'No se pudieron cargar los operadores',
        description: res.error || 'Error al obtener operadores.',
        variant: 'destructive',
      })
      setOperators([])
      return
    }

    const ops = res.data.results.filter((u) => String(u.groups?.[0]?.name ?? '').toLowerCase() === 'operador')
    setOperators(ops)
  }

  useEffect(() => {
    if (!mounted || !canCreate) return
    loadBranches(formData.empresa)
  }, [mounted, canCreate, formData.empresa])

  useEffect(() => {
    if (!mounted || !canCreate) return
    loadOperators(formData.sucursal)
  }, [mounted, canCreate, formData.sucursal])

  const operadoresFiltrados = operators

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!canCreate) return

    if (!formData.empresa) {
      toast({
        title: 'Faltan datos',
        description: 'Debe seleccionar una empresa.',
        variant: 'destructive',
      })
      return
    }
    if (!formData.sucursal) {
      toast({
        title: 'Faltan datos',
        description: 'Debe seleccionar una sucursal.',
        variant: 'destructive',
      })
      return
    }
    if (!formData.numeroOrden.trim()) {
      toast({
        title: 'Faltan datos',
        description: 'Debe ingresar el número de orden.',
        variant: 'destructive',
      })
      return
    }
    if (!formData.piloto) {
      toast({
        title: 'Faltan datos',
        description: 'Debe seleccionar un piloto (operador).',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      const res = await FlightOrdersService.createOrder({
        branch_id: Number(formData.sucursal),
        order_number: formData.numeroOrden.trim(),
        operator_id: Number(formData.piloto),
        observer_name: formData.observador,
        rpa_identifier: formData.rpa,
        flight_type: formData.tipoVuelo,
        scheduled_date: formData.fecha,
        aerial_work_type: formData.trabajoAereo,
        location: formData.lugar,
        work_description: formData.trabajo,
        utc_activity_time: formData.utcActividad,
        notam_reference: formData.notam,
        geographic_area: formData.areaGeografica,
        restricted_areas: formData.areasPeligrosas,
        responsible_manager: formData.gerenteResponsable,
        status: formData.estado,
      })

      if (!res.success || !res.data) {
        toast({
          title: 'No se pudo crear la orden',
          description: res.error || 'Error al crear la orden de vuelo.',
          variant: 'destructive',
        })
        return
      }

      toast({
        title: 'Orden de vuelo creada',
        description: `La orden "${res.data.order_number}" ha sido creada exitosamente.`,
      })
      router.push('/ordenes-vuelo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header icon="assignment_add" title="Órdenes de Vuelo" onMenuClick={toggle} />

      {mounted && !canCreate ? (
        <div className="p-8 text-center">
          <p className="text-gray-500">No tienes permisos para crear registros en esta sección.</p>
        </div>
      ) : (

      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="inline-flex items-center space-x-1 md:space-x-3 text-xs text-gray-500 uppercase tracking-widest font-semibold">
            <li className="inline-flex items-center">
              <Link href="/ordenes-vuelo" className="hover:text-[#2c528c] transition-colors">
                Órdenes de Vuelo
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="material-symbols-outlined text-sm mx-1">chevron_right</span>
                <span className="text-slate-400">Nueva Orden</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Title */}
        <div className="mb-6 lg:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-gray-100">Crear Nueva Orden de Vuelo</h2>
          <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-1">
            Complete los detalles para generar la planificación de la misión de vuelo.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <fieldset disabled={!canCreate} className="contents">
          {/* Información General */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden mb-6">
            <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#2c528c]">info</span>
              <h3 className="font-bold text-slate-700 dark:text-gray-200 text-sm sm:text-base">Información General</h3>
            </div>
            <div className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div>
                <label htmlFor="numeroOrden" className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 sm:mb-2">
                  Número de orden
                </label>
                <input
                  type="text"
                  id="numeroOrden"
                  name="numeroOrden"
                  value={formData.numeroOrden}
                  onChange={handleChange}
                  placeholder="Ej: OV-0001"
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-[#2c528c] focus:border-[#2c528c]"
                />
              </div>
              <div>
                <label htmlFor="empresa" className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 sm:mb-2">
                  Empresa
                </label>
                <SearchableSelect
                  value={formData.empresa || null}
                  onChange={(v) => {
                    setFormData((prev) => ({ ...prev, empresa: String(v), sucursal: '', piloto: '' }))
                  }}
                  options={companies.map((c) => ({ value: String(c.id), label: c.name }))}
                  placeholder="Seleccione una empresa"
                  searchPlaceholder="Buscar empresa..."
                />
              </div>

              <div>
                <label htmlFor="sucursal" className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 sm:mb-2">
                  Sucursal
                </label>
                <SearchableSelect
                  value={formData.sucursal || null}
                  onChange={(v) => setFormData((prev) => ({ ...prev, sucursal: String(v), piloto: '' }))}
                  options={branches.map((b) => ({ value: String(b.id), label: b.name }))}
                  placeholder="Seleccione una sucursal"
                  searchPlaceholder="Buscar sucursal..."
                  disabled={!formData.empresa}
                />
              </div>
              
              <div>
                <label htmlFor="piloto" className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 sm:mb-2">
                  Piloto
                </label>
                <SearchableSelect
                  value={formData.piloto || null}
                  onChange={(v) => setFormData((prev) => ({ ...prev, piloto: String(v) }))}
                  options={operadoresFiltrados.map((op) => ({
                    value: String(op.id),
                    label: `${op.first_name ?? ''} ${op.last_name ?? ''}`.trim() || op.email,
                  }))}
                  placeholder="Seleccione un piloto"
                  searchPlaceholder="Buscar piloto..."
                  disabled={!formData.sucursal}
                />
              </div>
              <div>
                <label htmlFor="estado" className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 sm:mb-2">
                  Estado
                </label>
                <select
                  id="estado"
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-[#2c528c] focus:border-[#2c528c]"
                >
                  <option value="PENDING">Pendiente</option>
                  <option value="IN_FLIGHT">En vuelo</option>
                  <option value="COMPLETED">Completado</option>
                </select>
              </div>
              <div>
                <label htmlFor="observador" className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 sm:mb-2">
                  Observador
                </label>
                <input
                  type="text"
                  id="observador"
                  name="observador"
                  value={formData.observador}
                  onChange={handleChange}
                  placeholder="Nombre del observador"
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-[#2c528c] focus:border-[#2c528c]"
                />
              </div>
              <div>
                <label htmlFor="rpa" className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 sm:mb-2">
                  RPA
                </label>
                <input
                  type="text"
                  id="rpa"
                  name="rpa"
                  value={formData.rpa}
                  onChange={handleChange}
                  placeholder="Identificación del RPA"
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-[#2c528c] focus:border-[#2c528c]"
                />
              </div>
              <div>
                <label htmlFor="tipoVuelo" className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 sm:mb-2">
                  Tipo de vuelo
                </label>
                <input
                  type="text"
                  id="tipoVuelo"
                  name="tipoVuelo"
                  value={formData.tipoVuelo}
                  onChange={handleChange}
                  placeholder="Ej: Fotogrametría"
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-[#2c528c] focus:border-[#2c528c]"
                />
              </div>
              <div>
                <label htmlFor="fecha" className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 sm:mb-2">
                  Fecha
                </label>
                <input
                  type="date"
                  id="fecha"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleChange}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-[#2c528c] focus:border-[#2c528c]"
                />
              </div>
              <div>
                <label htmlFor="trabajoAereo" className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 sm:mb-2">
                  Trabajo aéreo
                </label>
                <select
                  id="trabajoAereo"
                  name="trabajoAereo"
                  value={formData.trabajoAereo}
                  onChange={handleChange}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-[#2c528c] focus:border-[#2c528c]"
                >
                  <option value="">Seleccione tipo de trabajo</option>
                  {tiposTrabajoAereoMock.map((tipo) => (
                    <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Detalles de Operación y Zona */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#2c528c]">map</span>
              <h3 className="font-bold text-slate-700 dark:text-gray-200 text-sm sm:text-base">Detalles de Operación y Zona</h3>
            </div>
            <div className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label htmlFor="lugar" className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 sm:mb-2">
                  Lugar
                </label>
                <input
                  type="text"
                  id="lugar"
                  name="lugar"
                  value={formData.lugar}
                  onChange={handleChange}
                  placeholder="Ubicación de despegue/operación"
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-[#2c528c] focus:border-[#2c528c]"
                />
              </div>
              <div>
                <label htmlFor="trabajo" className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 sm:mb-2">
                  Trabajo
                </label>
                <input
                  type="text"
                  id="trabajo"
                  name="trabajo"
                  value={formData.trabajo}
                  onChange={handleChange}
                  placeholder="Especificación técnica"
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-[#2c528c] focus:border-[#2c528c]"
                />
              </div>
              <div>
                <label htmlFor="utcActividad" className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 sm:mb-2">
                  UTC actividad
                </label>
                <input
                  type="text"
                  id="utcActividad"
                  name="utcActividad"
                  value={formData.utcActividad}
                  onChange={handleChange}
                  placeholder="Ej: 14:00 - 18:00 UTC"
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-[#2c528c] focus:border-[#2c528c]"
                />
              </div>
              <div>
                <label htmlFor="notam" className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 sm:mb-2">
                  Notam
                </label>
                <input
                  type="text"
                  id="notam"
                  name="notam"
                  value={formData.notam}
                  onChange={handleChange}
                  placeholder="Referencia NOTAM si aplica"
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-[#2c528c] focus:border-[#2c528c]"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="areaGeografica" className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 sm:mb-2">
                  Área geográfica
                </label>
                <textarea
                  id="areaGeografica"
                  name="areaGeografica"
                  value={formData.areaGeografica}
                  onChange={handleChange}
                  placeholder="Coordenadas o límites del polígono"
                  rows={2}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-[#2c528c] focus:border-[#2c528c]"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="areasPeligrosas" className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 sm:mb-2">
                  Áreas prohibidas o peligrosas
                </label>
                <textarea
                  id="areasPeligrosas"
                  name="areasPeligrosas"
                  value={formData.areasPeligrosas}
                  onChange={handleChange}
                  placeholder="Identificación de restricciones en la zona"
                  rows={2}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-[#2c528c] focus:border-[#2c528c]"
                />
              </div>
              <div>
                <label htmlFor="gerenteResponsable" className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 sm:mb-2">
                  Gerente responsable
                </label>
                <input
                  type="text"
                  id="gerenteResponsable"
                  name="gerenteResponsable"
                  value={formData.gerenteResponsable}
                  onChange={handleChange}
                  placeholder="Nombre de autoridad a cargo"
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-[#2c528c] focus:border-[#2c528c]"
                />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pb-8 sm:pb-12">
            <Link
              href="/ordenes-vuelo"
              className="w-full sm:w-auto px-6 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors text-center"
            >
              Cancelar
            </Link>
            {canCreate && (
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto bg-[#2c528c] hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold px-6 sm:px-8 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
              >
                <span className="material-symbols-outlined text-lg sm:text-xl">save</span>
                Guardar Orden
              </button>
            )}
          </div>
          </fieldset>
        </form>
      </div>
      )}
    </>
  )
}

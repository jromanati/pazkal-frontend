"use client"

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { useSidebar } from '@/components/layout/dashboard-layout'
import { useToast } from '@/hooks/use-toast'
import { CompanyService, type CompanyListItem } from '@/services/company.service'
import { BranchService, type Branch } from '@/services/branches.service'
import { DronesService, type DroneDetail } from '@/services/drones.service'

interface BateriaForm {
  id: string;
  nombre: string;
  ciclos: string;
}

export default function EditarEquipoPage() {
  const router = useRouter()
  const params = useParams()
  const { toggle } = useSidebar()
  const { toast } = useToast()

  const [equipo, setEquipo] = useState<DroneDetail | null>(null)
  const [companies, setCompanies] = useState<CompanyListItem[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const prevEmpresaIdRef = useRef<string>('')
  const [form, setForm] = useState({
    numeroRegistro: '',
    marca: '',
    modelo: '',
    numeroSerie: '',
    pesoMaxDespegue: '',
    empresaId: '',
    sucursalId: '',
    tieneParacaidas: false,
    paracaidasMarca: '',
    paracaidasModelo: '',
    paracaidasPeso: '',
    notas: '',
  })
  const [baterias, setBaterias] = useState<BateriaForm[]>([])

  const droneId = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : ''

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

  useEffect(() => {
    loadCompanies()
  }, [])

  useEffect(() => {
    loadBranches(form.empresaId)

    // Solo resetear sucursal si el cambio de empresa viene del usuario.
    // En carga inicial, el backend ya entrega branch_id.
    if (prevEmpresaIdRef.current && prevEmpresaIdRef.current !== form.empresaId) {
      setForm(prev => ({ ...prev, sucursalId: '' }))
    }
    prevEmpresaIdRef.current = form.empresaId
  }, [form.empresaId])

  useEffect(() => {
    ;(async () => {
      if (!droneId) return
      const res = await DronesService.getDrone(droneId)
      if (!res.success || !res.data) {
        toast({
          title: 'No se pudo cargar el equipo',
          description: res.error || 'Error al obtener el equipo.',
          variant: 'destructive',
        })
        return
      }

      const d = res.data
      setEquipo(d)

      const formatDecimalForInput = (v: unknown) => String(v ?? '').replace('.', ',')
      setForm({
        numeroRegistro: d.registration_number || '',
        marca: d.brand || '',
        modelo: d.model || '',
        numeroSerie: d.serial_number || '',
        pesoMaxDespegue: formatDecimalForInput(d.max_takeoff_weight_kg),
        empresaId: d.company_id ? String(d.company_id) : '',
        sucursalId: d.branch_id ? String(d.branch_id) : '',
        tieneParacaidas: Boolean(d.has_parachute),
        paracaidasMarca: d?.parachute?.brand || '',
        paracaidasModelo: d?.parachute?.model || '',
        paracaidasPeso: formatDecimalForInput(d?.parachute?.resistance_weight_kg),
        notas: d.notes || '',
      })

      const apiBatteries = Array.isArray(d.batteries) ? d.batteries : []
      setBaterias(
        apiBatteries.length
          ? apiBatteries.map((b: any) => ({
              id: `${b?.id ?? Date.now()}-${Math.random()}`,
              nombre: String(b?.name ?? b ?? ''),
              ciclos: String(b?.cycle_count ?? ''),
            }))
          : [{ id: '1', nombre: '', ciclos: '' }],
      )
    })()
  }, [droneId])

  const sanitizeDecimalInput = (value: string) => {
    const cleaned = value.replace(/[^0-9,]/g, '')
    const parts = cleaned.split(',')
    if (parts.length <= 1) return cleaned
    return `${parts[0]},${parts.slice(1).join('').slice(0, 2)}`
  }

  const toApiDecimal = (value: string) => value.replace(',', '.').trim()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      setForm({ ...form, [name]: (e.target as HTMLInputElement).checked })
    } else {
      if (name === 'pesoMaxDespegue' || name === 'paracaidasPeso') {
        setForm({ ...form, [name]: sanitizeDecimalInput(value) })
      } else {
        setForm({ ...form, [name]: value })
      }
    }
  }

  const addBateria = () => {
    setBaterias([...baterias, { id: Date.now().toString(), nombre: '', ciclos: '' }])
  }

  const removeBateria = (id: string) => {
    if (baterias.length > 1) setBaterias(baterias.filter(b => b.id !== id))
  }

  const updateBateria = (id: string, field: 'nombre' | 'ciclos', value: string) => {
    if (field === 'ciclos') {
      const cleaned = value.replace(/\D/g, '').slice(0, 3)
      setBaterias(baterias.map(b => b.id === id ? { ...b, [field]: cleaned } : b))
    } else {
      setBaterias(baterias.map(b => b.id === id ? { ...b, [field]: value } : b))
    }
  }

  const handleSubmit = () => {
    ;(async () => {
      if (!droneId) return
      if (!form.sucursalId) {
        toast({
          title: 'Faltan datos',
          description: 'Debe seleccionar una sucursal.',
          variant: 'destructive',
        })
        return
      }

      setIsSaving(true)
      try {
        const payload = {
          branch_id: Number(form.sucursalId),
          registration_number: form.numeroRegistro,
          brand: form.marca,
          model: form.modelo,
          serial_number: form.numeroSerie,
          max_takeoff_weight_kg: toApiDecimal(form.pesoMaxDespegue),
          has_parachute: form.tieneParacaidas,
          notes: form.notas || '',
          batteries: baterias
            .filter(b => b.nombre.trim() !== '')
            .map(b => ({
              name: b.nombre,
              cycle_count: Number(b.ciclos || '0'),
            })),
          parachute: form.tieneParacaidas
            ? {
                brand: form.paracaidasMarca || '',
                model: form.paracaidasModelo || '',
                resistance_weight_kg: toApiDecimal(form.paracaidasPeso) || '',
              }
            : undefined,
        }

        const res = await DronesService.updateDrone(droneId, payload)
        if (!res.success) {
          toast({
            title: 'No se pudo actualizar el equipo',
            description: res.error || 'Error al actualizar equipo.',
            variant: 'destructive',
          })
          return
        }

        toast({
          title: 'Equipo actualizado',
          description: `El equipo "${form.marca} ${form.modelo}" ha sido actualizado exitosamente.`,
        })
        router.push('/equipos')
      } finally {
        setIsSaving(false)
      }
    })()
  }

  if (!equipo) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">search_off</span>
          <p className="text-gray-500">Equipo no encontrado</p>
          <Link href="/equipos" className="text-[#2c528c] hover:underline mt-2 inline-block">Volver al listado</Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <Header icon="drone" title={`Editar: ${equipo.brand} ${equipo.model}`} onMenuClick={toggle} />

      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full">
        {/* Title bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 lg:mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-gray-100">Ficha del Equipo</h2>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">Edite la informacion tecnica del drone.</p>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <Link href="/equipos" className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors text-center">Cancelar</Link>
            <button
              onClick={handleSubmit}
              disabled={isSaving}
              className="flex-1 sm:flex-none bg-[#2c528c] hover:bg-blue-800 disabled:opacity-60 text-white text-xs sm:text-sm font-semibold px-4 sm:px-6 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-md"
            >
              <span className="material-symbols-outlined text-base sm:text-lg">save</span> Guardar
            </button>
          </div>
        </div>

        {/* Informacion General */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="px-5 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-sm font-bold text-slate-800 dark:text-gray-200 flex items-center gap-2">
              <span className="material-symbols-outlined text-lg text-[#2c528c]">info</span>
              Informacion General
            </h3>
          </div>
          <div className="p-5 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Numero de Registro</label>
                <input name="numeroRegistro" value={form.numeroRegistro} onChange={handleChange} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:ring-[#2c528c] focus:border-[#2c528c]" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Marca</label>
                <input name="marca" value={form.marca} onChange={handleChange} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:ring-[#2c528c] focus:border-[#2c528c]" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Modelo</label>
                <input name="modelo" value={form.modelo} onChange={handleChange} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:ring-[#2c528c] focus:border-[#2c528c]" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Numero de Serie</label>
                <input name="numeroSerie" value={form.numeroSerie} onChange={handleChange} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:ring-[#2c528c] focus:border-[#2c528c]" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Peso Maximo de Despegue</label>
                <input name="pesoMaxDespegue" value={form.pesoMaxDespegue} onChange={handleChange} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:ring-[#2c528c] focus:border-[#2c528c]" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Empresa</label>
                <select name="empresaId" value={form.empresaId} onChange={handleChange} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:ring-[#2c528c] focus:border-[#2c528c]">
                  <option value="">Seleccionar empresa</option>
                  {companies.map(e => (
                    <option key={e.id} value={String(e.id)}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Sucursal</label>
                <select
                  name="sucursalId"
                  value={form.sucursalId}
                  onChange={handleChange}
                  disabled={!form.empresaId}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:ring-[#2c528c] focus:border-[#2c528c] disabled:opacity-60"
                >
                  <option value="">Seleccionar sucursal</option>
                  {branches.map(b => (
                    <option key={b.id} value={String(b.id)}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Notas */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="px-5 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-sm font-bold text-slate-800 dark:text-gray-200 flex items-center gap-2">
              <span className="material-symbols-outlined text-lg text-[#2c528c]">notes</span>
              Notas
            </h3>
          </div>
          <div className="p-5 sm:p-6">
            <input
              name="notas"
              value={form.notas}
              onChange={handleChange}
              placeholder="Observaciones, mantenimiento, etc."
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:ring-[#2c528c] focus:border-[#2c528c]"
            />
          </div>
        </div>

        {/* Baterias */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="px-5 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-gray-200 flex items-center gap-2">
              <span className="material-symbols-outlined text-lg text-[#2c528c]">battery_full</span>
              Baterias ({baterias.length})
            </h3>
            <button type="button" onClick={addBateria} className="text-xs font-semibold text-[#2c528c] hover:text-blue-800 flex items-center gap-1 transition-colors">
              <span className="material-symbols-outlined text-base">add_circle</span> Agregar bateria
            </button>
          </div>
          <div className="p-5 sm:p-6 space-y-4">
            {baterias.map((bat, idx) => (
              <div key={bat.id} className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-end p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                <div className="flex-shrink-0 flex items-center justify-center size-8 rounded-full bg-[#2c528c]/10 text-[#2c528c] text-xs font-bold">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Nombre / Identificador</label>
                  <input value={bat.nombre} onChange={(e) => updateBateria(bat.id, 'nombre', e.target.value)} placeholder="Ej: TB60-001" className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-[#2c528c] focus:border-[#2c528c]" />
                </div>
                <div className="w-full sm:w-32">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Ciclos</label>
                  <input value={bat.ciclos} onChange={(e) => updateBateria(bat.id, 'ciclos', e.target.value)} placeholder="000" maxLength={3} className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-center font-mono focus:ring-[#2c528c] focus:border-[#2c528c]" />
                </div>
                <button type="button" onClick={() => removeBateria(bat.id)} disabled={baterias.length <= 1} className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors self-center sm:self-auto">
                  <span className="material-symbols-outlined text-lg">remove_circle</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Paracaidas */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="px-5 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-sm font-bold text-slate-800 dark:text-gray-200 flex items-center gap-2">
              <span className="material-symbols-outlined text-lg text-[#2c528c]">paragliding</span>
              Paracaidas
            </h3>
          </div>
          <div className="p-5 sm:p-6">
            <label className="flex items-center gap-3 cursor-pointer mb-6">
              <div className="relative">
                <input type="checkbox" name="tieneParacaidas" checked={form.tieneParacaidas} onChange={handleChange} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer-checked:bg-[#2c528c] transition-colors" />
                <div className="absolute left-0.5 top-0.5 size-5 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform" />
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-gray-300">El equipo tiene paracaidas</span>
            </label>

            {form.tieneParacaidas && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-top-2 duration-200">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Marca</label>
                  <input name="paracaidasMarca" value={form.paracaidasMarca} onChange={handleChange} className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:ring-[#2c528c] focus:border-[#2c528c]" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Modelo</label>
                  <input name="paracaidasModelo" value={form.paracaidasModelo} onChange={handleChange} className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:ring-[#2c528c] focus:border-[#2c528c]" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Peso de Resistencia</label>
                  <input name="paracaidasPeso" value={form.paracaidasPeso} onChange={handleChange} className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:ring-[#2c528c] focus:border-[#2c528c]" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

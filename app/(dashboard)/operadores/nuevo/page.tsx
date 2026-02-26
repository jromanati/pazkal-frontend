"use client"

import React from "react"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { useSidebar } from '@/components/layout/dashboard-layout'
import { useToast } from '@/hooks/use-toast'
import { UsersService } from '@/services/users.service'
import { CompanyService, type CompanyListItem } from '@/services/company.service'
import { BranchService, type Branch } from '@/services/branches.service'
import { tiposCalificacionMock } from '@/lib/mock-data'
import { canAction } from '@/lib/permissions'

type Tab = 'datos-personales' | 'datos-profesionales' | 'calificaciones'

type Sucursal = {
  id: string
  nombre: string
  lugar: string
}

type AsignacionEmpresa = {
  empresaId: string
  empresaNombre: string
  sucursalIds: string[]
}

function normalizeBranchesResponse(raw: unknown): Branch[] {
  if (Array.isArray(raw)) return raw as Branch[]
  if (raw && typeof raw === 'object' && Array.isArray((raw as any).results)) return (raw as any).results as Branch[]
  return []
}

function branchToSucursal(b: Branch): Sucursal {
  return {
    id: String(b.id),
    nombre: b.name,
    lugar: b.location,
  }
}

function AsignarEmpresasSucursalesModal({
  open,
  onClose,
  companies,
  branchesByCompany,
  onEnsureBranches,
  asignacionesActuales,
  onSave,
}: {
  open: boolean
  onClose: () => void
  companies: CompanyListItem[]
  branchesByCompany: Record<string, Branch[]>
  onEnsureBranches: (companyId: string) => Promise<void>
  asignacionesActuales: AsignacionEmpresa[]
  onSave: (asignaciones: AsignacionEmpresa[]) => void
}) {
  const [asignaciones, setAsignaciones] = useState<AsignacionEmpresa[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [expandedEmpresas, setExpandedEmpresas] = useState<string[]>([])

  useEffect(() => {
    if (open) {
      setAsignaciones(asignacionesActuales.map(a => ({ ...a, sucursalIds: [...a.sucursalIds] })))
      setBusqueda('')
      setExpandedEmpresas(asignacionesActuales.map(a => a.empresaId))

      ;(async () => {
        for (const a of asignacionesActuales) {
          await onEnsureBranches(a.empresaId)
        }
      })()
    }
  }, [open, asignacionesActuales])

  useEffect(() => {
    if (!open) return
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [open, onClose])

  if (!open) return null

  const empresasFiltradas = companies.filter(c => {
    const q = busqueda.toLowerCase()
    return c.name.toLowerCase().includes(q) || c.tax_id.toLowerCase().includes(q)
  })

  const isEmpresaChecked = (empresaId: string) => asignaciones.some(a => a.empresaId === empresaId)

  const getSucursalesEmpresa = (empresaId: string): Sucursal[] =>
    (branchesByCompany[empresaId] ?? []).map(branchToSucursal)

  const isSucursalChecked = (empresaId: string, sucursalId: string) => {
    const asig = asignaciones.find(a => a.empresaId === empresaId)
    return asig ? asig.sucursalIds.includes(sucursalId) : false
  }

  const toggleExpand = async (empresaId: string) => {
    if (!expandedEmpresas.includes(empresaId)) {
      await onEnsureBranches(empresaId)
    }
    setExpandedEmpresas(prev =>
      prev.includes(empresaId) ? prev.filter(id => id !== empresaId) : [...prev, empresaId],
    )
  }

  const toggleEmpresa = async (empresa: { id: string; nombre: string }) => {
    const exists = asignaciones.find(a => a.empresaId === empresa.id)
    if (exists) {
      setAsignaciones(prev => prev.filter(a => a.empresaId !== empresa.id))
      setExpandedEmpresas(prev => prev.filter(id => id !== empresa.id))
    } else {
      await onEnsureBranches(empresa.id)
      setAsignaciones(prev => [...prev, { empresaId: empresa.id, empresaNombre: empresa.nombre, sucursalIds: [] }])
      setExpandedEmpresas(prev => [...prev, empresa.id])
    }
  }

  const toggleSucursal = (empresaId: string, sucursalId: string) => {
    setAsignaciones(prev => prev.map(a => {
      if (a.empresaId !== empresaId) return a
      const hasSuc = a.sucursalIds.includes(sucursalId)
      return {
        ...a,
        sucursalIds: hasSuc
          ? a.sucursalIds.filter(id => id !== sucursalId)
          : [...a.sucursalIds, sucursalId],
      }
    }))
  }

  const toggleAllSucursales = (empresaId: string) => {
    const sucursales = getSucursalesEmpresa(empresaId)
    setAsignaciones(prev => prev.map(a => {
      if (a.empresaId !== empresaId) return a
      const allSelected = sucursales.every(s => a.sucursalIds.includes(s.id))
      return { ...a, sucursalIds: allSelected ? [] : sucursales.map(s => s.id) }
    }))
  }

  const totalSucursalesSeleccionadas = asignaciones.reduce((acc, a) => acc + a.sucursalIds.length, 0)

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-[92%] sm:max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 bg-slate-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-[#2c528c]/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#2c528c]">domain_add</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-gray-100 text-sm sm:text-base">Asignar Empresas y Sucursales</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Seleccione empresas y luego sus sucursales</p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <div className="p-3 sm:p-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar empresa por nombre o RUT..."
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-[#2c528c] focus:ring-1 focus:ring-[#2c528c] transition-colors dark:text-gray-200"
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-400">
              {asignaciones.length} empresa(s), {totalSucursalesSeleccionadas} sucursal(es)
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2">
          {empresasFiltradas.length === 0 ? (
            <div className="text-center py-8">
              <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600">search_off</span>
              <p className="text-sm text-gray-400 mt-2">No se encontraron empresas</p>
            </div>
          ) : (
            empresasFiltradas.map((empresa) => {
              const id = String(empresa.id)
              const checked = isEmpresaChecked(id)
              const expanded = expandedEmpresas.includes(id)
              const sucursales = getSucursalesEmpresa(id)
              const asig = asignaciones.find(a => a.empresaId === id)
              const sucCount = asig ? asig.sucursalIds.length : 0

              return (
                <div key={id} className={`rounded-lg border transition-all ${checked ? 'border-[#2c528c] bg-[#2c528c]/5' : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900'}`}>
                  <div className="p-3 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => toggleEmpresa({ id, nombre: empresa.name })}
                      className="flex-1 flex items-center gap-3 min-w-0 text-left"
                    >
                      <div className={`size-8 rounded-lg flex items-center justify-center flex-shrink-0 ${checked ? 'bg-[#2c528c] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                        <span className="material-symbols-outlined text-base">corporate_fare</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-700 dark:text-gray-200 truncate">{empresa.name}</p>
                        <p className="text-xs text-gray-400 truncate">{empresa.tax_id}</p>
                      </div>
                    </button>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {checked && sucCount > 0 && (
                        <span className="text-[10px] font-semibold text-[#2c528c] bg-[#2c528c]/10 px-2 py-1 rounded-full">
                          {sucCount} suc.
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => toggleExpand(id)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        disabled={!checked}
                        title="Ver sucursales"
                      >
                        <span className="material-symbols-outlined">{expanded ? 'expand_less' : 'expand_more'}</span>
                      </button>
                    </div>
                  </div>

                  {checked && expanded && (
                    <div className="px-3 pb-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-500">Sucursales</span>
                        <button
                          type="button"
                          onClick={() => toggleAllSucursales(id)}
                          className="text-xs font-semibold text-[#2c528c] hover:text-blue-800 transition-colors"
                        >
                          {sucursales.length > 0 && sucursales.every(s => isSucursalChecked(id, s.id))
                            ? 'Deseleccionar todas'
                            : 'Seleccionar todas'}
                        </button>
                      </div>

                      {sucursales.length === 0 ? (
                        <div className="text-xs text-gray-400 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-lg p-3">
                          No hay sucursales disponibles.
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {sucursales.map(s => {
                            const sucChecked = isSucursalChecked(id, s.id)
                            return (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => toggleSucursal(id, s.id)}
                                className={`w-full text-left px-3 py-2 rounded-lg border flex items-center justify-between gap-3 ${
                                  sucChecked
                                    ? 'border-[#2c528c] bg-[#2c528c]/5'
                                    : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/30'
                                }`}
                              >
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-slate-700 dark:text-gray-200 truncate">{s.nombre}</p>
                                  <p className="text-[10px] text-gray-400 truncate">{s.lugar}</p>
                                </div>
                                {sucChecked && <span className="material-symbols-outlined text-[#2c528c] text-base">check_circle</span>}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        <div className="p-3 sm:p-4 border-t border-gray-100 dark:border-gray-800 bg-slate-50 dark:bg-gray-800/50 flex flex-col-reverse sm:flex-row items-center justify-end gap-2 sm:gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onSave(asignaciones)
              onClose()
            }}
            className="w-full sm:w-auto bg-[#2c528c] hover:bg-blue-800 text-white text-sm font-bold px-6 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">save</span>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}

export default function NuevoOperadorPage() {
  const router = useRouter()
  const { toggle } = useSidebar()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<Tab>('datos-personales')
  const [mounted, setMounted] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [companies, setCompanies] = useState<CompanyListItem[]>([])
  const [branchesByCompany, setBranchesByCompany] = useState<Record<string, Branch[]>>({})
  const [modalEmpresas, setModalEmpresas] = useState(false)
  const [credentialImage, setCredentialImage] = useState<File | null>(null)
  const [habilitaciones, setHabilitaciones] = useState<string[]>(Array.from({ length: 10 }, () => ''))

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    asignaciones: [] as AsignacionEmpresa[],
    profile: {
      rut: '',
      fecha_nacimiento: new Date().toISOString().slice(0, 10),
      telefono: '',
      numero_credencial: 0,
      fecha_otorgamiento_credencial: new Date().toISOString().slice(0, 10),
      fecha_vencimiento_credencial: new Date().toISOString().slice(0, 10),
      eficiencia_operativa: new Date().toISOString().slice(0, 10),
      fecha_ultima_capacitacion: new Date().toISOString().slice(0, 10),
      empresa_capacitadora: '',
    },
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const run = async () => {
      const cacheKey = 'companies_cache'
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        try {
          const parsed = JSON.parse(cached) as { data: CompanyListItem[]; ts: number }
          if (Array.isArray(parsed?.data)) {
            setCompanies(parsed.data)
          }
        } catch {
        }
      }

      const response = await CompanyService.getCompanies({ page: 1, page_size: 1000 })
      if (response.success && response.data?.results) {
        setCompanies(response.data.results)
        localStorage.setItem(cacheKey, JSON.stringify({ data: response.data.results, ts: Date.now() }))
      }
    }

    run()
  }, [])

  const canCreate = mounted && canAction('operadores', 'create')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target
    const name = target.name

    if (name.startsWith('profile.')) {
      const key = name.replace('profile.', '') as keyof typeof formData.profile
      const value = target.value
      setFormData({
        ...formData,
        profile: {
          ...formData.profile,
          [key]: key === 'numero_credencial' ? Number(value) : value,
        },
      })
      return
    }

    setFormData({ ...formData, [name]: target.value })
  }

  const ensureBranches = async (companyId: string) => {
    if (branchesByCompany[companyId]) return

    const res = await BranchService.listBranches({ company_id: companyId })
    if (!res.success) return

    const list = normalizeBranchesResponse(res.data)
    setBranchesByCompany(prev => ({ ...prev, [companyId]: list }))
  }

  const handleSaveAsignaciones = (asignaciones: AsignacionEmpresa[]) => {
    setFormData({ ...formData, asignaciones })
    toast({
      title: 'Asignaciones actualizadas',
      description: `Se asignaron ${asignaciones.length} empresa(s) al operador.`,
    })
  }

  const handleRemoveEmpresa = (empresaId: string) => {
    const removed = formData.asignaciones.find(a => a.empresaId === empresaId)
    const nuevas = formData.asignaciones.filter(a => a.empresaId !== empresaId)
    setFormData({ ...formData, asignaciones: nuevas })
    toast({
      title: 'Empresa removida',
      description: `"${removed?.empresaNombre ?? empresaId}" fue removida.`,
      variant: 'destructive',
    })
  }

  const handleRemoveSucursal = (empresaId: string, sucursalId: string) => {
    const suc = (branchesByCompany[empresaId] ?? []).find(b => String(b.id) === sucursalId)
    const nuevas = formData.asignaciones.map(a => {
      if (a.empresaId !== empresaId) return a
      return { ...a, sucursalIds: a.sucursalIds.filter(id => id !== sucursalId) }
    })
    setFormData({ ...formData, asignaciones: nuevas })
    toast({
      title: 'Sucursal removida',
      description: `"${suc?.name ?? sucursalId}" fue removida.`,
      variant: 'destructive',
    })
  }

  const handleSubmit = async () => {
    if (!canCreate) return

    if (!formData.password) {
      toast({
        title: 'Faltan datos',
        description: 'Debe ingresar una contraseña.',
        variant: 'destructive',
      })
      return
    }
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Contraseñas no coinciden',
        description: 'La contraseña y su confirmación deben ser iguales.',
        variant: 'destructive',
      })
      return
    }

    setIsSaving(true)
    try {
      const payload = {
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        is_superuser: false,
        is_staff: false,
        branch_ids: formData.asignaciones.flatMap(a => a.sucursalIds).map(Number),
        group_name: 'Operador',
        profile: {
          rut: formData.profile.rut,
          fecha_nacimiento: formData.profile.fecha_nacimiento,
          telefono: formData.profile.telefono,
          numero_credencial: Number(formData.profile.numero_credencial) || 0,
          fecha_otorgamiento_credencial: formData.profile.fecha_otorgamiento_credencial,
          fecha_vencimiento_credencial: formData.profile.fecha_vencimiento_credencial,
          habilitaciones: habilitaciones
            .map(s => String(s).trim())
            .filter(Boolean)
            .join(',')
            .split(',')
            .map(s => s.trim())
            .filter(Boolean),
          eficiencia_operativa: formData.profile.eficiencia_operativa,
          fecha_ultima_capacitacion: formData.profile.fecha_ultima_capacitacion,
          empresa_capacitadora: formData.profile.empresa_capacitadora,
        },
      }

      const response = await UsersService.createUser(payload)
      if (!response.success || !response.data) {
        const formatDetailValue = (v: unknown) => {
          if (Array.isArray(v)) return v.join(' ')
          if (typeof v === 'string') return v
          if (v === null || v === undefined) return ''
          try {
            return JSON.stringify(v)
          } catch {
            return String(v)
          }
        }

        const detailsText = response.details
          ? Object.entries(response.details)
            .map(([k, v]) => `${k}: ${formatDetailValue(v)}`)
            .join('\n')
          : ''
        toast({
          title: 'Error al crear operador',
          description: detailsText || response.error || 'No se pudo crear el operador.',
          variant: 'destructive',
        })
        return
      }

      if (credentialImage) {
        const imgRes = await UsersService.uploadCredentialImage(response.data.id, credentialImage)
        if (!imgRes.success) {
          toast({
            title: 'Operador creado, pero no se pudo subir la credencial',
            description: imgRes.error || 'No se pudo subir la imagen de credencial.',
            variant: 'destructive',
          })
        }
      }

      toast({
        title: 'Operador creado',
        description: 'El operador ha sido creado exitosamente.',
      })
      router.push('/operadores')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <Header icon="engineering" title="Crear Nuevo Operador" onMenuClick={toggle} />

      {mounted && !canCreate ? (
        <div className="p-8 text-center">
          <p className="text-gray-500">No tienes permisos para crear registros en esta sección.</p>
        </div>
      ) : (

      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full">
        {/* Title */}
        <div className="mb-6 lg:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-gray-100">Ficha del Operador</h2>
            <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-1">
              Complete la información básica y profesional para dar de alta al operador.
            </p>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <Link
              href="/operadores"
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors text-center"
            >
              Cancelar
            </Link>
            {canCreate && (
              <button
                onClick={handleSubmit}
                disabled={isSaving}
                className="flex-1 sm:flex-none bg-[#2c528c] hover:bg-blue-800 text-white text-xs sm:text-sm font-semibold px-4 sm:px-6 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-md"
              >
                <span className="material-symbols-outlined text-base sm:text-lg">save</span>
                Guardar
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-4 sm:mb-6 border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
          <div className="flex gap-4 sm:gap-8 min-w-max">
            <button
              onClick={() => setActiveTab('datos-personales')}
              className={`pb-2.5 sm:pb-3 text-xs sm:text-sm border-b-2 flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${
                activeTab === 'datos-personales'
                  ? 'font-bold text-[#2c528c] border-[#2c528c]'
                  : 'font-medium text-gray-400 dark:text-gray-500 border-transparent hover:text-gray-600 transition-all'
              }`}
            >
              <span className="material-symbols-outlined text-lg sm:text-xl">person</span>
              Datos personales
            </button>
            <button
              onClick={() => setActiveTab('datos-profesionales')}
              className={`pb-2.5 sm:pb-3 text-xs sm:text-sm border-b-2 flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${
                activeTab === 'datos-profesionales'
                  ? 'font-bold text-[#2c528c] border-[#2c528c]'
                  : 'font-medium text-gray-400 dark:text-gray-500 border-transparent hover:text-gray-600 transition-all'
              }`}
            >
              <span className="material-symbols-outlined text-lg sm:text-xl">work</span>
              Datos profesionales
            </button>
            {/* <button
              onClick={() => setActiveTab('calificaciones')}
              className={`pb-2.5 sm:pb-3 text-xs sm:text-sm border-b-2 flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${
                activeTab === 'calificaciones'
                  ? 'font-bold text-[#2c528c] border-[#2c528c]'
                  : 'font-medium text-gray-400 dark:text-gray-500 border-transparent hover:text-gray-600 transition-all'
              }`}
            >
              <span className="material-symbols-outlined text-lg sm:text-xl">workspace_premium</span>
              Calificaciones
            </button> */}
          </div>
        </div>

        {/* Content */}
        <fieldset disabled={!canCreate} className="contents">
          {activeTab === 'datos-personales' && (
            <DatosPersonales
              formData={formData}
              onChange={handleChange}
              companies={companies}
              branchesByCompany={branchesByCompany}
              onOpenEmpresas={() => setModalEmpresas(true)}
              onRemoveEmpresa={handleRemoveEmpresa}
              onRemoveSucursal={handleRemoveSucursal}
            />
          )}
          {activeTab === 'datos-profesionales' && (
            <DatosProfesionales
              formData={formData}
              onChange={handleChange}
              habilitaciones={habilitaciones}
              setHabilitaciones={setHabilitaciones}
              credentialImage={credentialImage}
              setCredentialImage={setCredentialImage}
            />
          )}
          {activeTab === 'calificaciones' && <Calificaciones />}
        </fieldset>

        <AsignarEmpresasSucursalesModal
          open={modalEmpresas}
          onClose={() => setModalEmpresas(false)}
          companies={companies}
          branchesByCompany={branchesByCompany}
          onEnsureBranches={ensureBranches}
          asignacionesActuales={formData.asignaciones}
          onSave={handleSaveAsignaciones}
        />
      </div>
      )}
    </>
  )
}

function DatosPersonales({
  formData,
  onChange,
  companies,
  branchesByCompany,
  onOpenEmpresas,
  onRemoveEmpresa,
  onRemoveSucursal,
}: {
  formData: {
    first_name: string
    last_name: string
    email: string
    password: string
    confirmPassword: string
    phone: string
    asignaciones: AsignacionEmpresa[]
    profile: {
      rut: string
      fecha_nacimiento: string
      telefono: string
      numero_credencial: number
      fecha_otorgamiento_credencial: string
      fecha_vencimiento_credencial: string
      eficiencia_operativa: string
      fecha_ultima_capacitacion: string
      empresa_capacitadora: string
    }
  }
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
  companies: CompanyListItem[]
  branchesByCompany: Record<string, Branch[]>
  onOpenEmpresas: () => void
  onRemoveEmpresa: (id: string) => void
  onRemoveSucursal: (empresaId: string, sucursalId: string) => void
}) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 sm:p-6 lg:p-8">
        <form className="space-y-6 lg:space-y-8">
          {/* Datos básicos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="sm:col-span-2">
              <label className="block mb-1 sm:mb-1.5 text-[10px] sm:text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tight" htmlFor="nombre">
                Nombre completo
              </label>
              <input
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-[#2c528c] focus:border-[#2c528c]"
                id="nombre"
                name="first_name"
                value={formData.first_name}
                onChange={onChange}
                placeholder="Nombre"
                type="text"
              />
            </div>
            <div>
              <label className="block mb-1 sm:mb-1.5 text-[10px] sm:text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tight" htmlFor="apellido">
                Apellido
              </label>
              <input
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-[#2c528c] focus:border-[#2c528c]"
                id="apellido"
                name="last_name"
                value={formData.last_name}
                onChange={onChange}
                placeholder="Apellido"
                type="text"
              />
            </div>
            <div>
              <label className="block mb-1 sm:mb-1.5 text-[10px] sm:text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tight" htmlFor="nacimiento">
                Fecha nacimiento
              </label>
              <input
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-[#2c528c] focus:border-[#2c528c]"
                id="nacimiento"
                name="profile.fecha_nacimiento"
                value={formData.profile.fecha_nacimiento}
                onChange={onChange}
                type="date"
              />
            </div>
            <div>
              <label className="block mb-1 sm:mb-1.5 text-[10px] sm:text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tight" htmlFor="rut">
                Rut
              </label>
              <input
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-[#2c528c] focus:border-[#2c528c]"
                id="rut"
                placeholder="12.345.678-9"
                name="profile.rut"
                value={formData.profile.rut}
                onChange={onChange}
                type="text"
              />
            </div>
            <div>
              <label className="block mb-1 sm:mb-1.5 text-[10px] sm:text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tight" htmlFor="credencial">
                Número de credencial
              </label>
              <input
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-[#2c528c] focus:border-[#2c528c]"
                id="credencial"
                placeholder="Ej. 12345"
                name="profile.numero_credencial"
                value={String(formData.profile.numero_credencial ?? '')}
                onChange={onChange}
                type="number"
                max={99999}
              />
              <p className="text-[9px] sm:text-[10px] text-gray-400 mt-1 italic">Máximo 5 dígitos</p>
            </div>
            <div>
              <label className="block mb-1 sm:mb-1.5 text-[10px] sm:text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tight" htmlFor="telefono">
                Teléfono
              </label>
              <input
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-[#2c528c] focus:border-[#2c528c]"
                id="telefono"
                placeholder="+56 9 1234 5678"
                name="phone"
                value={formData.phone}
                onChange={onChange}
                type="tel"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block mb-1 sm:mb-1.5 text-[10px] sm:text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tight" htmlFor="email">
                Correo electrónico
              </label>
              <input
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-[#2c528c] focus:border-[#2c528c]"
                id="email"
                placeholder="juan.perez@ejemplo.cl"
                name="email"
                value={formData.email}
                onChange={onChange}
                type="email"
              />
            </div>
            <div>
              <label className="block mb-1 sm:mb-1.5 text-[10px] sm:text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tight" htmlFor="password">
                Contraseña
              </label>
              <div className="relative">
                <input
                  className="w-full pr-10 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-[#2c528c] focus:border-[#2c528c]"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={onChange}
                  type={showPassword ? 'text' : 'password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  <span className="material-symbols-outlined text-lg">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>
            <div>
              <label className="block mb-1 sm:mb-1.5 text-[10px] sm:text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tight" htmlFor="confirmPassword">
                Repetir contraseña
              </label>
              <div className="relative">
                <input
                  className="w-full pr-10 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-[#2c528c] focus:border-[#2c528c]"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={onChange}
                  type={showConfirmPassword ? 'text' : 'password'}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(v => !v)}
                  className="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label={showConfirmPassword ? 'Ocultar confirmación de contraseña' : 'Mostrar confirmación de contraseña'}
                >
                  <span className="material-symbols-outlined text-lg">{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                Empresas y sucursales asignadas
              </label>
              <button
                type="button"
                onClick={onOpenEmpresas}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2c528c] hover:text-blue-800 transition-colors"
              >
                <span className="material-symbols-outlined text-base">add_circle</span>
                Asignar
              </button>
            </div>

            {formData.asignaciones.length === 0 ? (
              <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center">
                <span className="material-symbols-outlined text-3xl text-gray-300 dark:text-gray-600">domain_disabled</span>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">No hay empresas ni sucursales asignadas</p>
                <button
                  type="button"
                  onClick={onOpenEmpresas}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#2c528c] hover:text-blue-800 transition-colors"
                >
                  <span className="material-symbols-outlined text-base">add</span>
                  Asignar
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {formData.asignaciones.map((asig) => {
                  const sucursales = (branchesByCompany[asig.empresaId] ?? []).map(branchToSucursal)
                  const sucursalesAsignadas = sucursales.filter(s => asig.sucursalIds.includes(s.id))

                  return (
                    <div key={asig.empresaId} className="rounded-lg border border-gray-100 dark:border-gray-800 overflow-hidden">
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/30 group">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="size-8 rounded-lg bg-[#2c528c]/10 flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-[#2c528c] text-base">corporate_fare</span>
                          </div>
                          <div className="min-w-0">
                            <span className="text-sm font-semibold text-slate-700 dark:text-gray-200 truncate block">{asig.empresaNombre}</span>
                            {sucursalesAsignadas.length > 0 && (
                              <span className="text-[10px] text-gray-400">{sucursalesAsignadas.length} sucursal(es)</span>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemoveEmpresa(asig.empresaId)}
                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all flex-shrink-0 ml-2"
                          title="Remover empresa"
                        >
                          <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                      </div>

                      {sucursalesAsignadas.length > 0 && (
                        <div className="divide-y divide-gray-50 dark:divide-gray-800">
                          {sucursalesAsignadas.map((suc) => (
                            <div key={suc.id} className="flex items-center justify-between px-3 py-2 pl-14 group/suc hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="material-symbols-outlined text-gray-400 text-sm flex-shrink-0">subdirectory_arrow_right</span>
                                <div className="min-w-0">
                                  <p className="text-xs font-medium text-slate-600 dark:text-gray-300 truncate">{suc.nombre}</p>
                                  <p className="text-[10px] text-gray-400 truncate">{suc.lugar}</p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => onRemoveSucursal(asig.empresaId, suc.id)}
                                className="opacity-0 group-hover/suc:opacity-100 text-gray-400 hover:text-red-500 transition-all flex-shrink-0 ml-2"
                                title="Remover sucursal"
                              >
                                <span className="material-symbols-outlined text-sm">close</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">info</span>
                  {formData.asignaciones.length} empresa(s), {formData.asignaciones.reduce((acc, a) => acc + a.sucursalIds.length, 0)} sucursal(es) asignada(s)
                </p>
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Footer */}
      {/* <div className="flex flex-col sm:flex-row items-center justify-end gap-3 sm:gap-4 p-4 sm:p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800">
        <button className="w-full sm:w-auto bg-[#2c528c] hover:bg-blue-800 text-white text-xs sm:text-sm font-bold px-6 sm:px-10 py-2.5 sm:py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95">
          <span className="material-symbols-outlined text-lg">save</span>
          Guardar Operador
        </button>
      </div> */}
    </div>
  )
}

function DatosProfesionales({
  formData,
  onChange,
  habilitaciones,
  setHabilitaciones,
  credentialImage,
  setCredentialImage,
}: {
  formData: {
    profile: {
      fecha_otorgamiento_credencial: string
      fecha_vencimiento_credencial: string
      eficiencia_operativa: string
      fecha_ultima_capacitacion: string
      empresa_capacitadora: string
    }
  }
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
  habilitaciones: string[]
  setHabilitaciones: React.Dispatch<React.SetStateAction<string[]>>
  credentialImage: File | null
  setCredentialImage: (f: File | null) => void
}) {
  return (
    <form className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Credencial de Operador */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#2c528c] text-lg sm:text-xl">badge</span>
          <h3 className="font-bold text-slate-800 dark:text-white text-sm sm:text-base">Credencial de Operador</h3>
        </div>
        <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-1.5" htmlFor="fecha_otorgamiento">
              Fecha otorgamiento credencial
            </label>
            <input
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-[#2c528c] focus:border-[#2c528c]"
              id="fecha_otorgamiento"
              name="profile.fecha_otorgamiento_credencial"
              value={formData.profile.fecha_otorgamiento_credencial}
              onChange={onChange}
              type="date"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-1.5" htmlFor="fecha_vencimiento">
              Fecha vencimiento credencial
            </label>
            <input
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-[#2c528c] focus:border-[#2c528c]"
              id="fecha_vencimiento"
              name="profile.fecha_vencimiento_credencial"
              value={formData.profile.fecha_vencimiento_credencial}
              onChange={onChange}
              type="date"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-1.5" htmlFor="credencial_doc">
              Cargar documento credencial
            </label>
            <input
              id="credencial_doc"
              type="file"
              accept="image/*,application/pdf,.pdf"
              onChange={(e) => setCredentialImage(e.target.files?.[0] ?? null)}
              className="hidden"
            />
            <label
              htmlFor="credencial_doc"
              className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg cursor-pointer group transition-colors ${
                credentialImage
                  ? 'border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-900/10'
                  : 'border-gray-300 dark:border-gray-700 hover:border-[#2c528c]'
              }`}
            >
              <div className="space-y-1 text-center">
                {credentialImage ? (
                  <>
                    <span className="material-symbols-outlined text-green-500 text-4xl mb-2">check_circle</span>
                    <p className="text-sm text-green-600 font-medium">Documento cargado</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{credentialImage.name}</p>
                    <p className="text-xs font-bold text-[#2c528c] group-hover:underline">Reemplazar archivo</p>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-gray-400 text-4xl mb-2">upload_file</span>
                    <p className="text-sm text-gray-500">Arrastra o haz clic para subir</p>
                    <p className="text-xs text-gray-400">PNG/JPG/PDF</p>
                  </>
                )}
              </div>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#2c528c] text-lg sm:text-xl">verified</span>
          <h3 className="font-bold text-slate-800 dark:text-white text-sm sm:text-base">Habilitaciones</h3>
        </div>
        <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i}>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-1.5" htmlFor={`habil_${i + 1}`}>
                Habilitación {i + 1}
              </label>
              <input
                id={`habil_${i + 1}`}
                type="text"
                value={habilitaciones[i] ?? ''}
                onChange={(e) =>
                  setHabilitaciones((prev) => {
                    const next = [...prev]
                    next[i] = e.target.value
                    return next
                  })
                }
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-[#2c528c] focus:border-[#2c528c]"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Capacitación y Eficiencia */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#2c528c] text-lg sm:text-xl">school</span>
          <h3 className="font-bold text-slate-800 dark:text-white text-sm sm:text-base">Capacitación y Eficiencia</h3>
        </div>
        <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-1.5" htmlFor="eficiencia_fecha">
              Eficiencia operativa Fecha
            </label>
            <input
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-[#2c528c] focus:border-[#2c528c]"
              id="eficiencia_fecha"
              type="date"
              name="profile.eficiencia_operativa"
              value={formData.profile.eficiencia_operativa}
              onChange={onChange}
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-1.5" htmlFor="ultima_cap_fecha">
              Fecha última capacitación (credencial)
            </label>
            <input
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-[#2c528c] focus:border-[#2c528c]"
              id="ultima_cap_fecha"
              type="date"
              name="profile.fecha_ultima_capacitacion"
              value={formData.profile.fecha_ultima_capacitacion}
              onChange={onChange}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-1.5" htmlFor="empresa_capacitadora">
              Empresa capacitadora
            </label>
            <input
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-[#2c528c] focus:border-[#2c528c]"
              id="empresa_capacitadora"
              type="text"
              name="profile.empresa_capacitadora"
              value={formData.profile.empresa_capacitadora}
              onChange={onChange}
            />
          </div>
        </div>
      </div>
    </form>
  )
}

function Calificaciones() {
  const [calificaciones, setCalificaciones] = useState<{ tipo: string; fechaVigencia: string; aeronave: string }[]>([])

  const addCalificacion = () => {
    setCalificaciones([...calificaciones, { tipo: '', fechaVigencia: '', aeronave: '' }])
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#2c528c] text-lg sm:text-xl">workspace_premium</span>
            <h3 className="font-bold text-slate-800 dark:text-white text-sm sm:text-base">Calificaciones del Operador</h3>
          </div>
          <button
            type="button"
            onClick={addCalificacion}
            className="bg-[#2c528c] hover:bg-blue-800 text-white text-xs sm:text-sm font-semibold px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg flex items-center gap-1.5 sm:gap-2 transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-sm sm:text-base">add</span>
            Agregar Calificación
          </button>
        </div>
        <div className="p-4 sm:p-6">
          {calificaciones.length === 0 ? (
            <div className="text-center py-8 sm:py-12 text-gray-400">
              <span className="material-symbols-outlined text-4xl sm:text-5xl mb-2">school</span>
              <p className="text-xs sm:text-sm">No hay calificaciones agregadas</p>
              <p className="text-[10px] sm:text-xs mt-1">Haz clic en "Agregar Calificación" para comenzar</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {calificaciones.map((cal, index) => (
                <div key={index} className="flex flex-col sm:flex-row items-start sm:items-end gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="flex-1 w-full">
                    <label className="block text-[10px] sm:text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                      Tipo de calificación
                    </label>
                    <select
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-xs focus:ring-[#2c528c] focus:border-[#2c528c]"
                      value={cal.tipo}
                      onChange={(e) => {
                        const updated = [...calificaciones]
                        updated[index].tipo = e.target.value
                        setCalificaciones(updated)
                      }}
                    >
                      <option value="">Seleccionar...</option>
                      {tiposCalificacionMock.map((tipo) => (
                        <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1 w-full">
                    <label className="block text-[10px] sm:text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                      Aeronave / Especialidad
                    </label>
                    <input
                      type="text"
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-xs focus:ring-[#2c528c] focus:border-[#2c528c]"
                      value={cal.aeronave}
                      onChange={(e) => {
                        const updated = [...calificaciones]
                        updated[index].aeronave = e.target.value
                        setCalificaciones(updated)
                      }}
                    />
                  </div>
                  <div className="flex-1 w-full">
                    <label className="block text-[10px] sm:text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                      Fecha de vigencia
                    </label>
                    <input
                      type="date"
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-xs focus:ring-[#2c528c] focus:border-[#2c528c]"
                      value={cal.fechaVigencia}
                      onChange={(e) => {
                        const updated = [...calificaciones]
                        updated[index].fechaVigencia = e.target.value
                        setCalificaciones(updated)
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setCalificaciones(calificaciones.filter((_, i) => i !== index))}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors w-full sm:w-auto flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-lg sm:text-xl">delete</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

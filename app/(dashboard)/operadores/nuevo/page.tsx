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
import { tiposCalificacionMock } from '@/lib/mock-data'
import { canAction } from '@/lib/permissions'

type Tab = 'datos-personales' | 'datos-profesionales' | 'calificaciones'

function AsignarEmpresasModal({
  open,
  onClose,
  companies,
  selectedIds,
  onSave,
}: {
  open: boolean
  onClose: () => void
  companies: CompanyListItem[]
  selectedIds: string[]
  onSave: (ids: string[]) => void
}) {
  const [seleccionadas, setSeleccionadas] = useState<string[]>(selectedIds)
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    if (!open) return
    setSeleccionadas(selectedIds)
    setBusqueda('')
  }, [open, selectedIds])

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

  const toggleEmpresa = (id: string) => {
    setSeleccionadas(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]))
  }

  const toggleAll = () => {
    if (seleccionadas.length === companies.length) {
      setSeleccionadas([])
    } else {
      setSeleccionadas(companies.map(c => String(c.id)))
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-[90%] sm:max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 bg-slate-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-[#2c528c]/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#2c528c]">domain_add</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-gray-100 text-sm sm:text-base">Asignar Empresas</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Seleccione las empresas a las que pertenece el operador</p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <div className="p-3 sm:p-4 border-b border-gray-100 dark:border-gray-800">
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
        </div>

        <div className="px-3 sm:px-4 pt-3 flex items-center justify-between">
          <button onClick={toggleAll} className="text-xs font-semibold text-[#2c528c] hover:text-blue-800 transition-colors">
            {seleccionadas.length === companies.length ? 'Deseleccionar todas' : 'Seleccionar todas'}
          </button>
          <span className="text-xs text-gray-400">
            {seleccionadas.length} de {companies.length} seleccionadas
          </span>
        </div>

        <div className="p-3 sm:p-4 max-h-[300px] overflow-y-auto space-y-1.5">
          {empresasFiltradas.length === 0 ? (
            <div className="text-center py-8">
              <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600">search_off</span>
              <p className="text-sm text-gray-400 mt-2">No se encontraron empresas</p>
            </div>
          ) : (
            empresasFiltradas.map((empresa) => {
              const id = String(empresa.id)
              const isSelected = seleccionadas.includes(id)
              return (
                <button
                  key={empresa.id}
                  onClick={() => toggleEmpresa(id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                    isSelected
                      ? 'border-[#2c528c] bg-[#2c528c]/5 dark:bg-[#2c528c]/10'
                      : 'border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  <div className={`size-5 rounded flex-shrink-0 flex items-center justify-center border-2 transition-colors ${
                    isSelected ? 'bg-[#2c528c] border-[#2c528c]' : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {isSelected && <span className="material-symbols-outlined text-white text-sm">check</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${isSelected ? 'text-[#2c528c]' : 'text-slate-700 dark:text-gray-200'}`}>
                      {empresa.name}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate">RUT: {empresa.tax_id}</p>
                  </div>
                  {isSelected && <span className="material-symbols-outlined text-[#2c528c] text-lg flex-shrink-0">verified</span>}
                </button>
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
              onSave(seleccionadas)
              onClose()
            }}
            className="w-full sm:w-auto bg-[#2c528c] hover:bg-blue-800 text-white text-sm font-bold px-6 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">save</span>
            Confirmar Asignación
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
  const [modalEmpresas, setModalEmpresas] = useState(false)
  const [credentialImage, setCredentialImage] = useState<File | null>(null)
  const [habilitaciones, setHabilitaciones] = useState<string[]>(Array.from({ length: 10 }, () => ''))

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company_ids: [] as string[],
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

  const handleSaveEmpresas = (ids: string[]) => {
    setFormData({ ...formData, company_ids: ids })
    toast({
      title: 'Empresas actualizadas',
      description: `Se asignaron ${ids.length} empresa(s) al operador.`,
    })
  }

  const handleRemoveEmpresa = (id: string) => {
    const nuevas = formData.company_ids.filter(x => x !== id)
    setFormData({ ...formData, company_ids: nuevas })
    const nombre = companies.find(c => String(c.id) === id)?.name ?? id
    toast({
      title: 'Empresa removida',
      description: `"${nombre}" fue removida del operador.`,
      variant: 'destructive',
    })
  }

  const handleSubmit = async () => {
    if (!canCreate) return
    setIsSaving(true)
    try {
      const payload = {
        email: formData.email,
        password: 'Temp-1234',
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        is_superuser: false,
        is_staff: false,
        company_ids: formData.company_ids.map(Number),
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
            <button
              onClick={() => setActiveTab('calificaciones')}
              className={`pb-2.5 sm:pb-3 text-xs sm:text-sm border-b-2 flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${
                activeTab === 'calificaciones'
                  ? 'font-bold text-[#2c528c] border-[#2c528c]'
                  : 'font-medium text-gray-400 dark:text-gray-500 border-transparent hover:text-gray-600 transition-all'
              }`}
            >
              <span className="material-symbols-outlined text-lg sm:text-xl">workspace_premium</span>
              Calificaciones
            </button>
          </div>
        </div>

        {/* Content */}
        <fieldset disabled={!canCreate} className="contents">
          {activeTab === 'datos-personales' && (
            <DatosPersonales
              formData={formData}
              onChange={handleChange}
              companies={companies}
              onOpenEmpresas={() => setModalEmpresas(true)}
              onRemoveEmpresa={handleRemoveEmpresa}
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

        <AsignarEmpresasModal
          open={modalEmpresas}
          onClose={() => setModalEmpresas(false)}
          companies={companies}
          selectedIds={formData.company_ids}
          onSave={handleSaveEmpresas}
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
  onOpenEmpresas,
  onRemoveEmpresa,
}: {
  formData: {
    first_name: string
    last_name: string
    email: string
    phone: string
    company_ids: string[]
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
  onOpenEmpresas: () => void
  onRemoveEmpresa: (id: string) => void
}) {
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
                className="block w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs sm:text-sm p-2 sm:p-2.5 focus:ring-[#2c528c] focus:border-[#2c528c] transition-colors"
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
                className="block w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs sm:text-sm p-2 sm:p-2.5 focus:ring-[#2c528c] focus:border-[#2c528c] transition-colors"
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
                className="block w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs sm:text-sm p-2 sm:p-2.5 focus:ring-[#2c528c] focus:border-[#2c528c] transition-colors"
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
                className="block w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs sm:text-sm p-2 sm:p-2.5 focus:ring-[#2c528c] focus:border-[#2c528c] transition-colors"
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
                className="block w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs sm:text-sm p-2 sm:p-2.5 focus:ring-[#2c528c] focus:border-[#2c528c] transition-colors"
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
                className="block w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs sm:text-sm p-2 sm:p-2.5 focus:ring-[#2c528c] focus:border-[#2c528c] transition-colors"
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
                className="block w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs sm:text-sm p-2 sm:p-2.5 focus:ring-[#2c528c] focus:border-[#2c528c] transition-colors"
                id="email"
                placeholder="juan.perez@ejemplo.cl"
                name="email"
                value={formData.email}
                onChange={onChange}
                type="email"
              />
            </div>
          </div>

          {/* Asignación de empresas */}
          <div className="pt-4 sm:pt-6 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <span className="material-symbols-outlined text-gray-400 text-lg sm:text-xl">corporate_fare</span>
              <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-gray-100 uppercase tracking-wider">Asignación de Empresas</h3>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={onOpenEmpresas}
                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-200 text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">domain_add</span>
                Asignar empresas ({formData.company_ids.length})
              </button>
              <div className="flex-1 flex flex-wrap gap-2">
                {formData.company_ids.map((id) => {
                  const c = companies.find(x => String(x.id) === id)
                  return (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-semibold"
                    >
                      {c?.name ?? id}
                      <button
                        type="button"
                        onClick={() => onRemoveEmpresa(id)}
                        className="text-blue-700/70 hover:text-blue-900 dark:text-blue-300/70 dark:hover:text-blue-100"
                        aria-label="Remover empresa"
                      >
                        <span className="material-symbols-outlined text-base">close</span>
                      </button>
                    </span>
                  )
                })}
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Footer */}
      <div className="px-4 sm:px-8 py-3 sm:py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800 flex justify-end">
        <button className="w-full sm:w-auto bg-[#2c528c] hover:bg-blue-800 text-white text-xs sm:text-sm font-bold px-6 sm:px-10 py-2.5 sm:py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95">
          <span className="material-symbols-outlined text-lg">save</span>
          Guardar Operador
        </button>
      </div>
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
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-xs sm:text-sm bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 p-2 sm:p-2.5"
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
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-xs sm:text-sm bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 p-2 sm:p-2.5"
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
              accept="image/*"
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
                    <p className="text-xs text-gray-400">PNG/JPG</p>
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
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-xs sm:text-sm bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 p-2 sm:p-2.5"
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
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-xs sm:text-sm bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 p-2 sm:p-2.5"
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
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-xs sm:text-sm bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 p-2 sm:p-2.5"
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
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-xs sm:text-sm bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 p-2 sm:p-2.5"
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
                      className="block w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs sm:text-sm p-2 sm:p-2.5"
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
                      className="block w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs sm:text-sm p-2 sm:p-2.5"
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
                      className="block w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs sm:text-sm p-2 sm:p-2.5"
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

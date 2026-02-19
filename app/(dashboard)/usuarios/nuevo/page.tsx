"use client"

import React from "react"

import { useState } from 'react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { useSidebar } from '@/components/layout/dashboard-layout'
import { useToast } from '@/hooks/use-toast'
import { UsersService } from '@/services/users.service'
import { CompanyService, type CompanyListItem } from '@/services/company.service'

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
                <p className="text-xs text-gray-500 dark:text-gray-400">Seleccione las empresas a las que pertenece el usuario</p>
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

export default function NuevoUsuarioPage() {
  const router = useRouter()
  const { toggle } = useSidebar()
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [companies, setCompanies] = useState<CompanyListItem[]>([])
  const validGroups = ['Gerente', 'Operador', 'Visualizador'] as const
  const [modalEmpresas, setModalEmpresas] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    is_staff: false,
    company_ids: [] as string[],
    group_name: '',
    profile: {
      rut: '',
      fecha_nacimiento: new Date().toISOString().slice(0, 10),
      telefono: '',
      numero_credencial: 0,
      fecha_otorgamiento_credencial: new Date().toISOString().slice(0, 10),
      fecha_vencimiento_credencial: new Date().toISOString().slice(0, 10),
      habilitaciones: '' as string,
      eficiencia_operativa: new Date().toISOString().slice(0, 10),
      fecha_ultima_capacitacion: new Date().toISOString().slice(0, 10),
      empresa_capacitadora: '',
    }
  })

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target
    const name = target.name

    if (target instanceof HTMLInputElement && target.type === 'checkbox') {
      setFormData({ ...formData, [name]: target.checked })
      return
    }

    if (target instanceof HTMLSelectElement && target.multiple) {
      const selected = Array.from(target.selectedOptions).map(o => o.value)
      setFormData({ ...formData, [name]: selected })
      return
    }

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
      description: `Se asignaron ${ids.length} empresa(s) al usuario.`,
    })
  }

  const handleRemoveEmpresa = (id: string) => {
    const nuevas = formData.company_ids.filter(x => x !== id)
    setFormData({ ...formData, company_ids: nuevas })
    const nombre = companies.find(c => String(c.id) === id)?.name ?? id
    toast({
      title: 'Empresa removida',
      description: `"${nombre}" fue removida del usuario.`,
      variant: 'destructive',
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== passwordConfirm) {
      toast({
        title: 'Contraseñas no coinciden',
        description: 'La contraseña y su repetición deben ser iguales.',
        variant: 'destructive',
      })
      return
    }

    const groupName = (() => {
      const g = (formData.group_name || '').trim()
      const mapped: Record<string, (typeof validGroups)[number]> = {
        gerente: 'Gerente',
        gerencia: 'Gerente',
        operador: 'Operador',
        visualizador: 'Visualizador',
      }
      return mapped[g.toLowerCase()] ?? g
    })()

    const response = await UsersService.createUser({
      email: formData.email,
      password: formData.password,
      first_name: formData.first_name,
      last_name: formData.last_name,
      phone: formData.phone,
      is_staff: formData.is_staff,
      company_ids: formData.company_ids.map(Number),
      group_name: groupName,
      profile: {
        rut: formData.profile.rut,
        fecha_nacimiento: formData.profile.fecha_nacimiento,
        telefono: formData.profile.telefono,
        numero_credencial: Number(formData.profile.numero_credencial) || 0,
        fecha_otorgamiento_credencial: formData.profile.fecha_otorgamiento_credencial,
        fecha_vencimiento_credencial: formData.profile.fecha_vencimiento_credencial,
        habilitaciones: String(formData.profile.habilitaciones)
          .split(',')
          .map(s => s.trim())
          .filter(Boolean),
        eficiencia_operativa: formData.profile.eficiencia_operativa,
        fecha_ultima_capacitacion: formData.profile.fecha_ultima_capacitacion,
        empresa_capacitadora: formData.profile.empresa_capacitadora,
      },
    })

    if (!response.success) {
      const detailsText = response.details
        ? Object.entries(response.details)
          .map(([k, v]) => `${k}: ${v.join(' ')}`)
          .join('\n')
        : ''
      toast({
        title: 'Error al crear usuario',
        description: detailsText || response.error || 'No se pudo crear el usuario.',
        variant: 'destructive',
      })
      return
    }

    toast({
      title: "Usuario creado",
      description: "El usuario ha sido creado exitosamente.",
    })
    router.push('/usuarios')
  }

  return (
    <>
      <Header icon="manage_accounts" title="Gestión de Usuarios" onMenuClick={toggle} />

      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <nav aria-label="Breadcrumb" className="flex mb-3 lg:mb-4">
            <ol className="inline-flex items-center space-x-1 md:space-x-3 text-xs text-gray-500 uppercase tracking-widest font-semibold">
              <li className="inline-flex items-center">
                <Link href="/usuarios" className="hover:text-[#2c528c] transition-colors">Usuarios</Link>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="material-symbols-outlined text-sm mx-1">chevron_right</span>
                  <span className="text-slate-400">Crear Nuevo Usuario</span>
                </div>
              </li>
            </ol>
          </nav>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-gray-100">Crear Nuevo Usuario PAZKAL</h2>
          <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-1">Complete los datos para registrar un nuevo integrante en la plataforma.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Datos de la Cuenta */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-3 sm:p-4 bg-slate-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#2c528c]">person</span>
              <h3 className="font-bold text-slate-700 dark:text-gray-200 text-sm sm:text-base">Datos de la Cuenta</h3>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label htmlFor="first_name" className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                    Nombre
                  </label>
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="Ej: Juan"
                    required
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                  />
                </div>
                <div>
                  <label htmlFor="last_name" className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                    Apellido
                  </label>
                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="Ej: Pérez"
                    required
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label htmlFor="email" className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="user@example.com"
                    required
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      <span className="material-symbols-outlined text-xl">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label htmlFor="password_confirm" className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                    Repetir contraseña
                  </label>
                  <div className="relative">
                    <input
                      id="password_confirm"
                      name="password_confirm"
                      type={showPasswordConfirm ? 'text' : 'password'}
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      required
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      aria-label={showPasswordConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      <span className="material-symbols-outlined text-xl">
                        {showPasswordConfirm ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label htmlFor="phone" className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                    Teléfono
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+56 9 1234 5678"
                    required
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                  />
                </div>
                <div>
                  <label htmlFor="group_name" className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                    Grupo
                  </label>
                  <select
                    id="group_name"
                    name="group_name"
                    value={formData.group_name}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                  >
                    <option value="">Seleccione grupo</option>
                    {validGroups.map((group) => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="is_staff"
                  name="is_staff"
                  type="checkbox"
                  checked={formData.is_staff}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-[#2c528c] focus:ring-[#2c528c]"
                />
                <label htmlFor="is_staff" className="text-sm text-slate-600 dark:text-gray-300">
                  Es staff
                </label>
              </div>
            </div>
          </div>

          {/* Información de Contacto y Empresa */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-3 sm:p-4 bg-slate-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#2c528c]">contact_mail</span>
              <h3 className="font-bold text-slate-700 dark:text-gray-200 text-sm sm:text-base">Información de Contacto y Empresa</h3>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label htmlFor="profile.rut" className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                    RUT
                  </label>
                  <input
                    id="profile.rut"
                    name="profile.rut"
                    type="text"
                    value={formData.profile.rut}
                    onChange={handleChange}
                    placeholder="12.345.678-9"
                    required
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                  />
                </div>
                <div>
                  <label htmlFor="profile.fecha_nacimiento" className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                    Fecha nacimiento
                  </label>
                  <input
                    id="profile.fecha_nacimiento"
                    name="profile.fecha_nacimiento"
                    type="date"
                    value={formData.profile.fecha_nacimiento}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label htmlFor="profile.telefono" className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                    Teléfono (perfil)
                  </label>
                  <input
                    id="profile.telefono"
                    name="profile.telefono"
                    type="text"
                    value={formData.profile.telefono}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                  />
                </div>
                <div>
                  <label htmlFor="profile.numero_credencial" className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                    Número credencial
                  </label>
                  <input
                    id="profile.numero_credencial"
                    name="profile.numero_credencial"
                    type="number"
                    value={String(formData.profile.numero_credencial)}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                    Empresas asignadas
                  </label>
                  <button
                    type="button"
                    onClick={() => setModalEmpresas(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2c528c] hover:text-blue-800 transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">add_circle</span>
                    Asignar empresas
                  </button>
                </div>

                {formData.company_ids.length === 0 ? (
                  <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center">
                    <span className="material-symbols-outlined text-3xl text-gray-300 dark:text-gray-600">domain_disabled</span>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">No hay empresas asignadas</p>
                    <button
                      type="button"
                      onClick={() => setModalEmpresas(true)}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#2c528c] hover:text-blue-800 transition-colors"
                    >
                      <span className="material-symbols-outlined text-base">add</span>
                      Asignar ahora
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {formData.company_ids.map((id) => {
                      const nombre = companies.find(c => String(c.id) === id)?.name ?? id
                      return (
                        <div
                          key={id}
                          className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30 group hover:border-gray-200 dark:hover:border-gray-700 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="size-8 rounded-lg bg-[#2c528c]/10 flex items-center justify-center flex-shrink-0">
                              <span className="material-symbols-outlined text-[#2c528c] text-base">corporate_fare</span>
                            </div>
                            <span className="text-sm font-medium text-slate-700 dark:text-gray-200 truncate">{nombre}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveEmpresa(id)}
                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all flex-shrink-0 ml-2"
                            title="Remover empresa"
                          >
                            <span className="material-symbols-outlined text-lg">close</span>
                          </button>
                        </div>
                      )
                    })}
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">info</span>
                      {formData.company_ids.length} empresa(s) asignada(s) al usuario
                    </p>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label htmlFor="profile.fecha_otorgamiento_credencial" className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                    Fecha otorgamiento credencial
                  </label>
                  <input
                    id="profile.fecha_otorgamiento_credencial"
                    name="profile.fecha_otorgamiento_credencial"
                    type="date"
                    value={formData.profile.fecha_otorgamiento_credencial}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                  />
                </div>
                <div>
                  <label htmlFor="profile.fecha_vencimiento_credencial" className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                    Fecha vencimiento credencial
                  </label>
                  <input
                    id="profile.fecha_vencimiento_credencial"
                    name="profile.fecha_vencimiento_credencial"
                    type="date"
                    value={formData.profile.fecha_vencimiento_credencial}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="profile.habilitaciones" className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                  Habilitaciones (separadas por coma)
                </label>
                <input
                  id="profile.habilitaciones"
                  name="profile.habilitaciones"
                  type="text"
                  value={formData.profile.habilitaciones}
                  onChange={handleChange}
                  placeholder="string,string"
                  required
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label htmlFor="profile.eficiencia_operativa" className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                    Eficiencia operativa
                  </label>
                  <input
                    id="profile.eficiencia_operativa"
                    name="profile.eficiencia_operativa"
                    type="date"
                    value={formData.profile.eficiencia_operativa}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                  />
                </div>
                <div>
                  <label htmlFor="profile.fecha_ultima_capacitacion" className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                    Fecha última capacitación
                  </label>
                  <input
                    id="profile.fecha_ultima_capacitacion"
                    name="profile.fecha_ultima_capacitacion"
                    type="date"
                    value={formData.profile.fecha_ultima_capacitacion}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="profile.empresa_capacitadora" className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                  Empresa capacitadora
                </label>
                <input
                  id="profile.empresa_capacitadora"
                  name="profile.empresa_capacitadora"
                  type="text"
                  value={formData.profile.empresa_capacitadora}
                  onChange={handleChange}
                  required
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pb-8 sm:pb-12">
            <Link
              href="/usuarios"
              className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors text-center"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              className="w-full sm:w-auto bg-[#2c528c] hover:bg-blue-800 text-white text-sm font-bold px-8 sm:px-12 py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
            >
              <span className="material-symbols-outlined text-xl">save</span>
              Guardar
            </button>
          </div>
        </form>
      </div>

      <AsignarEmpresasModal
        open={modalEmpresas}
        onClose={() => setModalEmpresas(false)}
        companies={companies}
        selectedIds={formData.company_ids}
        onSave={handleSaveEmpresas}
      />
    </>
  )
}

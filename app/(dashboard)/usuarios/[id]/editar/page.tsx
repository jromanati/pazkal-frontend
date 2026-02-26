"use client"

import React from "react"

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { useSidebar } from '@/components/layout/dashboard-layout'
import { useToast } from '@/hooks/use-toast'
import { type Usuario } from '@/lib/mock-data'
import { UsersService } from '@/services/users.service'
import { CompanyService, type CompanyListItem } from '@/services/company.service'
import { BranchService, type Branch } from '@/services/branches.service'

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

function branchToSucursal(branch: Branch): Sucursal {
  return {
    id: String(branch.id),
    nombre: branch.name,
    lugar: branch.location,
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
                <div key={empresa.id} className={`rounded-lg border transition-all ${checked ? 'border-[#2c528c]/40 bg-[#2c528c]/[0.03] dark:bg-[#2c528c]/10' : 'border-gray-100 dark:border-gray-800'}`}>
                  <div className="flex items-center gap-3 p-3">
                    <button
                      type="button"
                      onClick={() => toggleEmpresa({ id, nombre: empresa.name })}
                      className={`size-5 rounded flex-shrink-0 flex items-center justify-center border-2 transition-colors ${checked ? 'bg-[#2c528c] border-[#2c528c]' : 'border-gray-300 dark:border-gray-600'}`}
                    >
                      {checked && <span className="material-symbols-outlined text-white text-sm">check</span>}
                    </button>

                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => toggleEmpresa({ id, nombre: empresa.name })}>
                      <p className={`text-sm font-semibold truncate ${checked ? 'text-[#2c528c]' : 'text-slate-700 dark:text-gray-200'}`}>{empresa.name}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 truncate">RUT: {empresa.tax_id}</p>
                    </div>

                    {checked && sucursales.length > 0 && (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {sucCount > 0 && (
                          <span className="text-[10px] font-bold bg-[#2c528c] text-white rounded-full px-2 py-0.5">{sucCount}</span>
                        )}
                        <button type="button" onClick={() => toggleExpand(id)} className="text-gray-400 hover:text-[#2c528c] transition-colors">
                          <span className={`material-symbols-outlined text-xl transition-transform ${expanded ? 'rotate-180' : ''}`}>expand_more</span>
                        </button>
                      </div>
                    )}

                    {checked && sucursales.length === 0 && (
                      <span className="text-[10px] text-gray-400 italic flex-shrink-0">Sin sucursales</span>
                    )}
                  </div>

                  {checked && expanded && sucursales.length > 0 && (
                    <div className="border-t border-gray-100 dark:border-gray-800 bg-white/60 dark:bg-gray-800/30 px-3 pb-3 pt-2">
                      <div className="flex items-center justify-between mb-2 pl-8">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Sucursales</span>
                        <button
                          type="button"
                          onClick={() => toggleAllSucursales(id)}
                          className="text-[10px] font-bold text-[#2c528c] hover:text-blue-800 transition-colors"
                        >
                          {sucursales.every(s => asig?.sucursalIds.includes(s.id)) ? 'Deseleccionar todas' : 'Seleccionar todas'}
                        </button>
                      </div>
                      <div className="space-y-1 pl-8">
                        {sucursales.map((suc) => {
                          const sucChecked = isSucursalChecked(id, suc.id)
                          return (
                            <button
                              type="button"
                              key={suc.id}
                              onClick={() => toggleSucursal(id, suc.id)}
                              className={`w-full flex items-center gap-2.5 p-2.5 rounded-lg border text-left transition-all ${
                                sucChecked
                                  ? 'border-[#2c528c]/30 bg-[#2c528c]/5 dark:bg-[#2c528c]/10'
                                  : 'border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                              }`}
                            >
                              <div className={`size-4 rounded flex-shrink-0 flex items-center justify-center border-2 transition-colors ${
                                sucChecked ? 'bg-[#2c528c] border-[#2c528c]' : 'border-gray-300 dark:border-gray-600'
                              }`}>
                                {sucChecked && <span className="material-symbols-outlined text-white text-xs">check</span>}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs font-semibold truncate ${sucChecked ? 'text-[#2c528c]' : 'text-slate-600 dark:text-gray-300'}`}>{suc.nombre}</p>
                                <p className="text-[10px] text-gray-400 truncate">{suc.lugar}</p>
                              </div>
                              {sucChecked && (
                                <span className="material-symbols-outlined text-[#2c528c] text-sm flex-shrink-0">check_circle</span>
                              )}
                            </button>
                          )
                        })}
                      </div>
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

export default function EditarUsuarioPage() {
  const router = useRouter()
  const params = useParams()
  const { toggle } = useSidebar()
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [companies, setCompanies] = useState<CompanyListItem[]>([])
  const [branchesByCompany, setBranchesByCompany] = useState<Record<string, Branch[]>>({})
  const validGroups = ['Gerente', 'Visualizador'] as const
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [modalEmpresas, setModalEmpresas] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    is_staff: false,
    is_superuser: false,
    asignaciones: [] as AsignacionEmpresa[],
    group_name: '',
    profile: {
      rut: '',
      fecha_nacimiento: '',
      telefono: '',
      numero_credencial: 0,
      fecha_otorgamiento_credencial: '',
      fecha_vencimiento_credencial: '',
      habilitaciones: '' as string,
      eficiencia_operativa: '',
      fecha_ultima_capacitacion: '',
      empresa_capacitadora: '',
    }
  })

  const ensureBranches = async (companyId: string) => {
    if (branchesByCompany[companyId]) return

    const res = await BranchService.listBranches({ company_id: companyId })
    if (!res.success) return

    const list = normalizeBranchesResponse(res.data)
    setBranchesByCompany(prev => ({ ...prev, [companyId]: list }))
  }

  const handleSaveAsignaciones = (asignaciones: AsignacionEmpresa[]) => {
    setFormData({ ...formData, asignaciones })
    const totalSuc = asignaciones.reduce((acc, a) => acc + a.sucursalIds.length, 0)
    toast({
      title: 'Asignaciones actualizadas',
      description: `${asignaciones.length} empresa(s) y ${totalSuc} sucursal(es) asignada(s).`,
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

      const companiesResponse = await CompanyService.getCompanies({ page: 1, page_size: 1000 })
      if (companiesResponse.success && companiesResponse.data?.results) {
        setCompanies(companiesResponse.data.results)
        localStorage.setItem(cacheKey, JSON.stringify({ data: companiesResponse.data.results, ts: Date.now() }))
      }

      const userId = Array.isArray(params.id) ? params.id[0] : params.id
      if (!userId) {
        setUsuario(null)
        return
      }

      const response = await UsersService.getUser(userId)
      if (!response.success || !response.data) {
        setUsuario(null)
        return
      }

      const u = response.data
      const nombre = `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim() || u.email
      const tipoUsuario: Usuario['tipoUsuario'] = (u.is_superuser || u.is_staff)
        ? 'administrador'
        : 'visualizador'

      const branches = (u as any).branches as Array<{
        id: number
        name: string
        company?: { id: number; name: string }
        company_id?: number
        company_name?: string
      }> | undefined
      const asignacionesFromUser: AsignacionEmpresa[] = []
      const asigMap = new Map<string, AsignacionEmpresa>()
      for (const b of branches ?? []) {
        const empresaId = String(b.company?.id ?? b.company_id ?? '')
        const empresaNombre = b.company?.name ?? b.company_name ?? ''
        if (!empresaId) continue
        const existing = asigMap.get(empresaId)
        if (existing) {
          existing.sucursalIds.push(String(b.id))
        } else {
          asigMap.set(empresaId, { empresaId, empresaNombre, sucursalIds: [String(b.id)] })
        }
      }
      asignacionesFromUser.push(...Array.from(asigMap.values()))

      for (const a of asignacionesFromUser) {
        await ensureBranches(a.empresaId)
      }
      const profile = u.profile
      const rawGroupName = u.groups?.[0]?.name ?? ''
      const mappedGroups: Record<string, (typeof validGroups)[number]> = {
        gerente: 'Gerente',
        gerencia: 'Gerente',
        visualizador: 'Visualizador',
      }
      const groupName = mappedGroups[rawGroupName.toLowerCase()] ?? rawGroupName

      const mapped: Usuario = {
        id: String(u.id),
        nombre,
        iniciales: '',
        rut: u.profile?.rut ?? '',
        email: u.email,
        correo: u.email,
        rol: u.groups?.[0]?.name ?? (u.is_superuser ? 'Superusuario' : u.is_staff ? 'Staff' : 'Usuario'),
        avatar: u.avatar ?? '',
        telefono: u.profile?.telefono ?? u.phone ?? '',
        empresa: u.companies?.[0]?.name ?? '',
        tipoUsuario,
        ultimaSesion: u.last_login ?? '',
        colorAvatar: 'blue',
      }

      setUsuario(mapped)
      setFormData({
        email: u.email,
        password: '',
        first_name: u.first_name ?? '',
        last_name: u.last_name ?? '',
        phone: u.phone ?? '',
        is_superuser: Boolean(u.is_superuser),
        is_staff: Boolean(u.is_staff),
        asignaciones: asignacionesFromUser,
        group_name: groupName,
        profile: {
          rut: profile?.rut ?? '',
          fecha_nacimiento: profile?.fecha_nacimiento ?? '',
          telefono: profile?.telefono ?? '',
          numero_credencial: profile?.numero_credencial ?? 0,
          fecha_otorgamiento_credencial: profile?.fecha_otorgamiento_credencial ?? '',
          fecha_vencimiento_credencial: profile?.fecha_vencimiento_credencial ?? '',
          habilitaciones: (profile?.habilitaciones ?? []).join(', '),
          eficiencia_operativa: profile?.eficiencia_operativa ?? '',
          fecha_ultima_capacitacion: profile?.fecha_ultima_capacitacion ?? '',
          empresa_capacitadora: profile?.empresa_capacitadora ?? '',
        },
      })
      setPasswordConfirm('')
    }

    run()
  }, [params.id])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password || passwordConfirm) {
      if (formData.password !== passwordConfirm) {
        toast({
          title: 'Contraseñas no coinciden',
          description: 'La contraseña y su repetición deben ser iguales.',
          variant: 'destructive',
        })
        return
      }
    }

    const userId = Array.isArray(params.id) ? params.id[0] : params.id
    if (!userId) {
      toast({
        title: 'Error al guardar',
        description: 'No se encontró el ID del usuario.',
        variant: 'destructive',
      })
      return
    }

    const groupName = (() => {
      const g = (formData.group_name || '').trim()
      const mapped: Record<string, (typeof validGroups)[number]> = {
        gerente: 'Gerente',
        gerencia: 'Gerente',
        visualizador: 'Visualizador',
      }
      return mapped[g.toLowerCase()] ?? g
    })()

    const payload = {
      email: formData.email,
      first_name: formData.first_name,
      last_name: formData.last_name,
      phone: formData.phone,
      is_superuser: formData.is_superuser,
      is_staff: formData.is_staff,
      branch_ids: formData.asignaciones.flatMap(a => a.sucursalIds).map(Number),
      group_name: groupName,
      ...(formData.password ? { password: formData.password } : {}),
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
    }

    const response = await UsersService.updateUser(userId, payload)
    if (!response.success) {
      const detailsText = response.details
        ? Object.entries(response.details)
          .map(([k, v]) => `${k}: ${v.join(' ')}`)
          .join('\n')
        : ''
      toast({
        title: 'Error al guardar',
        description: detailsText || response.error || 'No se pudieron guardar los cambios.',
        variant: 'destructive',
      })
      return
    }

    toast({
      title: "Usuario actualizado",
      description: `Los datos de "${`${formData.first_name} ${formData.last_name}`.trim()}" han sido guardados exitosamente.`,
    })
    router.push('/usuarios')
  }

  if (!usuario) {
    return (
      <>
        <Header icon="manage_accounts" title="Gestión de Usuarios" onMenuClick={toggle} />
        <div className="p-8 text-center">
          <p className="text-gray-500">Cargando usuario...</p>
        </div>
      </>
    )
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
                  <span className="text-slate-400">Editar Usuario</span>
                </div>
              </li>
            </ol>
          </nav>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-gray-100">Editar Usuario: {usuario.nombre}</h2>
          <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-1">Modifique los datos del usuario en la plataforma.</p>
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
                    placeholder="Ej: Juan Pérez"
                    required
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-[#2c528c] focus:border-[#2c528c]"
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
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-[#2c528c] focus:border-[#2c528c]"
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
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-[#2c528c] focus:border-[#2c528c]"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                    Nueva Contraseña <span className="text-gray-400 font-normal">(dejar vacío para mantener)</span>
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pr-10 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-[#2c528c] focus:border-[#2c528c]"
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
                      className="w-full pr-10 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-[#2c528c] focus:border-[#2c528c]"
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
                    required
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-[#2c528c] focus:border-[#2c528c]"
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
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-[#2c528c] focus:border-[#2c528c]"
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
                  id="is_superuser"
                  name="is_superuser"
                  type="checkbox"
                  checked={formData.is_superuser}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-[#2c528c] focus:ring-[#2c528c]"
                />
                <label htmlFor="is_superuser" className="text-sm text-slate-600 dark:text-gray-300">
                  Es super usuario
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
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-[#2c528c] focus:border-[#2c528c]"
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
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-[#2c528c] focus:border-[#2c528c]"
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
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-[#2c528c] focus:border-[#2c528c]"
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
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-[#2c528c] focus:border-[#2c528c]"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                    Empresas y sucursales asignadas
                  </label>
                  <button
                    type="button"
                    onClick={() => setModalEmpresas(true)}
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
                      onClick={() => setModalEmpresas(true)}
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
                              onClick={() => handleRemoveEmpresa(asig.empresaId)}
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
                                    onClick={() => handleRemoveSucursal(asig.empresaId, suc.id)}
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
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>

      <AsignarEmpresasSucursalesModal
        open={modalEmpresas}
        onClose={() => setModalEmpresas(false)}
        companies={companies}
        branchesByCompany={branchesByCompany}
        onEnsureBranches={ensureBranches}
        asignacionesActuales={formData.asignaciones}
        onSave={handleSaveAsignaciones}
      />
    </>
  )
}

"use client"

import React from "react"

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { useSidebar } from '@/components/layout/dashboard-layout'
import { useToast } from '@/hooks/use-toast'
import { type Operador } from '@/lib/mock-data'
import {
  UsersService,
  type CredentialImageResponse,
  type OperatorDocument,
  type OperatorDocumentType,
} from '@/services/users.service'
import { CompanyService, type CompanyListItem } from '@/services/company.service'
import { BranchService, type Branch } from '@/services/branches.service'
import { canAction, canView } from '@/lib/permissions'

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

function Calificaciones() {
  const params = useParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [docs, setDocs] = useState<OperatorDocument[]>([])

  const [form, setForm] = useState<{
    document_type: OperatorDocumentType
    expiration_date: string
    file: File | null
  }>({
    document_type: 'pilot_license',
    expiration_date: '',
    file: null,
  })

  const userId = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : ''

  const docTypeOptions: Array<{ value: OperatorDocumentType; label: string }> = [
    { value: 'pilot_license', label: 'Licencia de piloto DGAC' },
    { value: 'medical_cert', label: 'Certificado médico' },
    { value: 'training_cert', label: 'Certificado de capacitación' },
    { value: 'rpa_endorsement', label: 'Habilitación RPA' },
    { value: 'insurance', label: 'Seguro personal' },
    { value: 'other_1', label: 'Otros 1' },
    { value: 'other_2', label: 'Otros 2' },
    { value: 'other_3', label: 'Otros 3' },
  ]

  const refresh = async () => {
    if (!userId) return
    setIsLoading(true)
    try {
      const res = await UsersService.listOperatorDocuments(userId)
      if (!res.success || !res.data) {
        toast({
          title: 'No se pudieron cargar los documentos',
          description: res.error || 'Error al obtener documentos del operador.',
          variant: 'destructive',
        })
        return
      }
      setDocs(res.data)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [userId])

  const openDoc = async (doc: OperatorDocument) => {
    const url = doc.file_url
    if (!url) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(url, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })

      if (!response.ok) {
        window.open(url, '_blank', 'noopener,noreferrer')
        return
      }

      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      window.open(objectUrl, '_blank', 'noopener,noreferrer')
      setTimeout(() => URL.revokeObjectURL(objectUrl), 10_000)
    } catch {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  const downloadDoc = async (doc: OperatorDocument) => {
    const url = doc.file_url
    if (!url) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(url, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })

      if (!response.ok) {
        window.open(url, '_blank', 'noopener,noreferrer')
        return
      }

      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = objectUrl
      a.download = doc.original_filename || `${doc.document_type}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(objectUrl)
    } catch {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  const handleUpload = async () => {
    if (!userId) return
    if (!form.file) {
      toast({
        title: 'Faltan datos',
        description: 'Debe seleccionar un archivo.',
        variant: 'destructive',
      })
      return
    }

    setIsUploading(true)
    try {
      const res = await UsersService.uploadOperatorDocument(userId, {
        document_type: form.document_type,
        file: form.file,
        expiration_date: form.expiration_date || undefined,
      })

      if (!res.success || !res.data) {
        toast({
          title: 'No se pudo subir el documento',
          description: res.error || 'Error al cargar documento.',
          variant: 'destructive',
        })
        return
      }

      toast({
        title: 'Documento cargado',
        description: 'El documento fue cargado exitosamente.',
      })

      setForm(prev => ({ ...prev, file: null, expiration_date: '' }))
      await refresh()
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (documentType: OperatorDocumentType) => {
    if (!userId) return
    const ok = window.confirm('¿Eliminar este documento?')
    if (!ok) return

    const res = await UsersService.deleteOperatorDocument(userId, documentType)
    if (!res.success) {
      toast({
        title: 'No se pudo eliminar',
        description: res.error || 'Error al eliminar documento.',
        variant: 'destructive',
      })
      return
    }

    toast({
      title: 'Documento eliminado',
      description: 'El documento fue eliminado.',
    })
    await refresh()
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#2c528c] text-lg sm:text-xl">upload_file</span>
            <h3 className="font-bold text-slate-800 dark:text-white text-sm sm:text-base">Documentos del Operador</h3>
          </div>
          <button
            type="button"
            onClick={refresh}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-200 text-xs sm:text-sm font-semibold px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg flex items-center gap-1.5 sm:gap-2 transition-colors"
            disabled={isLoading}
          >
            <span className="material-symbols-outlined text-sm sm:text-base">refresh</span>
            Actualizar
          </button>
        </div>
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
            <div className="lg:col-span-2">
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-gray-100">Cargar documento</h4>
                  <p className="text-xs text-gray-400 mt-1">PDF, JPG o PNG. Máx. 10MB.</p>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                      Tipo
                    </label>
                    <select
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-xs focus:ring-[#2c528c] focus:border-[#2c528c]"
                      value={form.document_type}
                      onChange={(e) => setForm(prev => ({ ...prev, document_type: e.target.value as OperatorDocumentType }))}
                    >
                      {docTypeOptions.map(o => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                      Archivo
                    </label>
                    <input
                      type="file"
                      accept="application/pdf,image/png,image/jpeg"
                      onChange={(e) => setForm(prev => ({ ...prev, file: e.target.files?.[0] ?? null }))}
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-xs focus:ring-[#2c528c] focus:border-[#2c528c]"
                    />
                    {form.file && (
                      <p className="text-[10px] text-gray-400 mt-1 truncate">
                        {form.file.name} ({Math.round(form.file.size / 1024)} KB)
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                      Fecha de caducidad (opcional)
                    </label>
                    <input
                      type="date"
                      value={form.expiration_date}
                      onChange={(e) => setForm(prev => ({ ...prev, expiration_date: e.target.value }))}
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-xs focus:ring-[#2c528c] focus:border-[#2c528c]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="w-full bg-[#2c528c] hover:bg-blue-800 disabled:opacity-60 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                    <span className="material-symbols-outlined text-base">upload</span>
                    Subir
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-gray-100">Documentos cargados</h4>
                    <p className="text-xs text-gray-400 mt-1">Puede abrir, descargar o eliminar.</p>
                  </div>
                  <span className="text-xs text-gray-400">{docs.length}</span>
                </div>

                {isLoading ? (
                  <div className="p-6 text-sm text-gray-400">Cargando...</div>
                ) : docs.length === 0 ? (
                  <div className="p-6 text-center text-gray-400">
                    <span className="material-symbols-outlined text-4xl">folder_open</span>
                    <p className="text-sm mt-2">No hay documentos cargados</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {docs.map((doc) => (
                      <div key={doc.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-700 dark:text-gray-200 truncate">
                            {doc.document_type_display || doc.document_type}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {doc.original_filename}
                            {doc.expiration_date ? ` • Vence: ${doc.expiration_date}` : ''}
                            {doc.file_size_display ? ` • ${doc.file_size_display}` : ''}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => openDoc(doc)}
                            className="px-3 py-2 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/40 text-slate-700 dark:text-gray-200"
                          >
                            Ver
                          </button>
                          <button
                            type="button"
                            onClick={() => downloadDoc(doc)}
                            className="px-3 py-2 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/40 text-slate-700 dark:text-gray-200"
                          >
                            Descargar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(doc.document_type)}
                            className="px-3 py-2 text-xs font-semibold rounded-lg border border-red-200 dark:border-red-900/40 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function EditarOperadorPage() {
  const router = useRouter()
  const params = useParams()
  const { toggle } = useSidebar()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('datos-personales')
  const [operador, setOperador] = useState<Operador | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [companies, setCompanies] = useState<CompanyListItem[]>([])
  const [branchesByCompany, setBranchesByCompany] = useState<Record<string, Branch[]>>({})
  const [modalEmpresas, setModalEmpresas] = useState(false)
  const [credentialImage, setCredentialImage] = useState<File | null>(null)
  const [credentialImageInfo, setCredentialImageInfo] = useState<CredentialImageResponse | null>(null)
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
      fecha_otorgamiento_credencial: '',
      fecha_vencimiento_credencial: '',
      eficiencia_operativa: '',
      fecha_ultima_capacitacion: '',
      empresa_capacitadora: '',
    },
  })
  const canRead = mounted && canView('operadores')
  const canUpdate = mounted && canAction('operadores', 'update')

  useEffect(() => {
    setMounted(true)

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
        setOperador(null)
        return
      }

      const response = await UsersService.getUser(userId)
      if (!response.success || !response.data) {
        setOperador(null)
        return
      }

      const u = response.data
      const g = String(u.groups?.[0]?.name ?? '').trim().toLowerCase()
      if (g !== 'operador') {
        setOperador(null)
        return
      }

      const firstName = u.first_name ?? ''
      const lastName = u.last_name ?? ''
      const nombre = `${firstName} ${lastName}`.trim() || u.email
      const iniciales = `${(firstName?.[0] || '').toUpperCase()}${(lastName?.[0] || '').toUpperCase()}` || '?'
      const rut = u.profile?.rut ?? ''
      const empresaId = String(u.companies?.[0]?.id ?? '')
      const empresaNombre = u.companies?.[0]?.name ?? ''

      setOperador({
        id: String(u.id),
        nombre,
        rut,
        correo: u.email,
        telefono: u.profile?.telefono ?? u.phone ?? '',
        fechaNacimiento: u.profile?.fecha_nacimiento ?? '',
        numeroCredencial: String(u.profile?.numero_credencial ?? ''),
        empresaId,
        empresaNombre,
        iniciales,
      })

      const rawHabilitaciones = Array.isArray(u.profile?.habilitaciones)
        ? u.profile?.habilitaciones
        : String(u.profile?.habilitaciones ?? '')
            .split(',')
            .map(s => s.trim())
            .filter(Boolean)

      setHabilitaciones(Array.from({ length: 10 }, (_, i) => rawHabilitaciones?.[i] ?? ''))

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
        const empresaIdFromBranch = String(b.company?.id ?? b.company_id ?? '')
        const empresaNombreFromBranch = b.company?.name ?? b.company_name ?? ''
        if (!empresaIdFromBranch) continue
        const existing = asigMap.get(empresaIdFromBranch)
        if (existing) {
          existing.sucursalIds.push(String(b.id))
        } else {
          asigMap.set(empresaIdFromBranch, {
            empresaId: empresaIdFromBranch,
            empresaNombre: empresaNombreFromBranch,
            sucursalIds: [String(b.id)],
          })
        }
      }
      asignacionesFromUser.push(...Array.from(asigMap.values()))

      for (const a of asignacionesFromUser) {
        await ensureBranches(a.empresaId)
      }

      setFormData({
        first_name: firstName,
        last_name: lastName,
        email: u.email,
        password: '',
        confirmPassword: '',
        phone: u.phone ?? '',
        asignaciones: asignacionesFromUser,
        profile: {
          rut: u.profile?.rut ?? '',
          fecha_nacimiento: u.profile?.fecha_nacimiento ?? new Date().toISOString().slice(0, 10),
          telefono: u.profile?.telefono ?? '',
          numero_credencial: Number(u.profile?.numero_credencial ?? 0),
          fecha_otorgamiento_credencial: u.profile?.fecha_otorgamiento_credencial ?? new Date().toISOString().slice(0, 10),
          fecha_vencimiento_credencial: u.profile?.fecha_vencimiento_credencial ?? new Date().toISOString().slice(0, 10),
          eficiencia_operativa: u.profile?.eficiencia_operativa ?? new Date().toISOString().slice(0, 10),
          fecha_ultima_capacitacion: u.profile?.fecha_ultima_capacitacion ?? new Date().toISOString().slice(0, 10),
          empresa_capacitadora: u.profile?.empresa_capacitadora ?? '',
        },
      })

      const imageResponse = await UsersService.getCredentialImage(userId)
      if (imageResponse.success && imageResponse.data) {
        setCredentialImageInfo(imageResponse.data)
      } else {
        setCredentialImageInfo(null)
      }
    }

    run()
  }, [params.id])

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
    if (!canUpdate || !operador?.id) return

    if (formData.password) {
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: 'Contraseñas no coinciden',
          description: 'La contraseña y su confirmación deben ser iguales.',
          variant: 'destructive',
        })
        return
      }
    }

    setIsSaving(true)
    try {
      const groupName = 'Operador'
      const payload = {
        email: formData.email,
        password: formData.password ? formData.password : undefined,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        is_superuser: false,
        is_staff: false,
        branch_ids: formData.asignaciones.flatMap(a => a.sucursalIds).map(Number),
        group_name: groupName,
        profile: {
          rut: formData.profile.rut,
          fecha_nacimiento: formData.profile.fecha_nacimiento,
          telefono: formData.profile.telefono,
          numero_credencial: formData.profile.numero_credencial,
          fecha_otorgamiento_credencial: formData.profile.fecha_otorgamiento_credencial,
          fecha_vencimiento_credencial: formData.profile.fecha_vencimiento_credencial,
          habilitaciones: habilitaciones
            .map(s => String(s).trim())
            .filter(Boolean),
          eficiencia_operativa: formData.profile.eficiencia_operativa,
          fecha_ultima_capacitacion: formData.profile.fecha_ultima_capacitacion,
          empresa_capacitadora: formData.profile.empresa_capacitadora,
        },
      }

      const response = await UsersService.updateUser(operador.id, payload)
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
          title: 'Error al actualizar operador',
          description: detailsText || response.error || 'No se pudo actualizar el operador.',
          variant: 'destructive',
        })
        return
      }

      if (credentialImage) {
        const imgRes = await UsersService.uploadCredentialImage(operador.id, credentialImage)
        if (!imgRes.success) {
          toast({
            title: 'Operador actualizado, pero no se pudo subir la credencial',
            description: imgRes.error || 'No se pudo subir la imagen de credencial.',
            variant: 'destructive',
          })
        }
      }

      toast({
        title: 'Operador actualizado',
        description: `Los datos de "${response.data.first_name} ${response.data.last_name}" han sido guardados exitosamente.`,
      })
      router.push('/operadores')
    } finally {
      setIsSaving(false)
    }
  }

  if (mounted && !canRead) {
    return (
      <>
        <Header icon="engineering" title="Operadores" onMenuClick={toggle} />
        <div className="p-8 text-center">
          <p className="text-gray-500">No tienes permisos para acceder a esta sección.</p>
        </div>
      </>
    )
  }

  if (!operador) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">search_off</span>
          <p className="text-gray-500">Operador no encontrado</p>
          <Link href="/operadores" className="text-[#2c528c] hover:underline mt-2 inline-block">
            Volver al listado
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <Header icon="engineering" title={`Editar: ${operador.nombre}`} onMenuClick={toggle} />

      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full">
        {/* Title */}
        <div className="mb-6 lg:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-gray-100">Ficha del Operador</h2>
            <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-1">
              Edite la información básica y profesional del operador.
            </p>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <Link
              href="/operadores"
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors text-center"
            >
              Cancelar
            </Link>
            {canUpdate && (
              <button 
                onClick={handleSubmit}
                disabled={isSaving}
                className="flex-1 sm:flex-none bg-[#2c528c] hover:bg-blue-800 text-white text-xs sm:text-sm font-semibold px-4 sm:px-6 py-2 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
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
              className={`pb-3 text-sm border-b-2 flex items-center gap-2 ${
                activeTab === 'datos-personales'
                  ? 'font-bold text-[#2c528c] border-[#2c528c]'
                  : 'font-medium text-gray-400 dark:text-gray-500 border-transparent hover:text-gray-600 transition-all'
              }`}
            >
              <span className="material-symbols-outlined text-xl">person</span>
              Datos personales
            </button>
            <button
              onClick={() => setActiveTab('datos-profesionales')}
              className={`pb-3 text-sm border-b-2 flex items-center gap-2 ${
                activeTab === 'datos-profesionales'
                  ? 'font-bold text-[#2c528c] border-[#2c528c]'
                  : 'font-medium text-gray-400 dark:text-gray-500 border-transparent hover:text-gray-600 transition-all'
              }`}
            >
              <span className="material-symbols-outlined text-xl">work</span>
              Datos profesionales
            </button>
            <button
              onClick={() => setActiveTab('calificaciones')}
              className={`pb-3 text-sm border-b-2 flex items-center gap-2 ${
                activeTab === 'calificaciones'
                  ? 'font-bold text-[#2c528c] border-[#2c528c]'
                  : 'font-medium text-gray-400 dark:text-gray-500 border-transparent hover:text-gray-600 transition-all'
              }`}
            >
              <span className="material-symbols-outlined text-xl">upload_file</span>
              Documentos
            </button>
          </div>
        </div>

        {/* Content */}
        <fieldset disabled={!canUpdate} className="contents">
          {activeTab === 'datos-personales' && (
            <DatosPersonales
              canUpdate={canUpdate}
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
              canUpdate={canUpdate}
              formData={formData}
              onChange={handleChange}
              habilitaciones={habilitaciones}
              setHabilitaciones={setHabilitaciones}
              credentialImage={credentialImage}
              setCredentialImage={setCredentialImage}
              credentialImageInfo={credentialImageInfo}
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
    </>
  )
}

function DatosPersonales({
  canUpdate,
  formData,
  onChange,
  companies,
  branchesByCompany,
  onOpenEmpresas,
  onRemoveEmpresa,
  onRemoveSucursal,
}: {
  canUpdate: boolean
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
      <div className="p-8">
        <form className="space-y-8">
          {/* Datos básicos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block mb-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tight" htmlFor="nombre">
                Nombre completo
              </label>
              <input
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-[#2c528c] focus:border-[#2c528c]"
                id="nombre"
                name="first_name"
                value={formData.first_name}
                onChange={onChange}
                type="text"
              />
            </div>
            <div>
              <label className="block mb-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tight" htmlFor="apellido">
                Apellido
              </label>
              <input
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-[#2c528c] focus:border-[#2c528c]"
                id="apellido"
                name="last_name"
                value={formData.last_name}
                onChange={onChange}
                type="text"
              />
            </div>
            <div>
              <label className="block mb-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tight" htmlFor="nacimiento">
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
              <label className="block mb-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tight" htmlFor="rut">
                Rut
              </label>
              <input
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-[#2c528c] focus:border-[#2c528c]"
                id="rut"
                name="profile.rut"
                value={formData.profile.rut}
                onChange={onChange}
                type="text"
              />
            </div>
            <div>
              <label className="block mb-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tight" htmlFor="credencial">
                Número de credencial
              </label>
              <input
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-[#2c528c] focus:border-[#2c528c]"
                id="credencial"
                name="profile.numero_credencial"
                value={String(formData.profile.numero_credencial ?? '')}
                onChange={onChange}
                type="number"
                max={99999}
              />
              <p className="text-[10px] text-gray-400 mt-1 italic">Máximo 5 dígitos</p>
            </div>
            <div>
              <label className="block mb-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tight" htmlFor="telefono">
                Teléfono
              </label>
              <input
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-[#2c528c] focus:border-[#2c528c]"
                id="telefono"
                name="phone"
                value={formData.phone}
                onChange={onChange}
                type="tel"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block mb-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tight" htmlFor="email">
                Correo electrónico
              </label>
              <input
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-[#2c528c] focus:border-[#2c528c]"
                id="email"
                name="email"
                value={formData.email}
                onChange={onChange}
                type="email"
              />
            </div>
            <div>
              <label className="block mb-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tight" htmlFor="password">
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
              <p className="text-[10px] text-gray-400 mt-1 italic">Si lo deja vacío no se modificará la contraseña.</p>
            </div>
            <div>
              <label className="block mb-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tight" htmlFor="confirmPassword">
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
      {/* <div className="px-8 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800 flex justify-end">
        {canUpdate && (
          <button type="button" className="bg-[#2c528c] hover:bg-blue-800 text-white text-sm font-bold px-10 py-3 rounded-lg flex items-center gap-2 transition-all shadow-lg active:scale-95">
            <span className="material-symbols-outlined">save</span>
            Guardar Cambios
          </button>
        )}
      </div> */}
    </div>
  )
}

function DatosProfesionales({
  canUpdate,
  formData,
  onChange,
  habilitaciones,
  setHabilitaciones,
  credentialImage,
  setCredentialImage,
  credentialImageInfo,
}: {
  canUpdate: boolean
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
  credentialImageInfo: CredentialImageResponse | null
}) {
  const isPdfUrl = (url: string) => /\.pdf(\?|#|$)/i.test(url)

  const handleDownloadCredential = async () => {
    const url = credentialImageInfo?.image_url
    if (!url) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(url, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })

      if (!response.ok) {
        window.open(url, '_blank', 'noopener,noreferrer')
        return
      }

      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      const extension = (() => {
        const contentType = response.headers.get('content-type') || ''
        if (contentType.includes('pdf')) return 'pdf'
        if (contentType.includes('png')) return 'png'
        if (contentType.includes('jpeg') || contentType.includes('jpg')) return 'jpg'
        if (contentType.includes('webp')) return 'webp'
        return 'jpg'
      })()

      const a = document.createElement('a')
      a.href = objectUrl
      a.download = `credencial_operador.${extension}`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(objectUrl)
    } catch {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <form className="space-y-8">
      {/* Credencial de Operador */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#2c528c]">badge</span>
          <h3 className="font-bold text-slate-800 dark:text-white">Credencial de Operador</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5" htmlFor="fecha_otorgamiento">
              Fecha otorgamiento credencial
            </label>
            <input
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-[#2c528c] focus:border-[#2c528c]"
              id="fecha_otorgamiento"
              type="date"
              name="profile.fecha_otorgamiento_credencial"
              value={formData.profile.fecha_otorgamiento_credencial}
              onChange={onChange}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5" htmlFor="fecha_vencimiento">
              Fecha vencimiento credencial
            </label>
            <input
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-[#2c528c] focus:border-[#2c528c]"
              id="fecha_vencimiento"
              type="date"
              name="profile.fecha_vencimiento_credencial"
              value={formData.profile.fecha_vencimiento_credencial}
              onChange={onChange}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Imagen credencial operador</label>
            <input
              id="credencial_doc"
              type="file"
              accept="image/*,application/pdf,.pdf"
              onChange={(e) => setCredentialImage(e.target.files?.[0] ?? null)}
              className="hidden"
            />

            {credentialImageInfo?.has_image && credentialImageInfo.image_url && !isPdfUrl(credentialImageInfo.image_url) ? (
              <div className="mb-3 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                <img
                  src={credentialImageInfo.image_url}
                  alt="Imagen credencial operador"
                  className="w-full max-h-72 object-contain bg-gray-50 dark:bg-gray-800"
                />
              </div>
            ) : null}

            {credentialImageInfo?.has_image && credentialImageInfo.image_url && isPdfUrl(credentialImageInfo.image_url) ? (
              <div className="mb-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="material-symbols-outlined text-red-500">picture_as_pdf</span>
                  <p className="text-sm text-slate-700 dark:text-gray-200 truncate">PDF cargado</p>
                </div>
                <a
                  href={credentialImageInfo.image_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Ver
                </a>
              </div>
            ) : null}

            {credentialImageInfo?.has_image && credentialImageInfo.image_url ? (
              <div className="mb-3 flex justify-end">
                <button
                  type="button"
                  onClick={handleDownloadCredential}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">download</span>
                  Descargar credencial
                </button>
              </div>
            ) : null}

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

      {/* Habilitaciones */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#2c528c]">verified</span>
          <h3 className="font-bold text-slate-800 dark:text-white">Habilitaciones</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i}>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5" htmlFor={`habil_${i + 1}`}>
                Habilitación {i + 1}
              </label>
              <input
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-[#2c528c] focus:border-[#2c528c]"
                id={`habil_${i + 1}`}
                value={habilitaciones[i] ?? ''}
                onChange={(e) =>
                  setHabilitaciones((prev) => {
                    const next = [...prev]
                    next[i] = e.target.value
                    return next
                  })
                }
                type="text"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Capacitación y Eficiencia */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#2c528c]">school</span>
          <h3 className="font-bold text-slate-800 dark:text-white">Capacitación y Eficiencia</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5" htmlFor="eficiencia_fecha">
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
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5" htmlFor="ultima_cap_fecha">
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
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5" htmlFor="empresa_capacitadora">
              Empresa capacitadora
            </label>
            <input
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-[#2c528c] focus:border-[#2c528c]"
              id="empresa_capacitadora"
              name="profile.empresa_capacitadora"
              value={formData.profile.empresa_capacitadora}
              onChange={onChange}
              type="text"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4 pb-12">
        <Link
          href="/operadores"
          className="px-6 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Cancelar
        </Link>
        {canUpdate && (
          <button
            type="button"
            className="px-8 py-2.5 rounded-lg bg-[#2c528c] hover:bg-blue-800 text-white text-sm font-bold shadow-lg transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">save</span>
            Guardar Cambios
          </button>
        )}
      </div>
    </form>
  )
}

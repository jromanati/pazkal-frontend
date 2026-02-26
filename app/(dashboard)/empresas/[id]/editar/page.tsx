"use client"

import React from "react"
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { useSidebar } from '@/components/layout/dashboard-layout'
import { useToast } from '@/hooks/use-toast'
import { CompanyService, type CompanyDocumentItem, type CompanyDocumentType } from '@/services/company.service'
import {
  BranchService,
  type Branch,
  type BranchDocumentItem,
  type BranchDocumentType,
} from '@/services/branches.service'
import { canAction, canView } from '@/lib/permissions'
import { type Empresa } from '@/lib/mock-data'
type Tab = 'datos' | 'documentos' | 'sucursales'

export default function EditarEmpresaPage() {
  const router = useRouter()
  const params = useParams()
  const { toggle } = useSidebar()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('datos')
  const [empresa, setEmpresa] = useState<Empresa | null>(null)
  const canRead = mounted && canView('empresas')
  const canUpdate = mounted && canAction('empresas', 'update')
  const [formData, setFormData] = useState({
    rut: '',
    nombre: '',
    razonSocial: '',
    sucursal: '',
    numeroAoc: '',
    especificacion: '',
    nombreGerente: '',
    correoGerente: '',
    telefonoGerente: '',
    inspectorDgac: '',
    correoDgac: ''
  })

  useEffect(() => {
    setMounted(true)

    const run = async () => {
      if (mounted && !canRead) return

      const companyId = Array.isArray(params.id) ? params.id[0] : params.id
      if (!companyId) {
        setEmpresa(null)
        return
      }
      const response = await CompanyService.getCompany(companyId)
      if (!response.success || !response.data) {
        setEmpresa(null)
        return
      }

      const c = response.data
      const mapped: Empresa = {
        id: String(c.id),
        nombre: c.name ?? '',
        rut: c.tax_id ?? '',
        razonSocial: c.legal_name ?? '',
        address: c.address ?? '',
        aocCeo: c.aoc_ceo_number ?? '',
        numeroAoc: c.aoc_ceo_number ?? '',
        especificacion: c.operations_specification ?? '',
        nombreGerente: c.operations_manager_name ?? '',
        correoGerente: c.operations_manager_email ?? '',
        telefonoGerente: c.operations_manager_phone ?? '',
        inspectorDgac: c.dgac_inspector_name ?? '',
        correoDgac: c.dgac_inspector_email ?? '',
      }

      setEmpresa(mapped)
      setFormData({
        rut: mapped.rut || '',
        nombre: mapped.nombre || '',
        razonSocial: mapped.razonSocial || '',
        sucursal: mapped.address || '',
        numeroAoc: mapped.numeroAoc || '',
        especificacion: mapped.especificacion || '',
        nombreGerente: mapped.nombreGerente || '',
        correoGerente: mapped.correoGerente || '',
        telefonoGerente: mapped.telefonoGerente || '',
        inspectorDgac: mapped.inspectorDgac || '',
        correoDgac: mapped.correoDgac || ''
      })
    }

    run()
  }, [params.id, mounted, canRead])

  if (mounted && !canRead) {
    return (
      <>
        <Header icon="corporate_fare" title="Empresas" onMenuClick={toggle} />
        <div className="p-8 text-center">
          <p className="text-gray-500">No tienes permisos para acceder a esta sección.</p>
        </div>
      </>
    )
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!canUpdate) return

    const companyId = Array.isArray(params.id) ? params.id[0] : params.id
    if (!companyId) {
      toast({
        title: 'Error al guardar',
        description: 'No se encontró el ID de la empresa.',
        variant: 'destructive',
      })
      return
    }
    const response = await CompanyService.updateCompany(companyId, {
      name: formData.nombre,
      legal_name: formData.razonSocial,
      address: formData.sucursal,
      tax_id: formData.rut,
      phone: '',
      email: formData.correoGerente || 'user@example.com',
      website: '',
      notes: '',
      aoc_ceo_number: formData.numeroAoc,
      operations_specification: formData.especificacion,
      operations_manager_name: formData.nombreGerente,
      operations_manager_email: formData.correoGerente || 'user@example.com',
      operations_manager_phone: formData.telefonoGerente,
      dgac_inspector_name: formData.inspectorDgac,
      dgac_inspector_email: formData.correoDgac || 'user@example.com',
    })

    if (!response.success) {
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
        title: 'Error al guardar',
        description: detailsText || response.error || 'No se pudieron guardar los cambios.',
        variant: 'destructive',
      })
      return
    }

    toast({
      title: "Empresa actualizada",
      description: `Los datos de "${formData.nombre}" han sido guardados exitosamente.`,
    })
    router.push('/empresas')
  }

  if (!empresa) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">search_off</span>
          <p className="text-gray-500">Empresa no encontrada</p>
          <Link href="/empresas" className="text-[#2c528c] hover:underline mt-2 inline-block">
            Volver al listado
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <Header icon="corporate_fare" title={`Editar: ${empresa.nombre}`} onMenuClick={toggle} />

      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 mb-6 lg:mb-8 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('datos')}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm whitespace-nowrap ${activeTab === 'datos' ? 'font-semibold text-[#2c528c] border-b-2 border-[#2c528c]' : 'text-gray-500 hover:text-[#2c528c] transition-colors'}`}
          >
            Datos empresa
          </button>
          <button 
            onClick={() => setActiveTab('documentos')}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm whitespace-nowrap ${activeTab === 'documentos' ? 'font-semibold text-[#2c528c] border-b-2 border-[#2c528c]' : 'text-gray-500 hover:text-[#2c528c] transition-colors'}`}
          >
            Documentos empresa
          </button>
          <button 
            onClick={() => setActiveTab('sucursales')}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm whitespace-nowrap ${activeTab === 'sucursales' ? 'font-semibold text-[#2c528c] border-b-2 border-[#2c528c]' : 'text-gray-500 hover:text-[#2c528c] transition-colors'}`}
          >
            Sucursales
          </button>
        </div>

        {activeTab === 'datos' && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                <fieldset disabled={!canUpdate} className="contents">
                {/* Datos básicos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2" htmlFor="rut">
                      Rut empresa
                    </label>
                    <input 
                      className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:ring-[#2c528c] focus:border-[#2c528c]" 
                      id="rut" 
                      value={formData.rut}
                      onChange={handleChange}
                      placeholder="12.345.678-9" 
                      type="text"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2" htmlFor="nombre">
                      Nombre
                    </label>
                    <input 
                      className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:ring-[#2c528c] focus:border-[#2c528c]" 
                      id="nombre" 
                      value={formData.nombre}
                      onChange={handleChange}
                      placeholder="Nombre comercial" 
                      type="text"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2" htmlFor="razonSocial">
                      Razon social
                    </label>
                    <input 
                      className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:ring-[#2c528c] focus:border-[#2c528c]" 
                      id="razonSocial" 
                      value={formData.razonSocial}
                      onChange={handleChange}
                      placeholder="Razón social completa" 
                      type="text"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2" htmlFor="sucursal">
                      Sucursal
                    </label>
                    <input 
                      className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:ring-[#2c528c] focus:border-[#2c528c]" 
                      id="sucursal" 
                      value={formData.sucursal}
                      onChange={handleChange}
                      placeholder="Dirección de la sucursal" 
                      type="text"
                    />
                  </div>
                </div>

                {/* Información de Operaciones */}
                <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-[#2c528c]">flight</span>
                    Información de Operaciones
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2" htmlFor="numeroAoc">
                        Número AOC/CEO
                      </label>
                      <input 
                        className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:ring-[#2c528c] focus:border-[#2c528c]" 
                        id="numeroAoc" 
                        value={formData.numeroAoc}
                        onChange={handleChange}
                        placeholder="Ej: 1234" 
                        type="text"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2" htmlFor="especificacion">
                        Especificación de operaciones
                      </label>
                      <input 
                        className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:ring-[#2c528c] focus:border-[#2c528c]" 
                        id="especificacion" 
                        value={formData.especificacion}
                        onChange={handleChange}
                        placeholder="Detalle técnico" 
                        type="text"
                      />
                    </div>
                  </div>
                </div>

                {/* Gerente de Operaciones */}
                <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-[#2c528c]">person</span>
                    Gerente de Operaciones
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2" htmlFor="nombreGerente">
                        Nombre del gerente
                      </label>
                      <input 
                        className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:ring-[#2c528c] focus:border-[#2c528c]" 
                        id="nombreGerente" 
                        value={formData.nombreGerente}
                        onChange={handleChange}
                        placeholder="Nombre completo" 
                        type="text"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2" htmlFor="correoGerente">
                        Correo gerente
                      </label>
                      <input 
                        className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:ring-[#2c528c] focus:border-[#2c528c]" 
                        id="correoGerente" 
                        value={formData.correoGerente}
                        onChange={handleChange}
                        placeholder="correo@ejemplo.com" 
                        type="email"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2" htmlFor="telefonoGerente">
                        Teléfono gerente
                      </label>
                      <input 
                        className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:ring-[#2c528c] focus:border-[#2c528c]" 
                        id="telefonoGerente" 
                        value={formData.telefonoGerente}
                        onChange={handleChange}
                        placeholder="+56 9 ..." 
                        type="tel"
                      />
                    </div>
                  </div>
                </div>

                {/* Contacto DGAC */}
                <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-[#2c528c]">verified_user</span>
                    Contacto DGAC
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2" htmlFor="inspectorDgac">
                        Inspector DGAC
                      </label>
                      <input 
                        className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:ring-[#2c528c] focus:border-[#2c528c]" 
                        id="inspectorDgac" 
                        value={formData.inspectorDgac}
                        onChange={handleChange}
                        placeholder="Nombre del inspector asignado" 
                        type="text"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2" htmlFor="correoDgac">
                        Correo DGAC
                      </label>
                      <input 
                        className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:ring-[#2c528c] focus:border-[#2c528c]" 
                        id="correoDgac" 
                        value={formData.correoDgac}
                        onChange={handleChange}
                        placeholder="inspector@dgac.gob.cl" 
                        type="email"
                      />
                    </div>
                  </div>
                </div>
                </fieldset>
              </form>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 dark:bg-gray-800/50 p-6 flex justify-end gap-4 border-t border-gray-200 dark:border-gray-800">
              <Link
                href="/empresas"
                className="px-6 py-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                Cancelar
              </Link>
              {canUpdate && (
                <button 
                  onClick={handleSubmit}
                  className="bg-[#2c528c] hover:bg-blue-800 text-white text-sm font-bold px-8 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg"
                >
                  <span className="material-symbols-outlined text-lg">save</span>
                  <span>Guardar Cambios</span>
                </button>
              )}
            </div>
          </div>
        )}

        {activeTab === 'documentos' && (
          <DocumentosEmpresa
            companyId={Array.isArray(params.id) ? params.id[0] : params.id}
            canUpdate={canUpdate}
            onBack={() => setActiveTab('datos')}
          />
        )}

        {activeTab === 'sucursales' && (
         <SucursalesEmpresa
           empresaId={Array.isArray(params.id) ? params.id[0] : params.id}
           canUpdate={canUpdate}
         />
        )}
      </div>
    </>
  )
}

function DocumentosEmpresa({
  onBack,
  companyId,
  canUpdate,
}: {
  onBack: () => void
  companyId: string | string[] | undefined
  canUpdate: boolean
}) {
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [documents, setDocuments] = useState<CompanyDocumentItem[]>([])
  const [expirationDates, setExpirationDates] = useState<Partial<Record<CompanyDocumentType, string>>>({})
  const showExpirationDate = false

  const companyIdValue = Array.isArray(companyId) ? companyId[0] : companyId

  const documentTypes: { type: CompanyDocumentType; label: string; icon: string; desc: string }[] = [
    // { type: 'operations_spec', label: 'Especificación de operación', icon: 'upload_file', desc: 'PDF, JPG, PNG - máx 10MB' },
    { type: 'aoc_cert', label: 'Certificado AOC', icon: 'verified_user', desc: 'PDF, JPG, PNG - máx 10MB' },
    { type: 'ops_manual', label: 'Manual de operaciones', icon: 'menu_book', desc: 'PDF, JPG, PNG - máx 10MB' },
    { type: 'sms', label: 'SMS', icon: 'security', desc: 'PDF, JPG, PNG - máx 10MB' },
    // { type: 'insurance', label: 'Póliza de seguros', icon: 'policy', desc: 'PDF, JPG, PNG - máx 10MB' },
    // { type: 'jac_resolution', label: 'Resolución JAC', icon: 'gavel', desc: 'PDF, JPG, PNG - máx 10MB' },
    // { type: 'equipment_records', label: 'Registros de equipo', icon: 'inventory_2', desc: 'PDF, JPG, PNG - máx 10MB' },
    // { type: 'flight_auth', label: 'Autorizaciones de vuelo', icon: 'task', desc: 'PDF, JPG, PNG - máx 10MB' },
    { type: 'kmz', label: 'KMZ', icon: 'map', desc: 'KMZ - máx 10MB' },
    // { type: 'mandate_auth', label: 'Carta de autorización mandante', icon: 'history_edu', desc: 'PDF, JPG, PNG - máx 10MB' },
    // { type: 'special_auth', label: 'Autorizaciones especiales', icon: 'workspace_premium', desc: 'PDF, JPG, PNG - máx 10MB' },
    // { type: 'aircraft_maint', label: 'Mantención de aeronave', icon: 'build_circle', desc: 'PDF, JPG, PNG - máx 10MB' },
  ]

  const refresh = async () => {
    if (!companyIdValue) return
    setLoading(true)
    try {
      const res = await CompanyService.listCompanyDocuments(companyIdValue)
      if (res.success && Array.isArray(res.data)) {
        setDocuments(res.data)
        return
      }
      toast({
        title: 'Error al listar documentos',
        description: res.error || 'No se pudieron cargar los documentos.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [companyIdValue])

  const docByType = documents.reduce((acc, d) => {
    acc[d.document_type] = d
    return acc
  }, {} as Record<string, CompanyDocumentItem>)

  const downloadDocument = async (doc: CompanyDocumentItem) => {
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
      a.download = doc.original_filename || `${doc.document_type}`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(objectUrl)
    } catch {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  const deleteDocument = async (documentType: CompanyDocumentType) => {
    if (!companyIdValue) return

    setLoading(true)
    try {
      const res = await CompanyService.deleteCompanyDocument(companyIdValue, documentType)
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
        description: 'El documento fue eliminado correctamente.',
      })
      await refresh()
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (documentType: CompanyDocumentType, file: File | null) => {
    if (!companyIdValue || !file) return
    if (!canUpdate) return

    setLoading(true)
    try {
      const expiration_date = expirationDates[documentType]
      const res = await CompanyService.uploadCompanyDocument(companyIdValue, {
        document_type: documentType,
        file,
        expiration_date: expiration_date || undefined,
      })

      if (!res.success) {
        toast({
          title: 'No se pudo subir el documento',
          description: res.error || 'Error al cargar documento.',
          variant: 'destructive',
        })
        return
      }

      toast({
        title: 'Documento cargado',
        description: 'El documento fue cargado correctamente.',
      })
      refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-gray-100">Documentación de la Empresa</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Cargue los documentos legales y técnicos requeridos para la operación.
        </p>
      </div>

      {loading && (
        <div className="mb-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-4 py-3 text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
          <span className="material-symbols-outlined animate-spin">progress_activity</span>
          Cargando...
        </div>
      )}

      <form className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documentTypes.map((docType) => {
            const doc = docByType[docType.type]
            const uploaded = Boolean(doc)
            const inputId = `file_${docType.type}`

            return (
              <div key={docType.type} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-bold text-slate-700 dark:text-gray-300">
                    {doc?.document_type_display || docType.label}
                  </label>
                  {uploaded && (
                    <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      Cargado
                    </span>
                  )}
                </div>

                <label
                  htmlFor={canUpdate ? inputId : undefined}
                  className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-center transition-all ${
                    uploaded
                      ? 'border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-900/10'
                      : 'border-gray-200 dark:border-gray-700 hover:border-[#2c528c] hover:bg-gray-50'
                  } ${canUpdate ? 'cursor-pointer' : ''}`}
                >
                  <span className={`material-symbols-outlined mb-2 ${uploaded ? 'text-green-500' : 'text-gray-400'}`}>{docType.icon}</span>
                  <p className="text-[11px] text-gray-500 mb-2">{docType.desc}</p>
                  <button type="button" className="text-xs font-bold text-[#2c528c] hover:underline" disabled={!canUpdate}>
                    {uploaded ? 'Reemplazar archivo' : 'Subir archivo'}
                  </button>
                </label>

                {canUpdate && (
                  <input
                    id={inputId}
                    type="file"
                    accept={docType.type === 'kmz' ? '.kmz' : '.pdf,.png,.jpg,.jpeg'}
                    className="hidden"
                    onChange={(e) => handleUpload(docType.type, e.target.files?.[0] ?? null)}
                    disabled={loading}
                  />
                )}

                {uploaded && (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] text-gray-500 truncate" title={doc.original_filename}>
                        {doc.original_filename}
                      </p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => downloadDocument(doc)}
                          className="text-xs font-bold text-[#2c528c] hover:underline"
                        >
                          Descargar
                        </button>
                        {canUpdate && (
                          <button
                            type="button"
                            onClick={() => deleteDocument(docType.type)}
                            className="text-xs font-bold text-red-600 hover:underline"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    </div>

                    {showExpirationDate && (
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1" htmlFor={`exp_${docType.type}`}>
                          Fecha de caducidad
                        </label>
                        <input
                          className="w-full text-xs border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded focus:ring-[#2c528c] focus:border-[#2c528c]"
                          id={`exp_${docType.type}`}
                          type="date"
                          disabled={!canUpdate}
                          value={expirationDates[docType.type] ?? (doc?.expiration_date ?? '')}
                          onChange={(e) =>
                            setExpirationDates((prev) => ({
                              ...prev,
                              [docType.type]: e.target.value,
                            }))
                          }
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Footer 
        <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-800 mt-8">
          <button 
            type="button"
            onClick={onBack}
            className="px-6 py-2 border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Anterior
          </button>
           <div className="flex gap-4">
            <button 
              type="button"
              onClick={() => router.push('/empresas')}
              className="bg-[#2c528c] hover:bg-blue-800 text-white font-bold px-10 py-2 rounded-lg shadow-lg transition-all transform hover:scale-[1.02]"
            >
              Guardar Cambios
            </button>
          </div> 
        </div>
        */}
      </form>
    </>
  )
}

// ---- Sucursales Tab ----
function SucursalesEmpresa({ empresaId, canUpdate }: { empresaId: string; canUpdate: boolean }) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [sucursales, setSucursales] = useState<Branch[]>([])
  const [documentsByBranch, setDocumentsByBranch] = useState<Record<string, BranchDocumentItem[]>>({})
  const [showFormSucursal, setShowFormSucursal] = useState(false)
  const [editingSucursal, setEditingSucursal] = useState<Branch | null>(null)
  const [sucForm, setSucForm] = useState({ nombre: '', lugar: '', fechaContrato: '' })
  const [showDocModal, setShowDocModal] = useState<{ open: boolean; sucursalId: string | null }>({ open: false, sucursalId: null })
  const [docForm, setDocForm] = useState<{ tipo: BranchDocumentType | ''; file: File | null; expiration_date: string }>({
    tipo: '',
    file: null,
    expiration_date: '',
  })
  const [expandedSucursal, setExpandedSucursal] = useState<string | null>(null)

  const documentTypes: Array<{ value: BranchDocumentType; label: string }> = [
    { value: 'operations_spec', label: 'Especificación de operación' },
    { value: 'insurance', label: 'Póliza de seguros' },
    { value: 'flight_auth', label: 'Autorizaciones de vuelo' },
    { value: 'kmz', label: 'KMZ (Archivos de georreferencia)' },
    { value: 'special_auth', label: 'Autorizaciones especiales' },
    { value: 'jac_resolution', label: 'Resolución JAC' },
    { value: 'other_1', label: 'Otros 1' },
    { value: 'other_2', label: 'Otros 2' },
    { value: 'other_3', label: 'Otros 3' },
  ]

  const getTipoLabel = (tipo: string) => documentTypes.find(t => t.value === tipo)?.label || tipo

  useEffect(() => {
    const run = async () => {
      if (!empresaId) return

      setLoading(true)
      try {
        const res = await BranchService.listBranches({ company_id: empresaId })
        if (!res.success || !res.data) {
          toast({
            title: 'No se pudieron cargar las sucursales',
            description: res.error || 'Error desconocido',
            variant: 'destructive',
          })
          return
        }

        const raw: any = res.data
        const list: Branch[] = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.results)
            ? raw.results
            : []

        setSucursales(list)
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [empresaId, toast])

  const openNewSucursal = () => {
    if (!canUpdate) return
    setEditingSucursal(null)
    setSucForm({ nombre: '', lugar: '', fechaContrato: '' })
    setShowFormSucursal(true)
  }

  const openEditSucursal = (suc: Branch) => {
    if (!canUpdate) return
    setEditingSucursal(suc)
    setSucForm({
      nombre: suc.name,
      lugar: suc.location,
      fechaContrato: suc.contract_date,
    })
    setShowFormSucursal(true)
  }

  const saveSucursal = async () => {
    if (!canUpdate) return
    if (!sucForm.nombre || !sucForm.lugar || !sucForm.fechaContrato) return

    setLoading(true)
    try {
      if (editingSucursal) {
        const res = await BranchService.updateBranch(editingSucursal.id, {
          name: sucForm.nombre,
          location: sucForm.lugar,
          contract_date: sucForm.fechaContrato,
        })
        if (!res.success || !res.data) {
          toast({
            title: 'No se pudo actualizar la sucursal',
            description: res.error || 'Error desconocido',
            variant: 'destructive',
          })
          return
        }
        setSucursales(prev => prev.map(s => (s.id === editingSucursal.id ? res.data! : s)))
        toast({ title: 'Sucursal actualizada', description: `"${sucForm.nombre}" ha sido actualizada.` })
      } else {
        const res = await BranchService.createBranch({
          company_id: Number(empresaId),
          name: sucForm.nombre,
          location: sucForm.lugar,
          contract_date: sucForm.fechaContrato,
        })
        if (!res.success || !res.data) {
          toast({
            title: 'No se pudo crear la sucursal',
            description: res.error || 'Error desconocido',
            variant: 'destructive',
          })
          return
        }
        setSucursales(prev => [...prev, res.data!])
        toast({ title: 'Sucursal creada', description: `"${sucForm.nombre}" ha sido agregada.` })
      }

      setShowFormSucursal(false)
      setEditingSucursal(null)
    } finally {
      setLoading(false)
    }
  }

  const deleteSucursal = async (id: number) => {
    if (!canUpdate) return
    const suc = sucursales.find(s => s.id === id)

    setLoading(true)
    try {
      const res = await BranchService.deleteBranch(id)
      if (!res.success) {
        toast({
          title: 'No se pudo eliminar la sucursal',
          description: res.error || 'Error desconocido',
          variant: 'destructive',
        })
        return
      }
      setSucursales(prev => prev.filter(s => s.id !== id))
      setDocumentsByBranch(prev => {
        const next = { ...prev }
        delete next[String(id)]
        return next
      })
      toast({ title: 'Sucursal eliminada', description: `"${suc?.name ?? ''}" ha sido eliminada.` })
    } finally {
      setLoading(false)
    }
  }

  const toggleExpandSucursal = async (branchId: number) => {
    const id = String(branchId)
    const isOpen = expandedSucursal === id
    if (isOpen) {
      setExpandedSucursal(null)
      return
    }

    setExpandedSucursal(id)
    if (documentsByBranch[id]) return

    setLoading(true)
    try {
      const res = await BranchService.listBranchDocuments(branchId)
      if (!res.success || !res.data) {
        toast({
          title: 'No se pudieron cargar los documentos',
          description: res.error || 'Error desconocido',
          variant: 'destructive',
        })
        return
      }
      setDocumentsByBranch(prev => ({ ...prev, [id]: res.data! }))
    } finally {
      setLoading(false)
    }
  }

  const addDocumento = async () => {
    if (!canUpdate) return
    if (!docForm.tipo || !showDocModal.sucursalId) return
    if (!docForm.file) return

    const branchId = showDocModal.sucursalId
    const tipoLabel = getTipoLabel(docForm.tipo)

    setLoading(true)
    try {
      const res = await BranchService.uploadBranchDocument(branchId, {
        document_type: docForm.tipo,
        file: docForm.file,
        ...(docForm.expiration_date ? { expiration_date: docForm.expiration_date } : {}),
      })
      if (!res.success || !res.data) {
        toast({
          title: 'No se pudo subir el documento',
          description: res.error || 'Error desconocido',
          variant: 'destructive',
        })
        return
      }

      setDocumentsByBranch(prev => {
        const current = prev[branchId] ?? []
        return { ...prev, [branchId]: [...current, res.data!] }
      })

      toast({ title: 'Documento cargado', description: `"${tipoLabel}" ha sido agregado a la sucursal.` })
      setShowDocModal({ open: false, sucursalId: null })
      setDocForm({ tipo: '', file: null, expiration_date: '' })
    } finally {
      setLoading(false)
    }
  }

  const removeDocumento = async (branchId: number, docType: BranchDocumentType) => {
    if (!canUpdate) return
    const id = String(branchId)
    setLoading(true)
    try {
      const res = await BranchService.deleteBranchDocument(branchId, docType)
      if (!res.success) {
        toast({
          title: 'No se pudo eliminar el documento',
          description: res.error || 'Error desconocido',
          variant: 'destructive',
        })
        return
      }
      setDocumentsByBranch(prev => ({
        ...prev,
        [id]: (prev[id] ?? []).filter(d => d.document_type !== docType),
      }))
      toast({ title: 'Documento eliminado', description: 'El documento ha sido removido.' })
    } finally {
      setLoading(false)
    }
  }

  const downloadBranchDocument = async (doc: BranchDocumentItem) => {
    const url = doc.file_url
    if (!url) return

    try {
      const a = document.createElement('a')
      a.href = url
      a.target = '_blank'
      a.rel = 'noopener noreferrer'
      document.body.appendChild(a)
      a.click()
      a.remove()
    } catch {
      toast({
        title: 'No se pudo descargar',
        description: 'El navegador bloqueó la descarga o no se pudo abrir el documento.',
        variant: 'destructive',
      })
    }
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 lg:mb-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-gray-100">Sucursales</h2>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">{sucursales.length} sucursal(es) registrada(s)</p>
        </div>
        <button
          onClick={openNewSucursal}
          disabled={!canUpdate}
          className="bg-[#2c528c] hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-md"
        >
          <span className="material-symbols-outlined text-base sm:text-lg">add</span> Nueva Sucursal
        </button>
      </div>

      {/* Formulario inline para crear/editar sucursal */}
      {showFormSucursal && (
        <div className="bg-white dark:bg-gray-900 border border-[#2c528c]/30 rounded-xl shadow-sm overflow-hidden mb-6 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-5 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-[#2c528c]/5">
            <h3 className="text-sm font-bold text-[#2c528c] flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">{editingSucursal ? 'edit' : 'add_business'}</span>
              {editingSucursal ? 'Editar Sucursal' : 'Nueva Sucursal'}
            </h3>
          </div>
          <div className="p-5 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Nombre</label>
                <input value={sucForm.nombre} onChange={e => setSucForm({ ...sucForm, nombre: e.target.value })} placeholder="Nombre de la sucursal" className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:ring-[#2c528c] focus:border-[#2c528c]" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Lugar</label>
                <input value={sucForm.lugar} onChange={e => setSucForm({ ...sucForm, lugar: e.target.value })} placeholder="Direccion completa" className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:ring-[#2c528c] focus:border-[#2c528c]" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Fecha de contrato</label>
                <input type="date" value={sucForm.fechaContrato} onChange={e => setSucForm({ ...sucForm, fechaContrato: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:ring-[#2c528c] focus:border-[#2c528c]" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowFormSucursal(false)} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">Cancelar</button>
              <button onClick={saveSucursal} disabled={loading || !canUpdate} className="bg-[#2c528c] hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-6 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-md">
                <span className="material-symbols-outlined text-base">save</span> {editingSucursal ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de sucursales */}
      {loading && sucursales.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600 mb-4 block">progress_activity</span>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Cargando sucursales...</p>
        </div>
      ) : sucursales.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600 mb-4 block">store</span>
          <p className="text-gray-500 dark:text-gray-400 font-medium">No hay sucursales registradas</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Agregue la primera sucursal para esta empresa.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sucursales.map(suc => (
            <div key={suc.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
              {/* Sucursal header */}
              <div className="px-5 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-10 rounded-lg bg-[#2c528c]/10 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-[#2c528c]">store</span>
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-gray-100 truncate">{suc.name}</h4>
                    <p className="text-xs text-gray-500 truncate">{suc.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[10px] text-gray-400 whitespace-nowrap">Contrato: {suc.contract_date}</span>
                  <button onClick={() => toggleExpandSucursal(suc.id)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" title="Ver documentos">
                    <span className={`material-symbols-outlined text-lg text-gray-500 transition-transform ${expandedSucursal === String(suc.id) ? 'rotate-180' : ''}`}>expand_more</span>
                  </button>
                  <button
                    onClick={() => setShowDocModal({ open: true, sucursalId: String(suc.id) })}
                    disabled={!canUpdate}
                    className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                    title="Agregar documento"
                  >
                    <span className="material-symbols-outlined text-lg text-[#2c528c]">attach_file</span>
                  </button>
                  <button
                    onClick={() => openEditSucursal(suc)}
                    disabled={!canUpdate}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                    title="Editar"
                  >
                    <span className="material-symbols-outlined text-lg text-gray-500 hover:text-[#2c528c]">edit</span>
                  </button>
                  <button
                    onClick={() => deleteSucursal(suc.id)}
                    disabled={!canUpdate}
                    className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <span className="material-symbols-outlined text-lg text-gray-500 hover:text-red-500">delete</span>
                  </button>
                </div>
              </div>

              {/* Documentos expandibles */}
              {expandedSucursal === String(suc.id) && (
                <div className="border-t border-gray-100 dark:border-gray-800 px-5 sm:px-6 py-4 bg-gray-50/50 dark:bg-gray-800/30 animate-in fade-in slide-in-from-top-1 duration-150">
                  {loading && !documentsByBranch[String(suc.id)] ? (
                    <p className="text-xs text-gray-400 dark:text-gray-500 py-3 text-center">Cargando documentos...</p>
                  ) : null}
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Documentos ({(documentsByBranch[String(suc.id)] ?? []).length})</p>
                    <button
                      onClick={() => setShowDocModal({ open: true, sucursalId: String(suc.id) })}
                      disabled={!canUpdate}
                      className="text-xs font-semibold text-[#2c528c] hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">add</span> Agregar
                    </button>
                  </div>
                  {(documentsByBranch[String(suc.id)] ?? []).length === 0 ? (
                    <p className="text-xs text-gray-400 dark:text-gray-500 py-3 text-center">No hay documentos cargados para esta sucursal.</p>
                  ) : (
                    <div className="space-y-2">
                      {(documentsByBranch[String(suc.id)] ?? []).map(doc => (
                        <div key={doc.id} className="flex items-center justify-between gap-3 bg-white dark:bg-gray-900 rounded-lg px-4 py-3 border border-gray-100 dark:border-gray-700">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="material-symbols-outlined text-lg text-[#2c528c]">description</span>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-slate-700 dark:text-gray-200 truncate">{doc.original_filename}</p>
                              <p className="text-[10px] text-gray-400">{doc.document_type_display || getTipoLabel(doc.document_type)} - {doc.created_at.slice(0, 10)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => downloadBranchDocument(doc)}
                              className="text-xs font-bold text-[#2c528c] hover:underline"
                            >
                              Descargar
                            </button>
                            <button
                              onClick={() => removeDocumento(suc.id, doc.document_type)}
                              disabled={!canUpdate}
                              className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
                            >
                              <span className="material-symbols-outlined text-base text-gray-400 hover:text-red-500">close</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal para agregar documento */}
      {showDocModal.open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setShowDocModal({ open: false, sucursalId: null }); setDocForm({ tipo: '', file: null, expiration_date: '' }) }} />
          <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-[90%] sm:max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-bold text-slate-800 dark:text-gray-100 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#2c528c]">attach_file</span>
                Agregar Documento
              </h3>
              <p className="text-xs text-gray-500 mt-1">Seleccione el tipo y cargue el archivo.</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Tipo de documento</label>
                <select value={docForm.tipo} onChange={e => setDocForm({ ...docForm, tipo: e.target.value as BranchDocumentType })} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:ring-[#2c528c] focus:border-[#2c528c]">
                  <option value="">Seleccionar tipo...</option>
                  {documentTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Archivo</label>
                <label className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#2c528c] hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all">
                  <span className="material-symbols-outlined text-3xl text-gray-400 mb-2">cloud_upload</span>
                  <p className="text-xs text-gray-500 mb-1">Arrastre o haga clic para subir</p>
                  <p className="text-[10px] text-gray-400">PDF, JPG, PNG, KMZ (Max 10MB)</p>
                  <input
                    type="file"
                    className="hidden"
                    accept="application/pdf,image/png,image/jpeg,application/vnd.google-earth.kmz,application/octet-stream,.kmz"
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null
                      setDocForm(prev => ({ ...prev, file }))
                    }}
                  />
                  {docForm.file && (
                    <p className="mt-2 text-[10px] text-gray-500 truncate max-w-full">{docForm.file.name}</p>
                  )}
                </label>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Fecha de vencimiento (opcional)</label>
                <input
                  type="date"
                  value={docForm.expiration_date}
                  onChange={(e) => setDocForm(prev => ({ ...prev, expiration_date: e.target.value }))}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:ring-[#2c528c] focus:border-[#2c528c]"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
              <button onClick={() => { setShowDocModal({ open: false, sucursalId: null }); setDocForm({ tipo: '', file: null, expiration_date: '' }) }} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">Cancelar</button>
              <button onClick={addDocumento} disabled={!docForm.tipo || !docForm.file || loading} className="bg-[#2c528c] hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-6 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-md">
                <span className="material-symbols-outlined text-base">upload</span> Cargar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

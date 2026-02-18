"use client"

import React from "react"
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { useSidebar } from '@/components/layout/dashboard-layout'
import { useToast } from '@/hooks/use-toast'
import { type Empresa } from '@/lib/mock-data'
import { CompanyService } from '@/services/company.service'

type Tab = 'datos' | 'documentos'

export default function EditarEmpresaPage() {
  const router = useRouter()
  const params = useParams()
  const { toggle } = useSidebar()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<Tab>('datos')
  const [empresa, setEmpresa] = useState<Empresa | null>(null)
  const [formData, setFormData] = useState({
    rut: '',
    nombre: '',
    razonSocial: '',
    numeroAoc: '',
    especificacion: '',
    nombreGerente: '',
    correoGerente: '',
    telefonoGerente: '',
    inspectorDgac: '',
    correoDgac: ''
  })

  useEffect(() => {
    const run = async () => {
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
  }, [params.id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

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
      tax_id: formData.rut,
      address: '',
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
        </div>

        {activeTab === 'datos' && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
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
              <button 
                onClick={handleSubmit}
                className="bg-[#2c528c] hover:bg-blue-800 text-white text-sm font-bold px-8 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg"
              >
                <span className="material-symbols-outlined text-lg">save</span>
                <span>Guardar Cambios</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'documentos' && (
          <DocumentosEmpresa onBack={() => setActiveTab('datos')} />
        )}
      </div>
    </>
  )
}

function DocumentosEmpresa({ onBack }: { onBack: () => void }) {
  const router = useRouter()

  const documentos = [
    { id: 'especificacion', label: 'Especificación de operación', icon: 'upload_file', desc: 'PDF, JPG o PNG (Máx 10MB)', uploaded: true },
    { id: 'aoc', label: 'Certificado AOC', icon: 'verified_user', desc: 'Certificado de Operador Aéreo', uploaded: true },
    { id: 'manual', label: 'Manual de operaciones', icon: 'menu_book', desc: 'Documento completo (PDF)', uploaded: false },
    { id: 'sms', label: 'SMS', icon: 'security', desc: 'Safety Management System', uploaded: false },
    { id: 'poliza', label: 'Póliza de seguros', icon: 'policy', desc: 'Vigente para el periodo actual', uploaded: true },
    { id: 'jac', label: 'Resolucion JAC', icon: 'gavel', desc: 'Resolución Junta Aeronáutica', uploaded: false },
    { id: 'equipos', label: 'Registros de equipo', icon: 'inventory_2', desc: 'Inventario y especificaciones', uploaded: false },
    { id: 'autorizaciones', label: 'Autorizaciones de vuelo', icon: 'task', desc: 'Permisos vigentes DGAC', uploaded: true },
    { id: 'kmz', label: 'KMZ', icon: 'map', desc: 'Archivos de georreferencia', uploaded: false },
    { id: 'mandante', label: 'Carta de autorización mandante', icon: 'history_edu', desc: 'Poderes o mandatos vigentes', uploaded: false },
    { id: 'especiales', label: 'Autorizaciones especiales', icon: 'workspace_premium', desc: 'Otros permisos específicos', uploaded: false },
  ]

  return (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-gray-100">Documentación de la Empresa</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Cargue los documentos legales y técnicos requeridos para la operación.
        </p>
      </div>

      <form className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documentos.map((doc) => (
            <div key={doc.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-bold text-slate-700 dark:text-gray-300">{doc.label}</label>
                {doc.uploaded && (
                  <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    Cargado
                  </span>
                )}
              </div>
              <div className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                doc.uploaded 
                  ? 'border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-900/10' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-[#2c528c] hover:bg-gray-50'
              }`}>
                <span className={`material-symbols-outlined mb-2 ${doc.uploaded ? 'text-green-500' : 'text-gray-400'}`}>{doc.icon}</span>
                <p className="text-[11px] text-gray-500 mb-2">{doc.desc}</p>
                <button type="button" className="text-xs font-bold text-[#2c528c] hover:underline">
                  {doc.uploaded ? 'Reemplazar archivo' : 'Subir archivo'}
                </button>
              </div>
            </div>
          ))}

          {/* Mantención de aeronave con fecha */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm">
            <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-3">Mantención de aeronave</label>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#2c528c] hover:bg-gray-50 transition-all">
                <span className="material-symbols-outlined text-gray-400 mb-2">build_circle</span>
                <button type="button" className="text-xs font-bold text-[#2c528c] hover:underline">Subir archivo</button>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1" htmlFor="caducidad">
                  Fecha de caducidad
                </label>
                <input 
                  className="w-full text-xs border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded focus:ring-[#2c528c] focus:border-[#2c528c]" 
                  id="caducidad" 
                  type="date"
                  defaultValue="2025-12-31"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-800 mt-8">
          <button 
            type="button"
            onClick={onBack}
            className="px-6 py-2 border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Anterior
          </button>
          <div className="flex gap-4">
            <button type="button" className="px-6 py-2 text-gray-500 font-bold hover:text-slate-800 dark:hover:text-white transition-colors">
              Guardar Borrador
            </button>
            <button 
              type="button"
              onClick={() => router.push('/empresas')}
              className="bg-[#2c528c] hover:bg-blue-800 text-white font-bold px-10 py-2 rounded-lg shadow-lg transition-all transform hover:scale-[1.02]"
            >
              Guardar Cambios
            </button>
          </div>
        </div>
      </form>
    </>
  )
}

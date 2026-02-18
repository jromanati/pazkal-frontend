"use client"

import React from "react"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { useSidebar } from '@/components/layout/dashboard-layout'
import { useToast } from '@/hooks/use-toast'
import { CompanyService } from '@/services/company.service'
import { canAction } from '@/lib/permissions'

type Tab = 'datos' | 'documentos'

export default function NuevaEmpresaPage() {
  const router = useRouter()
  const { toggle } = useSidebar()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<Tab>('datos')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const canCreate = mounted && canAction('empresas', 'create')

  const [formData, setFormData] = useState({
    rut_empresa: '',
    nombre: '',
    razon_social: '',
    numero_aoc: '',
    especificacion: '',
    nombre_gerente: '',
    correo_gerente: '',
    telefono_gerente: '',
    inspector_dgac: '',
    correo_dgac: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!canCreate) return

    const codeCandidate = (formData.rut_empresa || formData.nombre)
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 12)

    const response = await CompanyService.createCompany({
      name: formData.nombre,
      code: codeCandidate,
      legal_name: formData.razon_social,
      tax_id: formData.rut_empresa,
      address: '',
      phone: '',
      email: formData.correo_gerente || 'user@example.com',
      website: '',
      notes: '',
      aoc_ceo_number: formData.numero_aoc,
      operations_specification: formData.especificacion,
      operations_manager_name: formData.nombre_gerente,
      operations_manager_email: formData.correo_gerente || 'user@example.com',
      operations_manager_phone: formData.telefono_gerente,
      dgac_inspector_name: formData.inspector_dgac,
      dgac_inspector_email: formData.correo_dgac || 'user@example.com',
    })

    if (!response.success) {
      const detailsText = response.details
        ? Object.entries(response.details)
            .map(([k, v]) => `${k}: ${v.join(' ')}`)
            .join('\n')
        : ''
      toast({
        title: 'Error al crear empresa',
        description: detailsText || response.error || 'No se pudo crear la empresa.',
        variant: 'destructive',
      })
      return
    }

    toast({
      title: 'Empresa creada',
      description: 'La empresa ha sido creada exitosamente.',
    })
    router.push('/empresas')
  }

  return (
    <>
      <Header icon="corporate_fare" title="Crear Nueva Empresa" onMenuClick={toggle} />

      {mounted && !canCreate ? (
        <div className="p-8 text-center">
          <p className="text-gray-500">No tienes permisos para crear registros en esta sección.</p>
        </div>
      ) : (

      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 mb-6 lg:mb-8 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('datos')}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm whitespace-nowrap ${activeTab === 'datos' ? 'font-semibold text-[#2c528c] border-b-2 border-[#2c528c]' : 'text-gray-500 hover:text-[#2c528c] transition-colors'}`}
          >
            Datos empresa
          </button>
        </div>

        {activeTab === 'datos' && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
            <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8">
              <fieldset disabled={!canCreate} className="contents">
              <div className="p-4 sm:p-6 lg:p-8">
                  {/* Datos básicos */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 sm:mb-2" htmlFor="rut_empresa">
                        Rut empresa
                      </label>
                      <input 
                        className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-[#2c528c] focus:border-[#2c528c]" 
                        id="rut_empresa" 
                        value={formData.rut_empresa}
                        onChange={handleChange}
                        placeholder="12.345.678-9" 
                        type="text"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 sm:mb-2" htmlFor="nombre">
                        Nombre
                      </label>
                      <input 
                        className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-[#2c528c] focus:border-[#2c528c]" 
                        id="nombre" 
                        value={formData.nombre}
                        onChange={handleChange}
                        placeholder="Nombre comercial" 
                        type="text"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 sm:mb-2" htmlFor="razon_social">
                        Razon social
                      </label>
                      <input 
                        className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-[#2c528c] focus:border-[#2c528c]" 
                        id="razon_social" 
                        value={formData.razon_social}
                        onChange={handleChange}
                        placeholder="Razón social completa" 
                        type="text"
                      />
                    </div>
                  </div>

                  {/* Información de Operaciones */}
                  <div className="pt-4 sm:pt-6 border-t border-gray-100 dark:border-gray-800">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-gray-200 mb-3 sm:mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-base sm:text-lg text-[#2c528c]">flight</span>
                      Información de Operaciones
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 sm:mb-2" htmlFor="numero_aoc">
                          Número AOC/CEO
                        </label>
                        <input 
                          className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-[#2c528c] focus:border-[#2c528c]" 
                          id="numero_aoc" 
                          value={formData.numero_aoc}
                          onChange={handleChange}
                          placeholder="Ej: 1234" 
                          type="text"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 sm:mb-2" htmlFor="especificacion">
                          Especificación de operaciones
                        </label>
                        <input 
                          className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-[#2c528c] focus:border-[#2c528c]" 
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
                  <div className="pt-4 sm:pt-6 border-t border-gray-100 dark:border-gray-800">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-gray-200 mb-3 sm:mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-base sm:text-lg text-[#2c528c]">person</span>
                      Gerente de Operaciones
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 sm:mb-2" htmlFor="nombre_gerente">
                          Nombre del gerente
                        </label>
                        <input 
                          className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-[#2c528c] focus:border-[#2c528c]" 
                          id="nombre_gerente" 
                          value={formData.nombre_gerente}
                          onChange={handleChange}
                          placeholder="Nombre completo" 
                          type="text"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 sm:mb-2" htmlFor="correo_gerente">
                          Correo gerente
                        </label>
                        <input 
                          className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-[#2c528c] focus:border-[#2c528c]" 
                          id="correo_gerente" 
                          value={formData.correo_gerente}
                          onChange={handleChange}
                          placeholder="correo@ejemplo.com" 
                          type="email"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 sm:mb-2" htmlFor="telefono_gerente">
                          Teléfono gerente
                        </label>
                        <input 
                          className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-[#2c528c] focus:border-[#2c528c]" 
                          id="telefono_gerente" 
                          value={formData.telefono_gerente}
                          onChange={handleChange}
                          placeholder="+56 9 ..." 
                          type="tel"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contacto DGAC */}
                  <div className="pt-4 sm:pt-6 border-t border-gray-100 dark:border-gray-800">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-gray-200 mb-3 sm:mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-base sm:text-lg text-[#2c528c]">verified_user</span>
                      Contacto DGAC
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 sm:mb-2" htmlFor="inspector_dgac">
                          Inspector DGAC
                        </label>
                        <input 
                          className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-[#2c528c] focus:border-[#2c528c]" 
                          id="inspector_dgac" 
                          value={formData.inspector_dgac}
                          onChange={handleChange}
                          placeholder="Nombre del inspector asignado" 
                          type="text"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 sm:mb-2" htmlFor="correo_dgac">
                          Correo DGAC
                        </label>
                        <input 
                          className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-[#2c528c] focus:border-[#2c528c]" 
                          id="correo_dgac" 
                          value={formData.correo_dgac}
                          onChange={handleChange}
                          placeholder="inspector@dgac.gob.cl" 
                          type="email"
                        />
                      </div>
                    </div>
                  </div>
              </div>

              {/* Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 sm:gap-4 p-4 sm:p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800">
                <Link
                  href="/empresas"
                  className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors text-center"
                >
                  Cancelar
                </Link>
                {canCreate && (
                  <button
                    type="submit"
                    className="w-full sm:w-auto bg-[#2c528c] hover:bg-blue-800 text-white text-sm font-bold px-8 sm:px-12 py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                  >
                    <span className="material-symbols-outlined text-xl">save</span>
                    Guardar
                  </button>
                )}
              </div>
              </fieldset>
            </form>
          </div>
        )}
      </div>
      )}
    </>
  )
}

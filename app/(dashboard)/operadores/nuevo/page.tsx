"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { useSidebar } from '@/components/layout/dashboard-layout'
import { useToast } from '@/hooks/use-toast'
import { empresasMock, tiposCalificacionMock } from '@/lib/mock-data'
import { canAction } from '@/lib/permissions'

type Tab = 'datos-personales' | 'datos-profesionales' | 'calificaciones'

export default function NuevoOperadorPage() {
  const router = useRouter()
  const { toggle } = useSidebar()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<Tab>('datos-personales')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const canCreate = mounted && canAction('operadores', 'create')

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
                onClick={() => {
                  toast({
                    title: "Operador creado",
                    description: "El operador ha sido creado exitosamente.",
                  })
                  router.push('/operadores')
                }}
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
          {activeTab === 'datos-personales' && <DatosPersonales />}
          {activeTab === 'datos-profesionales' && <DatosProfesionales />}
          {activeTab === 'calificaciones' && <Calificaciones />}
        </fieldset>
      </div>
      )}
    </>
  )
}

function DatosPersonales() {
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
                placeholder="Ej. Juan Pérez González"
                required
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
                required
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
                required
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
                required
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
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {Array.from({ length: 10 }, (_, i) => (
                <div key={i}>
                  <label className="block mb-1 sm:mb-1.5 text-[9px] sm:text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tight" htmlFor={`empresa_${i + 1}`}>
                    Empresa {i + 1}
                  </label>
                  <select
                    className="block w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-[10px] sm:text-sm p-1.5 sm:p-2.5 focus:ring-[#2c528c] focus:border-[#2c528c] transition-colors"
                    id={`empresa_${i + 1}`}
                  >
                    <option value="">Seleccionar...</option>
                    {empresasMock.map((empresa) => (
                      <option key={empresa.id} value={empresa.id}>{empresa.nombre}</option>
                    ))}
                  </select>
                </div>
              ))}
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

function DatosProfesionales() {
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
              type="date"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-1.5" htmlFor="credencial_doc">
              Cargar documento credencial
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 sm:p-6 text-center hover:border-[#2c528c] transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-2xl sm:text-3xl text-gray-400 mb-2">upload_file</span>
              <p className="text-[10px] sm:text-xs text-gray-500">Arrastra o haz clic para subir</p>
            </div>
          </div>
        </div>
      </div>

      {/* Examen Psicotécnico */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#2c528c] text-lg sm:text-xl">psychology</span>
          <h3 className="font-bold text-slate-800 dark:text-white text-sm sm:text-base">Examen Psicotécnico</h3>
        </div>
        <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-1.5" htmlFor="psico_fecha">
              Fecha examen
            </label>
            <input
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-xs sm:text-sm bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 p-2 sm:p-2.5"
              id="psico_fecha"
              type="date"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-1.5" htmlFor="psico_vencimiento">
              Fecha vencimiento
            </label>
            <input
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-xs sm:text-sm bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 p-2 sm:p-2.5"
              id="psico_vencimiento"
              type="date"
            />
          </div>
        </div>
      </div>

      {/* Licencia Médica */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#2c528c] text-lg sm:text-xl">medical_services</span>
          <h3 className="font-bold text-slate-800 dark:text-white text-sm sm:text-base">Licencia Médica</h3>
        </div>
        <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-1.5" htmlFor="medica_fecha">
              Fecha examen médico
            </label>
            <input
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-xs sm:text-sm bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 p-2 sm:p-2.5"
              id="medica_fecha"
              type="date"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-1.5" htmlFor="medica_vencimiento">
              Fecha vencimiento
            </label>
            <input
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-xs sm:text-sm bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 p-2 sm:p-2.5"
              id="medica_vencimiento"
              type="date"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-1.5" htmlFor="medica_clase">
              Clase de licencia
            </label>
            <select
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-xs sm:text-sm bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 p-2 sm:p-2.5"
              id="medica_clase"
            >
              <option value="">Seleccionar clase...</option>
              <option value="1">Clase 1</option>
              <option value="2">Clase 2</option>
              <option value="3">Clase 3</option>
            </select>
          </div>
        </div>
      </div>
    </form>
  )
}

function Calificaciones() {
  const [calificaciones, setCalificaciones] = useState<{tipo: string; fechaVigencia: string}[]>([])

  const addCalificacion = () => {
    setCalificaciones([...calificaciones, { tipo: '', fechaVigencia: '' }])
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

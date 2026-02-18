"use client"

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { useSidebar } from '@/components/layout/dashboard-layout'
import { useToast } from '@/hooks/use-toast'
import { operadoresMock, empresasMock, tiposCalificacionMock, type Operador } from '@/lib/mock-data'

type Tab = 'datos-personales' | 'datos-profesionales' | 'calificaciones'

export default function EditarOperadorPage() {
  const router = useRouter()
  const params = useParams()
  const { toggle } = useSidebar()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<Tab>('datos-personales')
  const [operador, setOperador] = useState<Operador | null>(null)

  useEffect(() => {
    const foundOperador = operadoresMock.find(o => o.id === params.id)
    if (foundOperador) {
      setOperador(foundOperador)
    }
  }, [params.id])

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
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors text-center"
            >
              Cancelar
            </Link>
            <button 
              onClick={() => {
                toast({
                  title: "Operador actualizado",
                  description: `Los datos de "${operador?.nombre}" han sido guardados exitosamente.`,
                })
                router.push('/operadores')
              }}
              className="flex-1 sm:flex-none bg-[#2c528c] hover:bg-blue-800 text-white text-xs sm:text-sm font-semibold px-4 sm:px-6 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-md"
            >
              <span className="material-symbols-outlined text-base sm:text-lg">save</span>
              Guardar
            </button>
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
              <span className="material-symbols-outlined text-xl">workspace_premium</span>
              Calificaciones
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'datos-personales' && <DatosPersonales operador={operador} />}
        {activeTab === 'datos-profesionales' && <DatosProfesionales />}
        {activeTab === 'calificaciones' && <Calificaciones />}
      </div>
    </>
  )
}

function DatosPersonales({ operador }: { operador: Operador }) {
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
                className="block w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm p-2.5 focus:ring-[#2c528c] focus:border-[#2c528c] transition-colors"
                id="nombre"
                defaultValue={operador.nombre}
                required
                type="text"
              />
            </div>
            <div>
              <label className="block mb-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tight" htmlFor="nacimiento">
                Fecha nacimiento
              </label>
              <input
                className="block w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm p-2.5 focus:ring-[#2c528c] focus:border-[#2c528c] transition-colors"
                id="nacimiento"
                defaultValue={operador.fechaNacimiento}
                required
                type="date"
              />
            </div>
            <div>
              <label className="block mb-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tight" htmlFor="rut">
                Rut
              </label>
              <input
                className="block w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm p-2.5 focus:ring-[#2c528c] focus:border-[#2c528c] transition-colors"
                id="rut"
                defaultValue={operador.rut}
                required
                type="text"
              />
            </div>
            <div>
              <label className="block mb-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tight" htmlFor="credencial">
                Número de credencial
              </label>
              <input
                className="block w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm p-2.5 focus:ring-[#2c528c] focus:border-[#2c528c] transition-colors"
                id="credencial"
                defaultValue={operador.numeroCredencial}
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
                className="block w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm p-2.5 focus:ring-[#2c528c] focus:border-[#2c528c] transition-colors"
                id="telefono"
                defaultValue={operador.telefono}
                type="tel"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block mb-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tight" htmlFor="email">
                Correo electrónico
              </label>
              <input
                className="block w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm p-2.5 focus:ring-[#2c528c] focus:border-[#2c528c] transition-colors"
                id="email"
                defaultValue={operador.correo}
                required
                type="email"
              />
            </div>
          </div>

          {/* Asignación de empresas */}
          <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-gray-400">corporate_fare</span>
              <h3 className="text-sm font-bold text-slate-800 dark:text-gray-100 uppercase tracking-wider">Asignación de Empresas</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {Array.from({ length: 10 }, (_, i) => (
                <div key={i}>
                  <label className="block mb-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tight" htmlFor={`empresa_${i + 1}`}>
                    Empresa {i + 1}
                  </label>
                  <select
                    className="block w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm p-2.5 focus:ring-[#2c528c] focus:border-[#2c528c] transition-colors"
                    id={`empresa_${i + 1}`}
                    defaultValue={i === 0 ? operador.empresaId : ''}
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
      <div className="px-8 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800 flex justify-end">
        <button className="bg-[#2c528c] hover:bg-blue-800 text-white text-sm font-bold px-10 py-3 rounded-lg flex items-center gap-2 transition-all shadow-lg active:scale-95">
          <span className="material-symbols-outlined">save</span>
          Guardar Cambios
        </button>
      </div>
    </div>
  )
}

function DatosProfesionales() {
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
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-sm bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
              id="fecha_otorgamiento"
              type="date"
              defaultValue="2020-05-15"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5" htmlFor="fecha_vencimiento">
              Fecha vencimiento credencial
            </label>
            <input
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-sm bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
              id="fecha_vencimiento"
              type="date"
              defaultValue="2025-05-15"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Imagen credencial operador</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-green-300 dark:border-green-700 border-dashed rounded-lg bg-green-50/50 dark:bg-green-900/10 cursor-pointer group">
              <div className="space-y-1 text-center">
                <span className="material-symbols-outlined text-green-500 text-4xl mb-2">check_circle</span>
                <p className="text-sm text-green-600 font-medium">Documento cargado</p>
                <button type="button" className="text-xs font-bold text-[#2c528c] hover:underline">Reemplazar archivo</button>
              </div>
            </div>
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
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-sm bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                id={`habil_${i + 1}`}
                defaultValue={i === 0 ? 'Vuelo por instrumentos' : i === 1 ? 'Multimotor' : ''}
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
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-sm bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
              id="eficiencia_fecha"
              type="date"
              defaultValue="2024-12-01"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5" htmlFor="ultima_cap_fecha">
              Fecha última capacitación (credencial)
            </label>
            <input
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-sm bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
              id="ultima_cap_fecha"
              type="date"
              defaultValue="2024-06-15"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5" htmlFor="empresa_capacitadora">
              Empresa capacitadora
            </label>
            <input
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-sm bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
              id="empresa_capacitadora"
              defaultValue="Instituto de Capacitación Aeronáutica"
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
        <button
          type="submit"
          className="px-8 py-2.5 rounded-lg bg-[#2c528c] hover:bg-blue-800 text-white text-sm font-bold shadow-lg transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-lg">save</span>
          Guardar Cambios
        </button>
      </div>
    </form>
  )
}

function Calificaciones() {
  return (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-gray-100">Configuración de Calificaciones</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Gestione las certificaciones y competencias técnicas del operador.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-[#2c528c]">verified</span>
            Calificaciones y Habilitaciones
          </h3>
          <button className="text-[#2c528c] hover:text-blue-800 text-sm font-bold flex items-center gap-1 transition-colors">
            <span className="material-symbols-outlined text-lg">add_circle</span>
            Agregar Calificación
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            {/* Calificación existente 1 */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo de Calificación</label>
                  <select 
                    className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-sm rounded-lg focus:ring-[#2c528c] focus:border-[#2c528c]"
                    defaultValue="1"
                  >
                    {tiposCalificacionMock.map((tipo) => (
                      <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Aeronave / Especialidad</label>
                  <input
                    className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-sm rounded-lg focus:ring-[#2c528c] focus:border-[#2c528c]"
                    defaultValue="Boeing 737-800"
                    type="text"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fecha de Vencimiento</label>
                  <input
                    className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-sm rounded-lg focus:ring-[#2c528c] focus:border-[#2c528c]"
                    type="date"
                    defaultValue="2025-12-31"
                  />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                  <span className="text-xs text-gray-500">Requerido para operaciones comerciales</span>
                </div>
                <button className="text-red-500 hover:text-red-700 transition-colors">
                  <span className="material-symbols-outlined text-lg">delete</span>
                </button>
              </div>
            </div>

            {/* Calificación existente 2 */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo de Calificación</label>
                  <select 
                    className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-sm rounded-lg focus:ring-[#2c528c] focus:border-[#2c528c]"
                    defaultValue="2"
                  >
                    {tiposCalificacionMock.map((tipo) => (
                      <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Aeronave / Especialidad</label>
                  <input
                    className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-sm rounded-lg focus:ring-[#2c528c] focus:border-[#2c528c]"
                    defaultValue="Airbus A320"
                    type="text"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fecha de Vencimiento</label>
                  <input
                    className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-sm rounded-lg focus:ring-[#2c528c] focus:border-[#2c528c]"
                    type="date"
                    defaultValue="2026-06-30"
                  />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                  <span className="text-xs text-gray-500">Vigente</span>
                </div>
                <button className="text-red-500 hover:text-red-700 transition-colors">
                  <span className="material-symbols-outlined text-lg">delete</span>
                </button>
              </div>
            </div>

            {/* Nueva calificación vacía */}
            <div className="p-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo de Calificación</label>
                  <select className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-sm rounded-lg focus:ring-[#2c528c] focus:border-[#2c528c]">
                    <option value="">Seleccionar...</option>
                    {tiposCalificacionMock.map((tipo) => (
                      <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Aeronave / Especialidad</label>
                  <input
                    className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-sm rounded-lg focus:ring-[#2c528c] focus:border-[#2c528c]"
                    placeholder="Ej: Boeing 737-800"
                    type="text"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fecha de Vencimiento</label>
                  <input
                    className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-sm rounded-lg focus:ring-[#2c528c] focus:border-[#2c528c]"
                    type="date"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-4">
          <Link
            href="/operadores"
            className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Cancelar
          </Link>
          <button className="bg-[#2c528c] hover:bg-blue-800 text-white text-sm font-bold px-8 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg">
            <span className="material-symbols-outlined text-lg">save</span>
            Guardar Cambios
          </button>
        </div>
      </div>
    </>
  )
}

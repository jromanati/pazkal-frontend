"use client"

import React from "react"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { useSidebar } from '@/components/layout/dashboard-layout'
import { useToast } from '@/hooks/use-toast'
import { ordenesVueloMock, operadoresMock, rpasDisponiblesMock } from '@/lib/mock-data'

export default function NuevaBitacoraPage() {
  const router = useRouter()
  const { toggle } = useSidebar()
  const { toast } = useToast()
  
  const [formData, setFormData] = useState({
    ordenN: '',
    fecha: '',
    lugar: '',
    operador: '',
    copiloto: '',
    rpa1Modelo: '',
    rpa1Registro: '',
    rpa2Modelo: '',
    rpa2Registro: '',
    utcSalida: '',
    utcLlegada: '',
    gtmSalida: '',
    gtmLlegada: '',
    tiempoVuelo: '',
    trabajoAereo: '',
    actividadRealizada: '',
    comentarios: ''
  })

  const [baterias, setBaterias] = useState([
    { bateria: 'BATERÍA 1', inicio: '', termino: '' },
    { bateria: 'BATERÍA 2', inicio: '', termino: '' },
    { bateria: 'BATERÍA 3', inicio: '', termino: '' }
  ])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: "Bitácora creada",
      description: "La bitácora de vuelo ha sido creada exitosamente.",
    })
    router.push('/bitacora-vuelo')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleBateriaChange = (index: number, field: 'inicio' | 'termino', value: string) => {
    setBaterias(prev => prev.map((bat, i) => 
      i === index ? { ...bat, [field]: value } : bat
    ))
  }

  return (
    <>
      <Header icon="menu_book" title="Bitácora de Vuelo" onMenuClick={toggle} />

      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full overflow-y-auto">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex mb-4">
          <ol className="inline-flex items-center space-x-1 md:space-x-3 text-xs text-gray-500 uppercase tracking-widest font-semibold">
            <li className="inline-flex items-center">
              <Link href="/bitacora-vuelo" className="hover:text-[#2c528c] transition-colors">Bitácoras</Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="material-symbols-outlined text-sm mx-1">chevron_right</span>
                <span className="text-slate-400">Nueva Bitácora</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Título */}
        <div className="mb-6 lg:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-gray-100">Crear Nueva Bitácora de Vuelo</h2>
          <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-1">Registre los datos efectivos del vuelo realizado.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Información General */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-3 sm:p-4 bg-slate-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#2c528c]">assignment</span>
              <h3 className="font-bold text-slate-700 dark:text-gray-200 text-sm sm:text-base">Información General</h3>
            </div>
            <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Orden N°</label>
                <select 
                  name="ordenN"
                  value={formData.ordenN}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border-gray-300 dark:border-gray-700 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-sm dark:bg-gray-800 dark:text-gray-200"
                >
                  <option value="">Seleccionar Orden</option>
                  {ordenesVueloMock.map(orden => (
                    <option key={orden.id} value={orden.codigo}>{orden.codigo}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Fecha</label>
                <input 
                  type="date"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border-gray-300 dark:border-gray-700 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-sm dark:bg-gray-800 dark:text-gray-200"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Lugar</label>
                <input 
                  type="text"
                  name="lugar"
                  value={formData.lugar}
                  onChange={handleInputChange}
                  placeholder="Ciudad / Aeródromo"
                  className="w-full rounded-lg border-gray-300 dark:border-gray-700 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-sm dark:bg-gray-800 dark:text-gray-200"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Operador (Piloto)</label>
                <select 
                  name="operador"
                  value={formData.operador}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border-gray-300 dark:border-gray-700 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-sm dark:bg-gray-800 dark:text-gray-200"
                >
                  <option value="">Seleccionar Operador</option>
                  {operadoresMock.map(op => (
                    <option key={op.id} value={op.id}>{op.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Copiloto / Obs.</label>
                <input 
                  type="text"
                  name="copiloto"
                  value={formData.copiloto}
                  onChange={handleInputChange}
                  placeholder="Nombre completo"
                  className="w-full rounded-lg border-gray-300 dark:border-gray-700 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-sm dark:bg-gray-800 dark:text-gray-200"
                />
              </div>
            </div>
          </div>

          {/* Equipos RPA y Baterías */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Equipos RPA */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
              <div className="p-3 sm:p-4 bg-slate-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#2c528c]">precision_manufacturing</span>
                <h3 className="font-bold text-slate-700 dark:text-gray-200 text-sm sm:text-base">Equipos RPA</h3>
              </div>
              <div className="p-4 sm:p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">RPA 1 (Modelo)</label>
                    <select 
                      name="rpa1Modelo"
                      value={formData.rpa1Modelo}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border-gray-300 dark:border-gray-700 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-sm dark:bg-gray-800 dark:text-gray-200"
                    >
                      <option value="">Seleccionar</option>
                      {rpasDisponiblesMock.map(rpa => (
                        <option key={rpa.value} value={rpa.label}>{rpa.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Registro RPA 1</label>
                    <input 
                      type="text"
                      name="rpa1Registro"
                      value={formData.rpa1Registro}
                      onChange={handleInputChange}
                      placeholder="DGAC-XXXX"
                      className="w-full rounded-lg border-gray-300 dark:border-gray-700 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-sm dark:bg-gray-800 dark:text-gray-200"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">RPA 2 (Modelo)</label>
                    <select 
                      name="rpa2Modelo"
                      value={formData.rpa2Modelo}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border-gray-300 dark:border-gray-700 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-sm dark:bg-gray-800 dark:text-gray-200"
                    >
                      <option value="">Seleccionar</option>
                      {rpasDisponiblesMock.map(rpa => (
                        <option key={rpa.value} value={rpa.label}>{rpa.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Registro RPA 2</label>
                    <input 
                      type="text"
                      name="rpa2Registro"
                      value={formData.rpa2Registro}
                      onChange={handleInputChange}
                      placeholder="DGAC-YYYY"
                      className="w-full rounded-lg border-gray-300 dark:border-gray-700 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-sm dark:bg-gray-800 dark:text-gray-200"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Ciclos de Baterías */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
              <div className="p-3 sm:p-4 bg-slate-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#2c528c]">battery_charging_full</span>
                <h3 className="font-bold text-slate-700 dark:text-gray-200 text-sm sm:text-base">Ciclos de Baterías</h3>
              </div>
              <div className="p-4 sm:p-6">
                <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                      <tr>
                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] font-bold text-gray-500 uppercase">Batería</th>
                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] font-bold text-gray-500 uppercase">Inicio (%)</th>
                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] font-bold text-gray-500 uppercase">Término (%)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {baterias.map((bat, index) => (
                        <tr key={bat.bateria}>
                          <td className="px-3 sm:px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300">{bat.bateria}</td>
                          <td className="px-2 py-2">
                            <input 
                              type="number"
                              value={bat.inicio}
                              onChange={(e) => handleBateriaChange(index, 'inicio', e.target.value)}
                              placeholder="0"
                              className="w-full rounded-lg border-gray-300 dark:border-gray-700 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-xs dark:bg-gray-800 dark:text-gray-200"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input 
                              type="number"
                              value={bat.termino}
                              onChange={(e) => handleBateriaChange(index, 'termino', e.target.value)}
                              placeholder="0"
                              className="w-full rounded-lg border-gray-300 dark:border-gray-700 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-xs dark:bg-gray-800 dark:text-gray-200"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Registro de Tiempo */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-3 sm:p-4 bg-slate-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#2c528c]">schedule</span>
              <h3 className="font-bold text-slate-700 dark:text-gray-200 text-sm sm:text-base">Registro de Tiempo</h3>
            </div>
            <div className="p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Hora Salida (UTC)</label>
                <input 
                  type="time"
                  name="utcSalida"
                  value={formData.utcSalida}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border-gray-300 dark:border-gray-700 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-sm dark:bg-gray-800 dark:text-gray-200"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Hora Llegada (UTC)</label>
                <input 
                  type="time"
                  name="utcLlegada"
                  value={formData.utcLlegada}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border-gray-300 dark:border-gray-700 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-sm dark:bg-gray-800 dark:text-gray-200"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Hora Salida (GTM)</label>
                <input 
                  type="time"
                  name="gtmSalida"
                  value={formData.gtmSalida}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border-gray-300 dark:border-gray-700 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-sm dark:bg-gray-800 dark:text-gray-200"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Hora Llegada (GTM)</label>
                <input 
                  type="time"
                  name="gtmLlegada"
                  value={formData.gtmLlegada}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border-gray-300 dark:border-gray-700 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-sm dark:bg-gray-800 dark:text-gray-200"
                />
              </div>
              <div className="col-span-2 sm:col-span-1 bg-[#2c528c]/5 dark:bg-[#2c528c]/10 p-3 rounded-lg border border-[#2c528c]/20">
                <label className="block text-xs font-bold text-[#2c528c] dark:text-blue-400 mb-1.5 uppercase tracking-wider">T. Vuelo (Minutos)</label>
                <input 
                  type="number"
                  name="tiempoVuelo"
                  value={formData.tiempoVuelo}
                  onChange={handleInputChange}
                  placeholder="00"
                  className="w-full rounded-lg border-gray-300 dark:border-gray-700 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-sm font-bold text-[#2c528c] dark:bg-gray-800 dark:text-blue-400"
                />
              </div>
            </div>
          </div>

          {/* Detalles de Operación */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-3 sm:p-4 bg-slate-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#2c528c]">description</span>
              <h3 className="font-bold text-slate-700 dark:text-gray-200 text-sm sm:text-base">Detalles de Operación</h3>
            </div>
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Trabajo Aéreo</label>
                <input 
                  type="text"
                  name="trabajoAereo"
                  value={formData.trabajoAereo}
                  onChange={handleInputChange}
                  placeholder="Tipo de misión realizada"
                  className="w-full rounded-lg border-gray-300 dark:border-gray-700 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-sm dark:bg-gray-800 dark:text-gray-200"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Actividad Realizada y Condiciones Operacionales</label>
                <textarea 
                  name="actividadRealizada"
                  value={formData.actividadRealizada}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Detalle la actividad y el clima/entorno..."
                  className="w-full rounded-lg border-gray-300 dark:border-gray-700 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-sm dark:bg-gray-800 dark:text-gray-200"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Comentarios y Endosos</label>
                <textarea 
                  name="comentarios"
                  value={formData.comentarios}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Notas adicionales o novedades técnicas..."
                  className="w-full rounded-lg border-gray-300 dark:border-gray-700 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-sm dark:bg-gray-800 dark:text-gray-200"
                />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pb-8 sm:pb-12">
            <Link
              href="/bitacora-vuelo"
              className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors text-center"
            >
              Cancelar
            </Link>
            <button 
              type="submit"
              className="w-full sm:w-auto bg-[#2c528c] hover:bg-blue-800 text-white text-sm font-bold px-8 sm:px-10 py-2.5 sm:py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
            >
              <span className="material-symbols-outlined text-xl">save</span>
              Guardar Bitácora
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

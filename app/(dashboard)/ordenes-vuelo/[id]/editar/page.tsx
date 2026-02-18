"use client"

import React from "react"

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { useSidebar } from '@/components/layout/dashboard-layout'
import { useToast } from '@/hooks/use-toast'
import { ordenesVueloMock, operadoresMock, tiposTrabajoAereoMock, type OrdenVuelo } from '@/lib/mock-data'
import { canAction, canView } from '@/lib/permissions'

export default function EditarOrdenVueloPage() {
  const router = useRouter()
  const params = useParams()
  const { toggle } = useSidebar()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [orden, setOrden] = useState<OrdenVuelo | null>(null)
  const canRead = mounted && canView('ordenes_vuelo')
  const canUpdate = mounted && canAction('ordenes_vuelo', 'update')
  const [formData, setFormData] = useState({
    piloto: '',
    observador: '',
    rpa: '',
    tipoVuelo: '',
    fecha: '',
    trabajoAereo: '',
    lugar: '',
    trabajo: '',
    utcActividad: '',
    notam: '',
    areaGeografica: '',
    areasPeligrosas: '',
    gerenteResponsable: '',
    estado: '' as OrdenVuelo['estado'] | ''
  })

  useEffect(() => {
    setMounted(true)

    const ordenEncontrada = ordenesVueloMock.find(o => o.id === params.id)
    if (ordenEncontrada) {
      setOrden(ordenEncontrada)
      setFormData({
        piloto: ordenEncontrada.pilotoId,
        observador: ordenEncontrada.observador || '',
        rpa: ordenEncontrada.rpa || '',
        tipoVuelo: ordenEncontrada.tipoVuelo || '',
        fecha: ordenEncontrada.fecha,
        trabajoAereo: ordenEncontrada.trabajoAereo || '',
        lugar: ordenEncontrada.lugar,
        trabajo: ordenEncontrada.trabajo,
        utcActividad: ordenEncontrada.utcActividad || '',
        notam: ordenEncontrada.notam || '',
        areaGeografica: ordenEncontrada.areaGeografica || '',
        areasPeligrosas: ordenEncontrada.areasPeligrosas || '',
        gerenteResponsable: ordenEncontrada.gerenteResponsable || '',
        estado: ordenEncontrada.estado
      })
    }
  }, [params.id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!canUpdate) return

    toast({
      title: "Orden actualizada",
      description: `La orden "${orden?.codigo}" ha sido actualizada exitosamente.`,
    })
    router.push('/ordenes-vuelo')
  }

  if (!orden) {
    return (
      <>
        <Header icon="assignment" title="Órdenes de Vuelo" onMenuClick={toggle} />
        <div className="p-8 text-center">
          <p className="text-gray-500">Orden no encontrada</p>
        </div>
      </>
    )
  }

  return (
    <>
      <Header icon="assignment" title={`Editar: ${orden.codigo}`} onMenuClick={toggle} />

      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="inline-flex items-center space-x-1 md:space-x-3 text-xs text-gray-500 uppercase tracking-widest font-semibold">
            <li className="inline-flex items-center">
              <Link href="/ordenes-vuelo" className="hover:text-[#2c528c] transition-colors">
                Órdenes de Vuelo
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="material-symbols-outlined text-sm mx-1">chevron_right</span>
                <span className="text-slate-400">Editar {orden.codigo}</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Title */}
        <div className="mb-6 lg:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-gray-100">Editar Orden de Vuelo</h2>
          <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-1">
            Modifique los detalles de la orden de vuelo {orden.codigo}.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <fieldset disabled={!canUpdate} className="contents">
          {/* Estado */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#2c528c]">flag</span>
              <h3 className="font-bold text-slate-700 dark:text-gray-200 text-sm sm:text-base">Estado de la Orden</h3>
            </div>
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="max-w-xs">
                <label htmlFor="estado" className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-gray-300 mb-1.5">
                  Estado actual
                </label>
                <select
                  id="estado"
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  className="block w-full rounded-lg border-gray-300 dark:border-gray-700 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-xs sm:text-sm dark:bg-gray-800 dark:text-gray-200"
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="en_vuelo">En Vuelo</option>
                  <option value="completado">Completado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
            </div>
          </div>

          {/* Información General */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#2c528c]">info</span>
              <h3 className="font-bold text-slate-700 dark:text-gray-200 text-sm sm:text-base">Información General</h3>
            </div>
            <div className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div>
                <label htmlFor="piloto" className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-gray-300 mb-1.5">
                  Piloto
                </label>
                <select
                  id="piloto"
                  name="piloto"
                  value={formData.piloto}
                  onChange={handleChange}
                  className="block w-full rounded-lg border-gray-300 dark:border-gray-700 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-xs sm:text-sm dark:bg-gray-800 dark:text-gray-200"
                >
                  <option value="">Seleccione un operador</option>
                  {operadoresMock.map((op) => (
                    <option key={op.id} value={op.id}>{op.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="observador" className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-gray-300 mb-1.5">
                  Observador
                </label>
                <input
                  type="text"
                  id="observador"
                  name="observador"
                  value={formData.observador}
                  onChange={handleChange}
                  placeholder="Nombre del observador"
                  className="block w-full rounded-lg border-gray-300 dark:border-gray-700 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-xs sm:text-sm dark:bg-gray-800 dark:text-gray-200"
                />
              </div>
              <div>
                <label htmlFor="rpa" className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-gray-300 mb-1.5">
                  RPA
                </label>
                <input
                  type="text"
                  id="rpa"
                  name="rpa"
                  value={formData.rpa}
                  onChange={handleChange}
                  placeholder="Identificación del RPA"
                  className="block w-full rounded-lg border-gray-300 dark:border-gray-700 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-xs sm:text-sm dark:bg-gray-800 dark:text-gray-200"
                />
              </div>
              <div>
                <label htmlFor="tipoVuelo" className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-gray-300 mb-1.5">
                  Tipo de vuelo
                </label>
                <input
                  type="text"
                  id="tipoVuelo"
                  name="tipoVuelo"
                  value={formData.tipoVuelo}
                  onChange={handleChange}
                  placeholder="Ej: Fotogrametría"
                  className="block w-full rounded-lg border-gray-300 dark:border-gray-700 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-xs sm:text-sm dark:bg-gray-800 dark:text-gray-200"
                />
              </div>
              <div>
                <label htmlFor="fecha" className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-gray-300 mb-1.5">
                  Fecha
                </label>
                <input
                  type="date"
                  id="fecha"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleChange}
                  className="block w-full rounded-lg border-gray-300 dark:border-gray-700 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-xs sm:text-sm dark:bg-gray-800 dark:text-gray-200"
                />
              </div>
              <div>
                <label htmlFor="trabajoAereo" className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-gray-300 mb-1.5">
                  Trabajo aéreo
                </label>
                <select
                  id="trabajoAereo"
                  name="trabajoAereo"
                  value={formData.trabajoAereo}
                  onChange={handleChange}
                  className="block w-full rounded-lg border-gray-300 dark:border-gray-700 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-xs sm:text-sm dark:bg-gray-800 dark:text-gray-200"
                >
                  <option value="">Seleccione tipo de trabajo</option>
                  {tiposTrabajoAereoMock.map((tipo) => (
                    <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Detalles de Operación y Zona */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#2c528c]">map</span>
              <h3 className="font-bold text-slate-700 dark:text-gray-200 text-sm sm:text-base">Detalles de Operación y Zona</h3>
            </div>
            <div className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label htmlFor="lugar" className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-gray-300 mb-1.5">
                  Lugar
                </label>
                <input
                  type="text"
                  id="lugar"
                  name="lugar"
                  value={formData.lugar}
                  onChange={handleChange}
                  placeholder="Ubicación de despegue/operación"
                  className="block w-full rounded-lg border-gray-300 dark:border-gray-700 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-xs sm:text-sm dark:bg-gray-800 dark:text-gray-200"
                />
              </div>
              <div>
                <label htmlFor="trabajo" className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-gray-300 mb-1.5">
                  Trabajo
                </label>
                <input
                  type="text"
                  id="trabajo"
                  name="trabajo"
                  value={formData.trabajo}
                  onChange={handleChange}
                  placeholder="Especificación técnica"
                  className="block w-full rounded-lg border-gray-300 dark:border-gray-700 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-xs sm:text-sm dark:bg-gray-800 dark:text-gray-200"
                />
              </div>
              <div>
                <label htmlFor="utcActividad" className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-gray-300 mb-1.5">
                  UTC actividad
                </label>
                <input
                  type="text"
                  id="utcActividad"
                  name="utcActividad"
                  value={formData.utcActividad}
                  onChange={handleChange}
                  placeholder="Ej: 14:00 - 18:00 UTC"
                  className="block w-full rounded-lg border-gray-300 dark:border-gray-700 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-xs sm:text-sm dark:bg-gray-800 dark:text-gray-200"
                />
              </div>
              <div>
                <label htmlFor="notam" className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-gray-300 mb-1.5">
                  Notam
                </label>
                <input
                  type="text"
                  id="notam"
                  name="notam"
                  value={formData.notam}
                  onChange={handleChange}
                  placeholder="Referencia NOTAM si aplica"
                  className="block w-full rounded-lg border-gray-300 dark:border-gray-700 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-xs sm:text-sm dark:bg-gray-800 dark:text-gray-200"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="areaGeografica" className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-gray-300 mb-1.5">
                  Área geográfica
                </label>
                <textarea
                  id="areaGeografica"
                  name="areaGeografica"
                  value={formData.areaGeografica}
                  onChange={handleChange}
                  placeholder="Coordenadas o límites del polígono"
                  rows={2}
                  className="block w-full rounded-lg border-gray-300 dark:border-gray-700 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-xs sm:text-sm dark:bg-gray-800 dark:text-gray-200"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="areasPeligrosas" className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-gray-300 mb-1.5">
                  Áreas prohibidas o peligrosas
                </label>
                <textarea
                  id="areasPeligrosas"
                  name="areasPeligrosas"
                  value={formData.areasPeligrosas}
                  onChange={handleChange}
                  placeholder="Identificación de restricciones en la zona"
                  rows={2}
                  className="block w-full rounded-lg border-gray-300 dark:border-gray-700 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-xs sm:text-sm dark:bg-gray-800 dark:text-gray-200"
                />
              </div>
              <div>
                <label htmlFor="gerenteResponsable" className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-gray-300 mb-1.5">
                  Gerente responsable
                </label>
                <input
                  type="text"
                  id="gerenteResponsable"
                  name="gerenteResponsable"
                  value={formData.gerenteResponsable}
                  onChange={handleChange}
                  placeholder="Nombre de autoridad a cargo"
                  className="block w-full rounded-lg border-gray-300 dark:border-gray-700 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-xs sm:text-sm dark:bg-gray-800 dark:text-gray-200"
                />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pb-8 sm:pb-12">
            <Link
              href="/ordenes-vuelo"
              className="w-full sm:w-auto px-6 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors text-center"
            >
              Cancelar
            </Link>
            {canUpdate && (
              <button
                type="submit"
                className="w-full sm:w-auto bg-[#2c528c] hover:bg-blue-800 text-white text-xs sm:text-sm font-bold px-6 sm:px-8 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
              >
                <span className="material-symbols-outlined text-lg sm:text-xl">save</span>
                Guardar Cambios
              </button>
            )}
          </div>
          </fieldset>
        </form>
      </div>
    </>
  )
}

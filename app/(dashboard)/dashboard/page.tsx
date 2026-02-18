"use client"

import { useState, useMemo } from 'react'
import { Header } from '@/components/layout/header'
import { useSidebar } from '@/components/layout/dashboard-layout'
import { 
  empresasMock, 
  mesesMock, 
  operadoresActivosMock,
  getDashboardStatsByFilter
} from '@/lib/mock-data'

export default function DashboardPage() {
  const { toggle } = useSidebar()
  const [selectedEmpresa, setSelectedEmpresa] = useState<string>('')
  const [selectedMes, setSelectedMes] = useState<string>('')

  // Stats dinámicas basadas en los filtros
  const stats = useMemo(() => {
    return getDashboardStatsByFilter(
      selectedEmpresa || undefined, 
      selectedMes || undefined
    )
  }, [selectedEmpresa, selectedMes])

  // Obtener nombre de empresa seleccionada para mostrar
  const empresaSeleccionada = empresasMock.find(e => e.id === selectedEmpresa)
  const mesSeleccionado = mesesMock.find(m => m.value === selectedMes)

  return (
    <>
      <Header icon="dashboard" onMenuClick={toggle} />
      
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {/* Title */}
        <div className="mb-6 lg:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-gray-100">Vista General de Operaciones</h2>
          <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-1">
            Resumen en tiempo real de la actividad aérea y gestión corporativa.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-4 lg:mb-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-3 sm:p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="flex-1">
              <label className="sr-only" htmlFor="empresa">Seleccionar Empresa</label>
              <select 
                className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-xs sm:text-sm rounded-lg focus:ring-[#2c528c] focus:border-[#2c528c] text-gray-700 dark:text-gray-200 p-2 sm:p-2.5"
                id="empresa"
                value={selectedEmpresa}
                onChange={(e) => setSelectedEmpresa(e.target.value)}
              >
                <option value="">Todas las Empresas</option>
                {empresasMock.map((empresa) => (
                  <option key={empresa.id} value={empresa.id}>{empresa.razonSocial}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="sr-only" htmlFor="mes">Seleccionar Mes</label>
              <select 
                className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-xs sm:text-sm rounded-lg focus:ring-[#2c528c] focus:border-[#2c528c] text-gray-700 dark:text-gray-200 p-2 sm:p-2.5"
                id="mes"
                value={selectedMes}
                onChange={(e) => setSelectedMes(e.target.value)}
              >
                <option value="">Todos los Meses</option>
                {mesesMock.map((mes) => (
                  <option key={mes.value} value={mes.value}>{mes.label}</option>
                ))}
              </select>
            </div>
            <button className="bg-[#2c528c] hover:bg-blue-800 text-white text-xs sm:text-sm font-semibold px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm w-full sm:w-auto">
              <span className="material-symbols-outlined text-base sm:text-lg">description</span>
              <span className="sm:inline">Descargar Reporte</span>
            </button>
          </div>
        </div>

        {/* Active filters indicator */}
        {(selectedEmpresa || selectedMes) && (
          <div className="mb-4 lg:mb-6 flex items-center gap-2 flex-wrap">
            <span className="text-[10px] sm:text-xs text-gray-500 font-medium">Filtros activos:</span>
            {empresaSeleccionada && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 bg-[#2c528c]/10 text-[#2c528c] text-[10px] sm:text-xs font-medium rounded-full">
                <span className="truncate max-w-[100px] sm:max-w-none">{empresaSeleccionada.nombre}</span>
                <button 
                  onClick={() => setSelectedEmpresa('')}
                  className="hover:bg-[#2c528c]/20 rounded-full p-0.5"
                >
                  <span className="material-symbols-outlined text-xs sm:text-sm">close</span>
                </button>
              </span>
            )}
            {mesSeleccionado && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 bg-[#2c528c]/10 text-[#2c528c] text-[10px] sm:text-xs font-medium rounded-full">
                {mesSeleccionado.label}
                <button 
                  onClick={() => setSelectedMes('')}
                  className="hover:bg-[#2c528c]/20 rounded-full p-0.5"
                >
                  <span className="material-symbols-outlined text-xs sm:text-sm">close</span>
                </button>
              </span>
            )}
            <button 
              onClick={() => { setSelectedEmpresa(''); setSelectedMes(''); }}
              className="text-[10px] sm:text-xs text-gray-500 hover:text-red-500 font-medium underline"
            >
              Limpiar todo
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
          {/* Horas totales del mes */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start mb-3 sm:mb-4">
              <p className="text-gray-500 dark:text-gray-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                Horas totales del mes
              </p>
              <span className="material-symbols-outlined text-[#2c528c] bg-[#2c528c]/10 p-1.5 sm:p-2 rounded-lg text-lg sm:text-2xl">schedule</span>
            </div>
            <div className="flex items-end gap-2 sm:gap-3 flex-wrap">
              <p className="text-slate-900 dark:text-white text-2xl sm:text-4xl font-bold tracking-tight">
                {stats.horasTotalesMes.toLocaleString()}
              </p>
              <span className={`flex items-center text-xs sm:text-sm font-bold mb-0.5 sm:mb-1 ${stats.porcentajeCambioHoras >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                <span className="material-symbols-outlined text-xs">
                  {stats.porcentajeCambioHoras >= 0 ? 'arrow_upward' : 'arrow_downward'}
                </span> 
                {Math.abs(stats.porcentajeCambioHoras)}%
              </span>
            </div>
          </div>

          {/* Horas prácticas */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3 sm:mb-4">
              <p className="text-gray-500 dark:text-gray-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                Horas totales prácticas del mes
              </p>
              <span className="material-symbols-outlined text-[#2c528c] bg-[#2c528c]/10 p-1.5 sm:p-2 rounded-lg text-lg sm:text-2xl">flight</span>
            </div>
            <div className="flex items-end gap-2 sm:gap-3 flex-wrap">
              <p className="text-slate-900 dark:text-white text-2xl sm:text-4xl font-bold tracking-tight">
                {stats.horasPracticasMes}
              </p>
              <span className={`text-xs sm:text-sm font-medium mb-0.5 sm:mb-1 ${stats.porcentajeCambioPracticas >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {stats.porcentajeCambioPracticas >= 0 ? '+' : ''}{stats.porcentajeCambioPracticas}% vs prev
              </span>
            </div>
          </div>

          {/* Cantidad de vuelos */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
            <div className="flex justify-between items-start mb-3 sm:mb-4">
              <p className="text-gray-500 dark:text-gray-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                Cantidad de vuelos en el mes
              </p>
              <span className="material-symbols-outlined text-[#2c528c] bg-[#2c528c]/10 p-1.5 sm:p-2 rounded-lg text-lg sm:text-2xl">airplane_ticket</span>
            </div>
            <div className="flex items-end gap-2 sm:gap-3 flex-wrap">
              <p className="text-slate-900 dark:text-white text-2xl sm:text-4xl font-bold tracking-tight">
                {stats.cantidadVuelosMes}
              </p>
              <span className="flex items-center text-[#2c528c] text-xs sm:text-sm font-bold mb-0.5 sm:mb-1">
                <span className="material-symbols-outlined text-xs">trending_up</span> Estable
              </span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-6 lg:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-4 sm:mb-8">
            <div>
              <p className="text-base sm:text-lg font-bold text-slate-800 dark:text-white leading-none">Actividad de Vuelo Mensual</p>
              <p className="text-xs sm:text-sm text-gray-400 mt-1 sm:mt-2 italic">
                {empresaSeleccionada 
                  ? `Histórico de ${empresaSeleccionada.nombre}` 
                  : 'Histórico consolidado del año en curso'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-[#2c528c]"></span>
              <span className="text-[10px] sm:text-xs font-semibold text-gray-600 dark:text-gray-300">Vuelos 2024</span>
            </div>
          </div>
          <div className="flex flex-col gap-4 sm:gap-6">
            <div className="flex items-baseline gap-2 flex-wrap">
              <p className="text-[#101419] dark:text-white tracking-tight text-2xl sm:text-[40px] font-black leading-tight">
                {stats.vuelosTotalesAnio.toLocaleString()}
              </p>
              <p className={`text-xs sm:text-base font-bold ${stats.porcentajeCambioAnual >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {stats.porcentajeCambioAnual >= 0 ? '+' : ''}{stats.porcentajeCambioAnual}% vs año anterior
              </p>
            </div>
            <div className="relative w-full h-[180px] sm:h-[220px] lg:h-[280px] py-2 sm:py-4">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 500 150">
                <line className="text-gray-100 dark:text-gray-800" stroke="currentColor" strokeDasharray="4" x1="0" x2="500" y1="20" y2="20" />
                <line className="text-gray-100 dark:text-gray-800" stroke="currentColor" strokeDasharray="4" x1="0" x2="500" y1="60" y2="60" />
                <line className="text-gray-100 dark:text-gray-800" stroke="currentColor" strokeDasharray="4" x1="0" x2="500" y1="100" y2="100" />
                <line className="text-gray-200 dark:text-gray-700" stroke="currentColor" x1="0" x2="500" y1="140" y2="140" />
                <defs>
                  <linearGradient id="chartGradient" x1="0%" x2="0%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="#2c528c" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#2c528c" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0,120 C50,110 100,130 150,90 C200,50 250,70 300,40 C350,10 400,60 450,30 C480,10 500,20 500,20 L500,140 L0,140 Z" fill="url(#chartGradient)" />
                <path d="M0,120 C50,110 100,130 150,90 C200,50 250,70 300,40 C350,10 400,60 450,30 C480,10 500,20 500,20" fill="none" stroke="#2c528c" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
                <circle cx="150" cy="90" fill="#2c528c" r="4" />
                <circle cx="300" cy="40" fill="#2c528c" r="4" />
                <circle cx="450" cy="30" fill="#2c528c" r="4" />
              </svg>
            </div>
            <div className="flex justify-between px-1 sm:px-2 overflow-x-auto">
              {mesesMock.slice(0, 7).map((mes) => (
                <p 
                  key={mes.value}
                  className={`text-[9px] sm:text-xs font-bold tracking-widest uppercase flex-shrink-0 ${
                    selectedMes === mes.value 
                      ? 'text-[#2c528c] border-b-2 border-[#2c528c]' 
                      : 'text-gray-400'
                  }`}
                >
                  {mes.label.slice(0, 3)}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom grid */}
        <div className="mt-6 lg:mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Últimos operadores activos */}
          <div className="p-4 sm:p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
            <h3 className="font-bold text-slate-800 dark:text-white mb-3 sm:mb-4 text-sm sm:text-base">Últimos Operadores Activos</h3>
            <div className="space-y-2 sm:space-y-4">
              {operadoresActivosMock.map((operador) => (
                <div key={operador.id} className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-[#f6f7f8] dark:bg-gray-800/50">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <span className="material-symbols-outlined text-[#2c528c] text-lg sm:text-2xl flex-shrink-0">account_circle</span>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-semibold truncate">{operador.nombre}</p>
                      <p className="text-[9px] sm:text-[10px] text-gray-500 uppercase">ID: {operador.codigo}</p>
                    </div>
                  </div>
                  <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-bold rounded uppercase flex-shrink-0 ${
                    operador.estado === 'operando' 
                      ? 'bg-green-100 text-green-700' 
                      : operador.estado === 'mantenimiento'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {operador.estado === 'operando' ? 'Operando' : operador.estado === 'mantenimiento' ? 'Mant.' : 'Inactivo'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Asistente de reportes */}
          <div className="p-4 sm:p-6 bg-[#2c528c] rounded-xl text-white shadow-lg flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-base sm:text-lg mb-2">Asistente de Reportes</h3>
              <p className="bg-white/10 p-2.5 sm:p-3 rounded-lg text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">
                Genere informes detallados sobre el consumo de combustible y horas de vuelo con un solo clic.
              </p>
            </div>
            <button className="w-full bg-white text-[#2c528c] font-bold py-2.5 sm:py-3 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 shadow-xl text-sm sm:text-base">
              <span className="material-symbols-outlined text-lg sm:text-2xl">description</span>
              <span className="hidden sm:inline">Descargar Reporte Mensual (PDF)</span>
              <span className="sm:hidden">Descargar PDF</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

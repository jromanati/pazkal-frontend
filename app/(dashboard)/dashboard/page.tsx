"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import { Header } from '@/components/layout/header'
import { useSidebar } from '@/components/layout/dashboard-layout'
import { useToast } from '@/hooks/use-toast'
import { DashboardService } from '@/services/dashboard.service'

export default function DashboardPage() {
  const { toggle } = useSidebar()
  const { toast } = useToast()

  const now = new Date()
  const [mounted, setMounted] = useState(false)
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('')
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear())

  const [companies, setCompanies] = useState<Array<{ id: number; name: string; code: string }>>([])
  const [stats, setStats] = useState<{
    total_hours_month: string
    total_hours_previous_month: string
    hours_change_percent: string
    total_orders_month: number
    total_orders_previous_month: number
    orders_change_percent: string
  } | null>(null)
  const [activity, setActivity] = useState<{
    year: number
    total_minutes_year: number
    year_change_percent: string
    monthly_data: Array<{ month: number; month_name: string; minutes: number }>
  } | null>(null)

  const chartContainerRef = useRef<HTMLDivElement | null>(null)
  const [hoveredMonthIdx, setHoveredMonthIdx] = useState<number | null>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number } | null>(null)
  const [chartAnimKey, setChartAnimKey] = useState(0)

  const [isLoading, setIsLoading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const companyIdParam = selectedCompanyId ? Number(selectedCompanyId) : undefined

  const yearOptions = useMemo(() => {
    const y = now.getFullYear()
    return [y - 2, y - 1, y, y + 1]
  }, [])

  useEffect(() => {
    if (!mounted) return
    ;(async () => {
      const res = await DashboardService.listCompanies()
      if (!res.success || !res.data) {
        toast({
          title: 'No se pudieron cargar las empresas',
          description: res.error || 'Error al obtener empresas del dashboard.',
          variant: 'destructive',
        })
        return
      }
      setCompanies(res.data.companies || [])
    })()
  }, [mounted])

  useEffect(() => {
    if (!mounted) return

    setIsLoading(true)
    ;(async () => {
      try {
        const [statsRes, activityRes] = await Promise.all([
          DashboardService.getStats({ year: selectedYear, company_id: companyIdParam }),
          DashboardService.getCompaniesActivity({ year: selectedYear, company_id: companyIdParam }),
        ])

        if (!statsRes.success || !statsRes.data) {
          toast({
            title: 'No se pudieron cargar las estadísticas',
            description: statsRes.error || 'Error al obtener estadísticas.',
            variant: 'destructive',
          })
          setStats(null)
        } else {
          setStats({
            total_hours_month: statsRes.data.total_hours_month,
            total_hours_previous_month: statsRes.data.total_hours_previous_month,
            hours_change_percent: statsRes.data.hours_change_percent,
            total_orders_month: statsRes.data.total_orders_month,
            total_orders_previous_month: statsRes.data.total_orders_previous_month,
            orders_change_percent: statsRes.data.orders_change_percent,
          })
        }

        if (!activityRes.success || !activityRes.data) {
          toast({
            title: 'No se pudo cargar la actividad mensual',
            description: activityRes.error || 'Error al obtener actividad.',
            variant: 'destructive',
          })
          setActivity(null)
        } else {
          setActivity({
            year: activityRes.data.year,
            total_minutes_year: activityRes.data.total_minutes_year,
            year_change_percent: activityRes.data.year_change_percent,
            monthly_data: activityRes.data.monthly_data || [],
          })
        }
      } finally {
        setIsLoading(false)
      }
    })()
  }, [mounted, selectedYear, selectedCompanyId])

  useEffect(() => {
    if (!mounted) return
    if (!activity) return
    setChartAnimKey(k => k + 1)
  }, [mounted, activity?.year, selectedCompanyId, selectedYear])

  const selectedCompany = companies.find(c => String(c.id) === selectedCompanyId)

  const monthlyMinutes = useMemo(() => {
    const base = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, minutes: 0, month_name: '' }))
    for (const item of activity?.monthly_data || []) {
      if (!item?.month || item.month < 1 || item.month > 12) continue
      base[item.month - 1] = { month: item.month, minutes: Number(item.minutes || 0), month_name: item.month_name || '' }
    }
    return base
  }, [activity])

  const chart = useMemo(() => {
    const width = 500
    const bottom = 140
    const top = 20
    const maxY = bottom - top
    const maxMinutes = Math.max(1, ...monthlyMinutes.map(m => m.minutes))
    const stepX = width / 11

    const points = monthlyMinutes.map((m, idx) => {
      const x = idx * stepX
      const y = bottom - (m.minutes / maxMinutes) * maxY
      return { x, y }
    })

    const line = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
    const area = `${line} L${width},${bottom} L0,${bottom} Z`
    return { line, area, points }
  }, [monthlyMinutes])

  const parsePercent = (raw: string | undefined) => {
    const n = Number(String(raw ?? '').replace('%', '').trim())
    return Number.isFinite(n) ? n : 0
  }

  const handleExport = async () => {
    if (!selectedYear) return
    setIsExporting(true)
    try {
      const res = await DashboardService.exportOperations({
        year: selectedYear,
        company_id: companyIdParam,
      })
      if (!res.success) {
        toast({
          title: 'No se pudo exportar',
          description: res.error || 'Error al generar Excel.',
          variant: 'destructive',
        })
        return
      }

      const objectUrl = URL.createObjectURL(res.blob)
      const a = document.createElement('a')
      a.href = objectUrl
      a.download = res.filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(objectUrl), 10_000)
    } finally {
      setIsExporting(false)
    }
  }

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
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
              >
                <option value="">Todas las Empresas</option>
                {companies.map((empresa) => (
                  <option key={empresa.id} value={String(empresa.id)}>{empresa.name}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="sr-only" htmlFor="anio">Seleccionar Año</label>
              <select 
                className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-xs sm:text-sm rounded-lg focus:ring-[#2c528c] focus:border-[#2c528c] text-gray-700 dark:text-gray-200 p-2 sm:p-2.5"
                id="anio"
                value={String(selectedYear)}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                {yearOptions.map((y) => (
                  <option key={y} value={String(y)}>{y}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="bg-[#2c528c] hover:bg-blue-800 disabled:opacity-60 text-white text-xs sm:text-sm font-semibold px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm w-full sm:w-auto"
            >
              <span className="material-symbols-outlined text-base sm:text-lg">download</span>
              <span className="sm:inline">Exportar Excel</span>
            </button>
          </div>
        </div>

        {/* Active filters indicator */}
        {(selectedCompanyId || selectedYear !== now.getFullYear()) && (
          <div className="mb-4 lg:mb-6 flex items-center gap-2 flex-wrap">
            <span className="text-[10px] sm:text-xs text-gray-500 font-medium">Filtros activos:</span>
            {selectedCompany && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 bg-[#2c528c]/10 text-[#2c528c] text-[10px] sm:text-xs font-medium rounded-full">
                <span className="truncate max-w-[100px] sm:max-w-none">{selectedCompany.name}</span>
                <button 
                  onClick={() => setSelectedCompanyId('')}
                  className="hover:bg-[#2c528c]/20 rounded-full p-0.5"
                >
                  <span className="material-symbols-outlined text-xs sm:text-sm">close</span>
                </button>
              </span>
            )}
            {selectedYear !== now.getFullYear() && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 bg-[#2c528c]/10 text-[#2c528c] text-[10px] sm:text-xs font-medium rounded-full">
                {selectedYear}
                <button 
                  onClick={() => setSelectedYear(now.getFullYear())}
                  className="hover:bg-[#2c528c]/20 rounded-full p-0.5"
                >
                  <span className="material-symbols-outlined text-xs sm:text-sm">close</span>
                </button>
              </span>
            )}
            <button 
              onClick={() => { setSelectedCompanyId(''); setSelectedYear(now.getFullYear()); }}
              className="text-[10px] sm:text-xs text-gray-500 hover:text-red-500 font-medium underline"
            >
              Limpiar todo
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
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
                {stats ? Number(stats.total_hours_month).toLocaleString(undefined, { maximumFractionDigits: 1 }) : '--'}
              </p>
              <span className={`flex items-center text-xs sm:text-sm font-bold mb-0.5 sm:mb-1 ${parsePercent(stats?.hours_change_percent) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                <span className="material-symbols-outlined text-xs">
                  {parsePercent(stats?.hours_change_percent) >= 0 ? 'arrow_upward' : 'arrow_downward'}
                </span> 
                {Math.abs(parsePercent(stats?.hours_change_percent)).toLocaleString()}%
              </span>
            </div>
          </div>

          {/* Horas totales mes anterior */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start mb-3 sm:mb-4">
              <p className="text-gray-500 dark:text-gray-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                Horas totales mes anterior
              </p>
              <span className="material-symbols-outlined text-[#2c528c] bg-[#2c528c]/10 p-1.5 sm:p-2 rounded-lg text-lg sm:text-2xl">history</span>
            </div>
            <div className="flex items-end gap-2 sm:gap-3 flex-wrap">
              <p className="text-slate-900 dark:text-white text-2xl sm:text-4xl font-bold tracking-tight">
                {stats ? Number(stats.total_hours_previous_month).toLocaleString(undefined, { maximumFractionDigits: 1 }) : '--'}
              </p>
            </div>
          </div>

          {/* Cantidad de órdenes completadas del mes */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
            <div className="flex justify-between items-start mb-3 sm:mb-4">
              <p className="text-gray-500 dark:text-gray-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                Órdenes completadas del mes
              </p>
              <span className="material-symbols-outlined text-[#2c528c] bg-[#2c528c]/10 p-1.5 sm:p-2 rounded-lg text-lg sm:text-2xl">airplane_ticket</span>
            </div>
            <div className="flex items-end gap-2 sm:gap-3 flex-wrap">
              <p className="text-slate-900 dark:text-white text-2xl sm:text-4xl font-bold tracking-tight">
                {stats ? Number(stats.total_orders_month).toLocaleString() : '--'}
              </p>
              <span className={`flex items-center text-xs sm:text-sm font-bold mb-0.5 sm:mb-1 ${parsePercent(stats?.orders_change_percent) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                <span className="material-symbols-outlined text-xs">
                  {parsePercent(stats?.orders_change_percent) >= 0 ? 'arrow_upward' : 'arrow_downward'}
                </span>
                {Math.abs(parsePercent(stats?.orders_change_percent)).toLocaleString()}%
              </span>
            </div>
          </div>

          {/* Órdenes completadas mes anterior */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
            <div className="flex justify-between items-start mb-3 sm:mb-4">
              <p className="text-gray-500 dark:text-gray-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                Órdenes completadas mes anterior
              </p>
              <span className="material-symbols-outlined text-[#2c528c] bg-[#2c528c]/10 p-1.5 sm:p-2 rounded-lg text-lg sm:text-2xl">history</span>
            </div>
            <div className="flex items-end gap-2 sm:gap-3 flex-wrap">
              <p className="text-slate-900 dark:text-white text-2xl sm:text-4xl font-bold tracking-tight">
                {stats ? Number(stats.total_orders_previous_month).toLocaleString() : '--'}
              </p>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-6 lg:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-4 sm:mb-8">
            <div>
              <p className="text-base sm:text-lg font-bold text-slate-800 dark:text-white leading-none">Actividad de Vuelo Mensual</p>
              <p className="text-xs sm:text-sm text-gray-400 mt-1 sm:mt-2 italic">
                {selectedCompany ? `Histórico de ${selectedCompany.name}` : 'Histórico consolidado'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-[#2c528c]"></span>
              <span className="text-[10px] sm:text-xs font-semibold text-gray-600 dark:text-gray-300">Minutos {activity?.year ?? selectedYear}</span>
            </div>
          </div>
          <div className="flex flex-col gap-4 sm:gap-6">
            <div className="flex items-baseline gap-2 flex-wrap">
              <p className="text-[#101419] dark:text-white tracking-tight text-2xl sm:text-[40px] font-black leading-tight">
                {activity ? Number(activity.total_minutes_year).toLocaleString() : '--'}
              </p>
              <p className={`text-xs sm:text-base font-bold ${parsePercent(activity?.year_change_percent) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {parsePercent(activity?.year_change_percent) >= 0 ? '+' : ''}{parsePercent(activity?.year_change_percent).toLocaleString()}% vs año anterior
              </p>
            </div>
            <div className="relative w-full h-[180px] sm:h-[220px] lg:h-[280px] py-2 sm:py-4">
              <div ref={chartContainerRef} className="relative w-full h-full">
                {isLoading && (
                  <div className="absolute inset-0 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800/50 border border-gray-200/60 dark:border-gray-700/60">
                    <div className="absolute inset-0 dash-shimmer" />
                    <div className="absolute inset-0 opacity-40">
                      <div className="absolute left-0 right-0 top-[15%] h-px bg-gray-200 dark:bg-gray-700" />
                      <div className="absolute left-0 right-0 top-[45%] h-px bg-gray-200 dark:bg-gray-700" />
                      <div className="absolute left-0 right-0 top-[75%] h-px bg-gray-200 dark:bg-gray-700" />
                    </div>
                  </div>
                )}

                {tooltip && hoveredMonthIdx !== null && (
                  <div
                    className="absolute z-10 pointer-events-none"
                    style={{ left: tooltip.x, top: tooltip.y }}
                  >
                    <div className="-translate-x-1/2 -translate-y-full bg-slate-900 text-white text-[10px] sm:text-xs font-semibold px-2 py-1 rounded-md shadow-lg whitespace-nowrap">
                      {(monthlyMinutes[hoveredMonthIdx]?.month_name || '').trim() || `Mes ${monthlyMinutes[hoveredMonthIdx]?.month}`}: {' '}
                      {(monthlyMinutes[hoveredMonthIdx]?.minutes ?? 0).toLocaleString()} min
                    </div>
                  </div>
                )}

                <svg
                  className="w-full h-full"
                  preserveAspectRatio="none"
                  viewBox="0 0 500 150"
                  onMouseLeave={() => {
                    setHoveredMonthIdx(null)
                    setTooltip(null)
                  }}
                >
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

                  <path key={`area-${chartAnimKey}`} d={chart.area} fill="url(#chartGradient)" className="dash-area" />
                  <path
                    key={`line-${chartAnimKey}`}
                    d={chart.line}
                    fill="none"
                    stroke="#2c528c"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    className="dash-line"
                  />

                  {chart.points.map((p, idx) => (
                    <g
                      key={`pt-${idx}`}
                      onMouseEnter={(e) => {
                        setHoveredMonthIdx(idx)
                        const el = chartContainerRef.current
                        if (!el) return
                        const rect = el.getBoundingClientRect()
                        setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top })
                      }}
                      onMouseMove={(e) => {
                        const el = chartContainerRef.current
                        if (!el) return
                        const rect = el.getBoundingClientRect()
                        setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top })
                      }}
                    >
                      <circle cx={p.x} cy={p.y} r={hoveredMonthIdx === idx ? 7 : 5} fill="#2c528c" opacity={hoveredMonthIdx === idx ? 1 : 0.85} />
                      <circle cx={p.x} cy={p.y} r={14} fill="transparent" />
                    </g>
                  ))}
                </svg>
              </div>
            </div>
            <div className="flex justify-between px-1 sm:px-2 overflow-x-auto">
              {monthlyMinutes.map((m) => (
                <p 
                  key={m.month}
                  className={`text-[9px] sm:text-xs font-bold tracking-widest uppercase flex-shrink-0 ${
                    'text-gray-400'
                  }`}
                >
                  {(m.month_name || '').slice(0, 3) || String(m.month).padStart(2, '0')}
                </p>
              ))}
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="mt-4 text-xs text-gray-400">Actualizando datos...</div>
        )}

        <style jsx>{`
          .dash-line {
            stroke-dasharray: 1200;
            stroke-dashoffset: 1200;
            animation: dashDraw 900ms ease-out forwards;
          }

          .dash-area {
            opacity: 0;
            animation: dashFade 700ms ease-out 150ms forwards;
          }

          .dash-shimmer {
            background: linear-gradient(90deg, rgba(44, 82, 140, 0) 0%, rgba(44, 82, 140, 0.08) 50%, rgba(44, 82, 140, 0) 100%);
            transform: translateX(-100%);
            animation: shimmerMove 1100ms ease-in-out infinite;
          }

          @keyframes dashDraw {
            to {
              stroke-dashoffset: 0;
            }
          }

          @keyframes dashFade {
            to {
              opacity: 1;
            }
          }

          @keyframes shimmerMove {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(100%);
            }
          }
        `}</style>
      </div>
    </>
  )
}

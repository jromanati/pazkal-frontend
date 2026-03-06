import { apiClient } from '@/lib/api'

export interface DashboardCompanyListItem {
  id: number
  name: string
  code: string
}

export interface DashboardCompaniesListResponse {
  companies: DashboardCompanyListItem[]
}

export interface DashboardMonthlyActivityItem {
  month: number
  month_name: string
  minutes: number
}

export interface DashboardCompaniesActivityResponse {
  year: number
  total_minutes_year: number
  previous_year_total: number
  year_change_percent: string
  monthly_data: DashboardMonthlyActivityItem[]
}

export interface DashboardStatsResponse {
  total_hours_month: string
  total_hours_previous_month: string
  hours_change_percent: string
  total_orders_month: number
  total_orders_previous_month: number
  orders_change_percent: string
}

function isCompaniesListResponse(value: any): value is DashboardCompaniesListResponse {
  return Boolean(value && typeof value === 'object' && Array.isArray(value.companies))
}

function isCompaniesActivityResponse(value: any): value is DashboardCompaniesActivityResponse {
  return Boolean(value && typeof value === 'object' && Array.isArray(value.monthly_data))
}

function toQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    searchParams.set(key, String(value))
  }

  const qs = searchParams.toString()
  return qs ? `?${qs}` : ''
}

export class DashboardService {
  static async getCompaniesActivity(params: { year?: number; company_id?: number | string } = {}) {
    const qs = toQueryString(params)

    const candidates = [
      `dashboard/monthly-activity/${qs}`,
      `dashboard/companies/${qs}`,
      `dashboard/companies/activity/${qs}`,
    ]
    for (const endpoint of candidates) {
      const res = await apiClient.get<any>(endpoint)
      if (res.success && isCompaniesActivityResponse(res.data)) {
        return res as any
      }
    }

    return apiClient.get<DashboardCompaniesActivityResponse>(`dashboard/monthly-activity/${qs}`)
  }

  static async listCompanies() {
    const candidates = ['dashboard/companies/']
    for (const endpoint of candidates) {
      const res = await apiClient.get<any>(endpoint)
      if (res.success && isCompaniesListResponse(res.data)) {
        return res as any
      }
    }

    return apiClient.get<DashboardCompaniesListResponse>('dashboard/companies/')
  }

  static async getStats(params: {
    company_id?: number | string
    month?: number
    year?: number
  } = {}) {
    const qs = toQueryString(params)
    return apiClient.get<DashboardStatsResponse>(`dashboard/stats/${qs}`)
  }

  static async exportOperations(params: { year: number; company_id?: number | string }) {
    const qs = toQueryString(params)
    const baseUrl = 'https://pazkal-api.softwarelabs.cl/api/v1/'
    const url = `${baseUrl}dashboard/export/${qs}`

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

    if (!res.ok) {
      return { success: false as const, error: `HTTP ${res.status}` }
    }

    const blob = await res.blob()
    const contentDisposition = res.headers.get('content-disposition') || ''
    const filenameMatch = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(contentDisposition)
    const filename = decodeURIComponent(filenameMatch?.[1] || filenameMatch?.[2] || `dashboard_export_${params.year}.xlsx`)

    return { success: true as const, blob, filename }
  }
}

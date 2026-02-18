import { apiClient, type ApiResponse } from "@/lib/api"

export interface PaginatedResponse<T> {
  count: number
  total_pages: number
  current_page: number
  page_size: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface GetCompaniesParams {
  page?: number
  page_size?: number
}

function toQueryString(params: object): string {
  const searchParams = new URLSearchParams()

  for (const [key, value] of Object.entries(params as Record<string, unknown>)) {
    if (value === undefined || value === null) continue
    searchParams.set(key, String(value))
  }

  const qs = searchParams.toString()
  return qs ? `?${qs}` : ""
}

export interface CompanyListItem {
  id: number
  name: string
  code: string
  tax_id: string
  is_active: boolean
  user_count: number
  created_at: string
  aoc_ceo_number: string
  legal_name: string
}

export interface CompanyDocument {
  [key: string]: string
}

export interface Company {
  id: number
  name: string
  code: string
  legal_name: string
  tax_id: string
  address: string
  phone: string
  email: string
  website: string
  logo: string
  notes: string
  aoc_ceo_number: string
  operations_specification: string
  operations_manager_name: string
  operations_manager_email: string
  operations_manager_phone: string
  dgac_inspector_name: string
  dgac_inspector_email: string
  is_active: boolean
  user_count: number
  documents: CompanyDocument[]
  created_at: string
  updated_at: string
}

export interface CreateCompanyPayload {
  name: string
  code: string
  legal_name: string
  tax_id: string
  address: string
  phone: string
  email: string
  website: string
  notes: string
  aoc_ceo_number: string
  operations_specification: string
  operations_manager_name: string
  operations_manager_email: string
  operations_manager_phone: string
  dgac_inspector_name: string
  dgac_inspector_email: string
}

export interface UpdateCompanyPayload {
  name: string
  legal_name: string
  tax_id: string
  address: string
  phone: string
  email: string
  website: string
  notes: string
  aoc_ceo_number: string
  operations_specification: string
  operations_manager_name: string
  operations_manager_email: string
  operations_manager_phone: string
  dgac_inspector_name: string
  dgac_inspector_email: string
}

export class CompanyService {
  static async getCompanies(
    params: GetCompaniesParams = {},
  ): Promise<ApiResponse<PaginatedResponse<CompanyListItem>>> {
    const qs = toQueryString(params)
    return apiClient.get<PaginatedResponse<CompanyListItem>>(`companies/${qs}`)
  }

  static async getCompany(companyId: number | string): Promise<ApiResponse<Company>> {
    return apiClient.get<Company>(`companies/${companyId}/`)
  }

  static async createCompany(payload: CreateCompanyPayload): Promise<ApiResponse<Company>> {
    return apiClient.post<Company>("companies/", payload)
  }

  static async updateCompany(
    companyId: number | string,
    payload: UpdateCompanyPayload,
  ): Promise<ApiResponse<Company>> {
    return apiClient.patch<Company>(`companies/${companyId}/`, payload)
  }

  static async deleteCompany(companyId: number | string): Promise<ApiResponse<unknown>> {
    return apiClient.delete<unknown>(`companies/${companyId}/`)
  }
}

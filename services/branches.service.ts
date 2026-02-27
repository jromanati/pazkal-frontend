import { apiClient, type ApiResponse } from "@/lib/api"

export type BranchCompanyRef = {
  id: number
  name: string
  code: string
}

export type Branch = {
  id: number
  company: BranchCompanyRef
  name: string
  location: string
  contract_date: string
  is_active: boolean
  user_count: number
  created_at: string
  updated_at?: string
}

export type GetBranchesParams = {
  company_id: number | string
}

export type CreateBranchPayload = {
  company_id: number
  name: string
  location: string
  contract_date: string
}

export type UpdateBranchPayload = {
  name: string
  location: string
  contract_date: string
}

export type BranchDocumentType =
  | "operations_spec"
  | "insurance"
  | "jac_resolution"
  | "equipment_records"
  | "flight_auth"
  | "mandate_auth"
  | "special_auth"
  | "aircraft_maint"

export type BranchDocumentItem = {
  id: number
  document_type: BranchDocumentType
  document_type_display: string
  original_filename: string
  file_url: string
  file_size: number
  file_size_display: string
  mime_type: string
  expiration_date: string | null
  created_at: string
  updated_at: string
}

export type UploadBranchDocumentPayload = {
  document_type: BranchDocumentType
  file: File
  expiration_date?: string
}

function toQueryString(params: Record<string, unknown>): string {
  const sp = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue
    sp.set(k, String(v))
  }
  const qs = sp.toString()
  return qs ? `?${qs}` : ""
}

export class BranchService {
  static async listBranches(params: GetBranchesParams): Promise<ApiResponse<Branch[]>> {
    const qs = toQueryString(params)
    return apiClient.get<Branch[]>(`branches/${qs}`)
  }

  static async createBranch(payload: CreateBranchPayload): Promise<ApiResponse<Branch>> {
    return apiClient.post<Branch>("branches/", payload)
  }

  static async getBranch(branchId: number | string): Promise<ApiResponse<Branch>> {
    return apiClient.get<Branch>(`branches/${branchId}/`)
  }

  static async updateBranch(
    branchId: number | string,
    payload: UpdateBranchPayload,
  ): Promise<ApiResponse<Branch>> {
    return apiClient.patch<Branch>(`branches/${branchId}/`, payload)
  }

  static async deleteBranch(branchId: number | string): Promise<ApiResponse<unknown>> {
    return apiClient.delete<unknown>(`branches/${branchId}/`)
  }

  static async listBranchDocuments(branchId: number | string): Promise<ApiResponse<BranchDocumentItem[]>> {
    return apiClient.get<BranchDocumentItem[]>(`branches/${branchId}/documents/`)
  }

  static async uploadBranchDocument(
    branchId: number | string,
    payload: UploadBranchDocumentPayload,
  ): Promise<ApiResponse<BranchDocumentItem>> {
    const form = new FormData()
    form.append("document_type", payload.document_type)
    form.append("file", payload.file)
    if (payload.expiration_date) form.append("expiration_date", payload.expiration_date)
    return apiClient.post<BranchDocumentItem>(`branches/${branchId}/documents/`, form)
  }

  static async deleteBranchDocument(
    branchId: number | string,
    documentId: number | string,
  ): Promise<ApiResponse<unknown>> {
    return apiClient.delete<unknown>(`branches/${branchId}/documents/${documentId}/`)
  }
}

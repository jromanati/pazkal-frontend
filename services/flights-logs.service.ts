import { apiClient, type ApiResponse } from "@/lib/api"

export interface FlightLogFlightOrder {
  id: number
  order_number: string
  status: string
  status_display?: string
}

export interface FlightLogCompany {
  id: number
  name: string
  code: string
}

export interface FlightLogOperator {
  id: number
  email: string
  first_name: string
  last_name: string
  full_name: string
}

export interface FlightLog {
  id: number
  log_number: string
  flight_order: FlightLogFlightOrder
  company: FlightLogCompany
  operator: FlightLogOperator
  flight_date: string
  location: string
  aerial_work_type?: string
  flight_duration_minutes: number
  is_active: boolean
  created_at: string
  updated_at: string

  copilot_name?: string
  rpa1_model?: string
  rpa1_registration?: string
  rpa2_model?: string
  rpa2_registration?: string
  battery1_start?: number
  battery1_end?: number
  battery2_start?: number
  battery2_end?: number
  battery3_start?: number
  battery3_end?: number
  departure_time_utc?: string
  arrival_time_utc?: string
  departure_time_local?: string
  arrival_time_local?: string
  activity_description?: string
  comments?: string
}

export interface ListFlightLogsParams {
  date_from?: string
  date_to?: string
  flight_order_id?: number
  operator_id?: number
  ordering?: string
  search?: string
}

export interface CreateFlightLogPayload {
  flight_order_id: number
  log_number: string
  operator_id: number
  flight_date: string
  drone_ids?: number[]
  copilot_name?: string
  location: string
  rpa1_model?: string
  rpa1_registration?: string
  rpa2_model?: string
  rpa2_registration?: string
  battery1_start?: number
  battery1_end?: number
  battery2_start?: number
  battery2_end?: number
  battery3_start?: number
  battery3_end?: number
  departure_time_utc?: string
  arrival_time_utc?: string
  departure_time_local?: string
  arrival_time_local?: string
  flight_duration_minutes?: number
  aerial_work_type?: string
  activity_description?: string
  comments?: string
}

export interface UpdateFlightLogPayload extends Partial<CreateFlightLogPayload> {}

function toQueryString(params: object): string {
  const searchParams = new URLSearchParams()

  for (const [key, value] of Object.entries(params as Record<string, unknown>)) {
    if (value === undefined || value === null || value === "") continue
    searchParams.set(key, String(value))
  }

  const qs = searchParams.toString()
  return qs ? `?${qs}` : ""
}

export class FlightLogsService {
  static async listLogs(params: ListFlightLogsParams = {}): Promise<ApiResponse<FlightLog[]>> {
    const qs = toQueryString(params)
    return apiClient.get<FlightLog[]>(`flights/logs/${qs}`)
  }

  static async createLog(payload: CreateFlightLogPayload): Promise<ApiResponse<FlightLog>> {
    return apiClient.post<FlightLog>("flights/logs/", payload)
  }

  static async getLog(logId: number | string): Promise<ApiResponse<FlightLog>> {
    return apiClient.get<FlightLog>(`flights/logs/${logId}/`)
  }

  static async updateLog(logId: number | string, payload: UpdateFlightLogPayload): Promise<ApiResponse<FlightLog>> {
    return apiClient.patch<FlightLog>(`flights/logs/${logId}/`, payload)
  }

  static async deleteLog(logId: number | string): Promise<ApiResponse<unknown>> {
    return apiClient.delete<unknown>(`flights/logs/${logId}/`)
  }
}

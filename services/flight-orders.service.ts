import { apiClient, type ApiResponse } from "@/lib/api"

export type FlightOrderStatus = "PENDING" | "IN_FLIGHT" | "COMPLETED"

export interface FlightOrderCompany {
  id: number
  name: string
  code: string
}

export interface FlightOrderOperator {
  id: number
  email: string
  first_name: string
  last_name: string
  full_name: string
}

export interface FlightOrderBranch {
  id: number
  name: string
  location?: string
}

export interface FlightOrder {
  id: number
  order_number: string
  company?: FlightOrderCompany
  operator: FlightOrderOperator
  branch?: FlightOrderBranch
  branch_id?: number
  branch_name?: string
  company_id?: number
  company_name?: string
  observer_name?: string
  rpa_identifier?: string
  flight_type?: string
  scheduled_date: string
  aerial_work_type?: string
  location: string
  work_description?: string
  utc_activity_time?: string
  notam_reference?: string
  geographic_area?: string
  restricted_areas?: string
  responsible_manager?: string
  status: FlightOrderStatus
  status_display?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ListFlightOrdersParams {
  company_id?: number
  date_from?: string
  date_to?: string
  operator_id?: number
  ordering?: string
  search?: string
  status?: FlightOrderStatus
}

export interface CreateFlightOrderPayload {
  branch_id: number
  order_number: string
  operator_id: number
  observer_name?: string
  rpa_identifier?: string
  flight_type?: string
  scheduled_date: string
  aerial_work_type?: string
  location: string
  work_description?: string
  utc_activity_time?: string
  notam_reference?: string
  geographic_area?: string
  restricted_areas?: string
  responsible_manager?: string
  status: FlightOrderStatus
}

export interface UpdateFlightOrderPayload extends CreateFlightOrderPayload {}

function toQueryString(params: object): string {
  const searchParams = new URLSearchParams()

  for (const [key, value] of Object.entries(params as Record<string, unknown>)) {
    if (value === undefined || value === null || value === "") continue
    searchParams.set(key, String(value))
  }

  const qs = searchParams.toString()
  return qs ? `?${qs}` : ""
}

export class FlightOrdersService {
  static async listOrders(params: ListFlightOrdersParams = {}): Promise<ApiResponse<FlightOrder[]>> {
    const qs = toQueryString(params)
    return apiClient.get<FlightOrder[]>(`flights/orders/${qs}`)
  }

  static async createOrder(payload: CreateFlightOrderPayload): Promise<ApiResponse<FlightOrder>> {
    return apiClient.post<FlightOrder>("flights/orders/", payload)
  }

  static async getOrder(orderId: number | string): Promise<ApiResponse<FlightOrder>> {
    return apiClient.get<FlightOrder>(`flights/orders/${orderId}/`)
  }

  static async updateOrder(orderId: number | string, payload: UpdateFlightOrderPayload): Promise<ApiResponse<FlightOrder>> {
    return apiClient.patch<FlightOrder>(`flights/orders/${orderId}/`, payload)
  }

  static async deleteOrder(orderId: number | string): Promise<ApiResponse<unknown>> {
    return apiClient.delete<unknown>(`flights/orders/${orderId}/`)
  }
}

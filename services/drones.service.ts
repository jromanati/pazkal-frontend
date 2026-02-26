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

export type DroneListFilters = {
  branch_id?: number | string
  has_parachute?: boolean
  ordering?: string
  search?: string
}

export type DroneListItem = {
  id: number
  registration_number: string
  brand: string
  model: string
  serial_number: string
  max_takeoff_weight_kg: string
  has_parachute: boolean
  branch_id: number
  branch_name: string
  battery_count: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type DroneBatteryPayload = {
  name: string
  cycle_count: number
}

export type DroneParachutePayload = {
  brand: string
  model: string
  resistance_weight_kg: string
}

export type CreateDronePayload = {
  branch_id: number
  registration_number: string
  brand: string
  model: string
  serial_number: string
  max_takeoff_weight_kg: string
  has_parachute: boolean
  notes?: string
  batteries: DroneBatteryPayload[]
  parachute?: DroneParachutePayload
}

export type UpdateDronePayload = CreateDronePayload

export type DroneDetail = {
  id: number
  registration_number: string
  brand: string
  model: string
  serial_number: string
  max_takeoff_weight_kg: string
  has_parachute: boolean
  notes?: string
  branch_id: number
  branch_name: string
  company_id: number
  company_name: string
  batteries: any
  parachute: any
  created_by_email: string
  is_active: boolean
  created_at: string
  updated_at: string
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

export class DronesService {
  static async listDrones(
    filters: DroneListFilters = {},
  ): Promise<ApiResponse<DroneListItem[] | PaginatedResponse<DroneListItem>>> {
    const qs = toQueryString(filters)
    return apiClient.get<DroneListItem[] | PaginatedResponse<DroneListItem>>(`drones/${qs}`)
  }

  static async listAvailableDrones(filters: Pick<DroneListFilters, "branch_id"> = {}): Promise<ApiResponse<DroneListItem[]>> {
    const qs = toQueryString(filters as Record<string, unknown>)
    return apiClient.get<DroneListItem[]>(`drones/available/${qs}`)
  }

  static async createDrone(payload: CreateDronePayload): Promise<ApiResponse<DroneDetail>> {
    return apiClient.post<DroneDetail>("drones/", payload)
  }

  static async getDrone(droneId: number | string): Promise<ApiResponse<DroneDetail>> {
    return apiClient.get<DroneDetail>(`drones/${droneId}/`)
  }

  static async updateDrone(droneId: number | string, payload: UpdateDronePayload): Promise<ApiResponse<DroneDetail>> {
    return apiClient.patch<DroneDetail>(`drones/${droneId}/`, payload)
  }

  static async deleteDrone(droneId: number | string): Promise<ApiResponse<unknown>> {
    return apiClient.delete<unknown>(`drones/${droneId}/`)
  }
}

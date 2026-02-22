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

export interface CredentialImageResponse {
    image_url: string
    has_image: boolean
}

export interface UserCompany {
    id: number
    name: string
    code: string
}

export interface UserGroup {
    id: number
    name: string
}

export interface UserProfile {
    rut: string
    fecha_nacimiento: string
    telefono: string
    numero_credencial: number
    fecha_otorgamiento_credencial: string
    fecha_vencimiento_credencial: string
    imagen_credencial?: string
    habilitaciones: string[]
    eficiencia_operativa: string
    fecha_ultima_capacitacion: string
    empresa_capacitadora: string
}

export interface User {
    id: number
    email: string
    first_name: string
    last_name: string
    phone: string
    avatar?: string
    is_active: boolean
    is_staff: boolean
    is_superuser: boolean
    companies: UserCompany[]
    groups: UserGroup[]
    profile: UserProfile | null
    permissions?: string[]
    created_at: string
    updated_at?: string
    last_login?: string
}

export interface GetUsersParams {
    page?: number
    page_size?: number
    search?: string
}

export interface CreateUserPayload {
    email: string
    password: string
    first_name: string
    last_name: string
    phone: string
    is_superuser: boolean
    is_staff: boolean
    company_ids: number[]
    group_name: string
    profile: {
        rut: string
        fecha_nacimiento: string
        telefono: string
        numero_credencial: number
        fecha_otorgamiento_credencial: string
        fecha_vencimiento_credencial: string
        habilitaciones: string[]
        eficiencia_operativa: string
        fecha_ultima_capacitacion: string
        empresa_capacitadora: string
    }
}

export interface UpdateUserPayload {
    email?: string
    password?: string
    first_name?: string
    last_name?: string
    phone?: string
    is_staff?: boolean
    company_ids?: number[]
    group_name?: string
    profile?: {
        rut: string
        fecha_nacimiento: string
        telefono: string
        numero_credencial: number
        fecha_otorgamiento_credencial: string
        fecha_vencimiento_credencial: string
        habilitaciones: string[]
        eficiencia_operativa: string
        fecha_ultima_capacitacion: string
        empresa_capacitadora: string
    }
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

export class UsersService {
    static async getUsers(
        params: GetUsersParams = {},
    ): Promise<ApiResponse<PaginatedResponse<User>>> {
        const qs = toQueryString(params)
        return apiClient.get<PaginatedResponse<User>>(`users/${qs}`)
    }

    static async createUser(payload: CreateUserPayload): Promise<ApiResponse<User>> {
        return apiClient.post<User>("users/", payload)
    }

    static async getUser(userId: number | string): Promise<ApiResponse<User>> {
        return apiClient.get<User>(`users/${userId}/`)
    }

    static async updateUser(
        userId: number | string,
        payload: UpdateUserPayload,
    ): Promise<ApiResponse<User>> {
        return apiClient.patch<User>(`users/${userId}/`, payload)
    }

    static async deleteUser(userId: number | string): Promise<ApiResponse<unknown>> {
        return apiClient.delete<unknown>(`users/${userId}/`)
    }

    static async uploadCredentialImage(
        userId: number | string,
        image: File,
    ): Promise<ApiResponse<unknown>> {
        const form = new FormData()
        form.append('image', image)
        return apiClient.post<unknown>(`users/${userId}/credential-image/`, form)
    }

    static async getCredentialImage(
        userId: number | string,
    ): Promise<ApiResponse<CredentialImageResponse>> {
        return apiClient.get<CredentialImageResponse>(`users/${userId}/credential-image/`)
    }
}


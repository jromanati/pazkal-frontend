import { apiClient, type ApiResponse } from "@/lib/api"
import type { AuthCredentials, AuthResponse } from "@/types/auth"

type RefreshResponse = {
  access: string
  refresh: string
}

export class AuthService {
  private static token: string | null = null
  private static tokenExpiry: number | null = null

  static setTokens(responsedata: object | null): void {
    if (!responsedata) return
    const data: any = responsedata
    apiClient.setToken(data.access ?? null)
    apiClient.setRefresh(data.refresh ?? null)
    apiClient.setTenant(data.tenant?.schema_name ?? "")
    if (data.user) apiClient.setUser(JSON.stringify(data.user))
    if (data.tenant) apiClient.setTenantData(JSON.stringify(data.tenant))
    if (data.expires_in) apiClient.setTokenExpiry(String(data.expires_in))
    if (data.refresh_expires_in) apiClient.setRefreshExpiry(String(data.refresh_expires_in))
  }

  static async authenticate(credentials:AuthCredentials): Promise<ApiResponse<AuthResponse>> {
    if (!credentials.email || !credentials.password) {
      return {
        success: false,
        error: "Credenciales de autenticación no configuradas",
      }
    }

    const response = await apiClient.post<AuthResponse>(
      "auth/login/", credentials)
    if (response.success ) {
      AuthService.setTokens(response.data || null)
      return response
    }
    else if (response.error) {
      apiClient.setToken(null)
      apiClient.setTenant("")
      return {
        success: false,
        error: response.error,
      }
    }
    return response
  }

  static async refresh(): Promise<ApiResponse<RefreshResponse>> {
    const tokenRefresh = localStorage.getItem("token_refresh")
    const data = {
      refresh: tokenRefresh || "",
    }

    const response = await apiClient.post<RefreshResponse>("auth/refresh/", data)
    if (response.success && response.data?.access) {
      AuthService.setTokens(response.data)
      return response
    } else if (response.error) {
      apiClient.setToken(null)
      apiClient.setTenant("")
      return {
        success: false,
        error: response.error,
      }
    }
    return response
  }

  

  static isTokenValid(): boolean {
    const token = localStorage.getItem("token")
    const expiry = localStorage.getItem("token_expiry")

    if (!token || !expiry) return false

    const now = Math.floor(Date.now() / 1000)
    const expiresAt = parseInt(expiry, 10)    
    return now < expiresAt
  }

  static async isRefreshTokenValid(): Promise<boolean> {
    const expiry = localStorage.getItem("refresh_expiry")
    

    if (!expiry) return false

    const now = Math.floor(Date.now() / 1000)
    const expiresAt = parseInt(expiry, 10)
    if (now > expiresAt) {
      const refreshResponse = await this.refresh()
      if (refreshResponse.success && refreshResponse.data?.access) {
        return true
      }
    }    
    return false
  }

  static async logout(): Promise<ApiResponse<unknown>> {
    const tokenRefresh = localStorage.getItem("token_refresh")
    const data = {
      refresh: tokenRefresh || "",
    }

    const response = await apiClient.post<unknown>("auth/logout/", data)
    this.clearToken()
    return response
  }

  static getToken(): string | null {
    return this.isTokenValid() ? this.token : null
  }

  static clearToken(): void {
    this.token = null
    this.tokenExpiry = null
    apiClient.setToken(null)
    apiClient.setTenant("")
    apiClient.setTokenExpiry(null)
    apiClient.setRefreshExpiry(null)
  }

  static async getValidToken(): Promise<string | null> {
    if (this.isTokenValid()) {
      return this.token
    }

    const authResponse = await this.authenticate()
    if (authResponse.success && authResponse.data) {
      return authResponse.data.access
    }

    return null
  }
}

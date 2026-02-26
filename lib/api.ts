const DEFAULT_API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/"

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
  details?: Record<string, string[]>
}

function formatValidationDetails(details: unknown): string | undefined {
  if (!details || typeof details !== "object") return

  const entries = Object.entries(details as Record<string, unknown>)
  const lines: string[] = []

  for (const [field, value] of entries) {
    if (Array.isArray(value)) {
      const msg = value.map(String).join(" ")
      lines.push(`${field}: ${msg}`)
    }
  }

  return lines.length ? lines.join("\n") : undefined
}

function isTokenNotValidError(payload: any): boolean {
  const errorCode = payload?.error_code
  const detailsCode = payload?.details?.code
  const message = payload?.message

  return (
    errorCode === "TOKEN_NOT_VALID" ||
    detailsCode === "token_not_valid" ||
    message === "token_not_valid" ||
    (typeof message === "string" && message.includes("token_not_valid"))
  )
}

function redirectToLoginIfPossible() {
  if (typeof window === "undefined") return
  if (window.location.pathname === "/") return

  localStorage.removeItem("token")
  localStorage.removeItem("token_refresh")
  localStorage.removeItem("token_expiry")
  localStorage.removeItem("refresh_expiry")
  localStorage.removeItem("user_data")
  localStorage.removeItem("tenant_data")
  localStorage.removeItem("schema_name")

  window.location.href = "/"
}

class ApiClient {
  private baseUrl: string
  private token: string | null = null
  private refreshPromise: Promise<boolean> | null = null
  

  constructor() {
    this.baseUrl = "https://pazkal-api.softwarelabs.cl/api/v1/"
  }

  setToken(token: string | null) {
    console.log(token, 'Token???')
    if (!token) {
      localStorage.removeItem("token")
      this.token = null
      return
    }
    localStorage.setItem("token", token)
    this.token = token
  }

  setRefresh(token_refresh: string | null) {
    if (!token_refresh) {
      localStorage.removeItem("token_refresh")
      return
    }
    localStorage.setItem("token_refresh", token_refresh)
  }

  setTokenExpiry(token_expiry: string | null) {
    if (!token_expiry) {
      localStorage.removeItem("token_expiry")
      return
    }
    const now = Math.floor(Date.now() / 1000)
    const accessExpiryTimestamp = now + token_expiry 
    localStorage.setItem("token_expiry", String(accessExpiryTimestamp))
  }

  setRefreshExpiry(refresh_expires: string | null) {
    if (!refresh_expires) {
      localStorage.removeItem("refresh_expiry")
      return
    }
    const now = Math.floor(Date.now() / 1000)
    const refreshExpiryTimestamp = now + refresh_expires
    localStorage.setItem("refresh_expiry", String(refreshExpiryTimestamp))
  }

  setTenant(schema_name: string) {
    localStorage.setItem("schema_name", schema_name)
  }

  setUser(user_data: string) {
    localStorage.setItem("user_data", user_data)
  }

  setTenantData(tenant_data: string) {
    localStorage.setItem("tenant_data", tenant_data)
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (this.refreshPromise) return this.refreshPromise

    this.refreshPromise = (async () => {
      try {
        const refresh = localStorage.getItem("token_refresh") || ""
        if (!refresh) return false

        const url = `${this.baseUrl}auth/refresh/`
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ refresh }),
        })

        if (!response.ok) return false

        const data = (await response.json()) as { access?: string; refresh?: string }
        if (!data?.access || !data?.refresh) return false

        this.setToken(data.access)
        this.setRefresh(data.refresh)
        return true
      } catch {
        return false
      } finally {
        this.refreshPromise = null
      }
    })()

    return this.refreshPromise
  }

  private async parseJsonSafely(response: Response): Promise<any> {
    if (response.status === 204) return null

    const contentLength = response.headers.get("content-length")
    if (contentLength === "0") return null

    const text = await response.text()
    if (!text) return null

    try {
      return JSON.parse(text)
    } catch {
      return null
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`
      const token = localStorage.getItem("token")
      console.log(token, 'TOken!')

      const mergedHeaders: HeadersInit = {
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      }

      const doFetch = async (headers: HeadersInit) => {
        return fetch(url, {
          ...options,
          headers,
        })
      }

      let response = await doFetch(mergedHeaders)
      let data = await this.parseJsonSafely(response)

      if (!response.ok) {
        if (response.status === 401 && isTokenNotValidError(data)) {
          const refreshed = await this.refreshAccessToken()
          if (refreshed) {
            const newToken = localStorage.getItem("token")
            const retryHeaders: HeadersInit = {
              ...(options.headers || {}),
              ...(newToken ? { Authorization: `Bearer ${newToken}` } : {}),
            }
            response = await doFetch(retryHeaders)
            data = await this.parseJsonSafely(response)
          }
        }

        if (!response.ok) {
          if (response.status === 401) {
            redirectToLoginIfPossible()
          }
          const formattedDetails = formatValidationDetails(data?.details)
          return {
            success: false,
            error: formattedDetails || data.message || `HTTP Error: ${response.status}`,
            details: typeof data?.details === "object" ? data.details : undefined,
            data: data,
          }
        }
      }

      return {
        success: true,
        data: data ?? undefined,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      }
    }
  }


  get<T>(endpoint: string, headers?: Record<string, string>) {
    return this.request<T>(endpoint, { method: "GET", headers })
  }

  post<T>(endpoint: string, body?: any, headers?: Record<string, string>) {
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData

    return this.request<T>(endpoint, {
      method: "POST",
      body: isFormData ? body : body ? JSON.stringify(body) : undefined,
      headers: {
        ...(isFormData
          ? {} // No ponemos Content-Type si es FormData
          : { "Content-Type": "application/json" }),
        Accept: "application/json",
        ...(headers || {}),
      },
    })
  }


  patch<T>(endpoint: string, body?: any, headers?: Record<string, string>) {
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData

    return this.request<T>(endpoint, {
      method: "PATCH",
      body: isFormData ? body : body ? JSON.stringify(body) : undefined,
      headers: {
        ...(isFormData
          ? {} // No ponemos Content-Type si es FormData
          : { "Content-Type": "application/json" }),
        Accept: "application/json",
        ...(headers || {}),
      },
    })
  }


  put<T>(endpoint: string, body?: any, headers?: Record<string, string>) {
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData

    return this.request<T>(endpoint, {
      method: "PUT",
      body: isFormData ? body : body ? JSON.stringify(body) : undefined,
      headers: {
        ...(isFormData
          ? {} // No ponemos Content-Type si es FormData
          : { "Content-Type": "application/json" }),
        Accept: "application/json",
        ...(headers || {}),
      },
    })
  }

  delete<T>(endpoint: string, headers?: Record<string, string>) {
    return this.request<T>(endpoint, { method: "DELETE", headers })
  }
}

export const apiClient = new ApiClient()

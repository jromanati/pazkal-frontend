export interface AuthCredentials {
  email: string
  password: string
  remember_me?: boolean
}

export interface AuthResponse {
  access: string
  refresh: string
  expires_in: number
  refresh_expires_in: number
  user: {
    email: string
    first_name: string
    last_name: string
  }
  tenant: {
    schema_name: string
    client_type: "ecommerce" | "properties" | "excursions"
  }
}
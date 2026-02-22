export type Role = "superuser" | "gerente" | "operador" | "visualizador"

export type Section =
  | "dashboard"
  | "empresas"
  | "operadores"
  | "ordenes_vuelo"
  | "bitacora_vuelo"
  | "usuarios"

export type Action = "read" | "create" | "update" | "delete"

type UserLike = {
  is_superuser?: boolean
  group?: string
  group_name?: string
  groups?: Array<{ name?: string }>
}

function safeParseJson<T>(value: string | null): T | null {
  if (!value) return null
  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

export function getCurrentUserFromStorage(): UserLike | null {
  if (typeof window === "undefined") return null
  return safeParseJson<UserLike>(localStorage.getItem("user_data"))
}

export function getCurrentRole(): Role {
  const user = getCurrentUserFromStorage()
  if (user?.is_superuser) return "superuser"

  const rawGroup =
    user?.groups?.[0]?.name ??
    user?.group_name ??
    user?.group ??
    "visualizador"

  const g = String(rawGroup).trim().toLowerCase()

  if (g === "gerente" || g === "gerencia") return "gerente"
  if (g === "operador") return "operador"
  if (g === "visualizador") return "visualizador"

  return "visualizador"
}

const permissions: Record<Role, Record<Section, Record<Action, boolean>>> = {
  superuser: {
    dashboard: { read: true, create: true, update: true, delete: true },
    empresas: { read: true, create: true, update: true, delete: true },
    operadores: { read: true, create: true, update: true, delete: true },
    ordenes_vuelo: { read: true, create: true, update: true, delete: true },
    bitacora_vuelo: { read: true, create: true, update: true, delete: true },
    usuarios: { read: true, create: true, update: true, delete: true },
  },
  gerente: {
    dashboard: { read: true, create: false, update: false, delete: false },
    empresas: { read: true, create: false, update: false, delete: false },
    operadores: { read: true, create: false, update: false, delete: false },
    ordenes_vuelo: { read: true, create: true, update: true, delete: true },
    bitacora_vuelo: { read: true, create: true, update: true, delete: true },
    usuarios: { read: false, create: false, update: false, delete: false },
  },
  operador: {
    dashboard: { read: false, create: false, update: false, delete: false },
    empresas: { read: true, create: false, update: false, delete: false },
    operadores: { read: false, create: false, update: false, delete: false },
    ordenes_vuelo: { read: true, create: false, update: false, delete: false },
    bitacora_vuelo: { read: true, create: true, update: true, delete: false },
    usuarios: { read: false, create: false, update: false, delete: false },
  },
  visualizador: {
    dashboard: { read: true, create: false, update: false, delete: false },
    empresas: { read: true, create: false, update: false, delete: false },
    operadores: { read: true, create: false, update: false, delete: false },
    ordenes_vuelo: { read: true, create: false, update: false, delete: false },
    bitacora_vuelo: { read: true, create: false, update: false, delete: false },
    usuarios: { read: false, create: false, update: false, delete: false },
  },
}

export function canAction(section: Section, action: Action): boolean {
  const role = getCurrentRole()
  return Boolean(permissions[role]?.[section]?.[action])
}

export function canView(section: Section): boolean {
  return canAction(section, "read")
}

export function canCrud(section: Section): boolean {
  return (
    canAction(section, "create") &&
    canAction(section, "update") &&
    canAction(section, "delete")
  )
}

"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import useSWR from "swr"
import { Header } from '@/components/layout/header'
import { useSidebar } from '@/components/layout/dashboard-layout'
import { ConfirmModal } from '@/components/ui/confirm-modal'
import { useToast } from '@/hooks/use-toast'
import { type Usuario } from '@/lib/mock-data'
import { UsersService, type PaginatedResponse, type User } from "@/services/users.service"
import { canView } from '@/lib/permissions'

const avatarColors: Record<string, string> = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    slate: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
}

const tipoUsuarioBadge: Record<string, string> = {
    administrador: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    operador: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    gerencia: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    visualizador: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
}

const tipoUsuarioLabel: Record<string, string> = {
    administrador: 'Administrador',
    operador: 'Operador',
    gerencia: 'Gerencia',
    visualizador: 'Visualizador',
}

export default function UsuariosPage() {
    const { toggle } = useSidebar()
    const { toast } = useToast()
    const canRead = canView('usuarios')
    const [usuarios, setUsuarios] = useState<Usuario[]>([])
    const [filters, setFilters] = useState({
        nombre: '',
        rut: '',
        email: '',
        tipoUsuario: '' as '' | Usuario['tipoUsuario'],
        empresa: '',
    })
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; usuario: Usuario | null }>({
        open: false,
        usuario: null
    })

    const handleDelete = (usuario: Usuario) => {
        setDeleteModal({ open: true, usuario })
    }

    const confirmDelete = async () => {
        if (!deleteModal.usuario) return

        const usuarioToDelete = deleteModal.usuario
        const response = await UsersService.deleteUser(usuarioToDelete.id)
        if (!response.success) {
            const detailsText = response.details
                ? Object.entries(response.details)
                    .map(([k, v]) => `${k}: ${v.join(' ')}`)
                    .join('\n')
                : ''
            toast({
                title: 'Error al eliminar',
                description: detailsText || response.error || 'No se pudo eliminar el usuario.',
                variant: 'destructive',
            })
            return
        }

        setUsuarios(usuarios.filter(u => u.id !== usuarioToDelete.id))
        toast({
            title: 'Usuario eliminado',
            description: `El usuario "${usuarioToDelete.nombre}" ha sido eliminado exitosamente.`,
        })
        setDeleteModal({ open: false, usuario: null })
    }

    const fetchedUsers = async () => {
        // TODO: Validar token
        // const isValid = AuthService.isTokenValid()
        // if (!isValid) {
        // const isRefreshValid = await AuthService.isRefreshTokenValid()
        // if (!isRefreshValid) window.location.href = "/"
        // }
        const response = await UsersService.getUsers({ page: 1, page_size: 20 })
        console.log(response)
        if (!response.success || !response.data) return null
        return response.data
    }

    const { data: users } = useSWR<PaginatedResponse<User> | null>("users", fetchedUsers)

    useEffect(() => {
        if (!users?.results) return

        const mapped: Usuario[] = users.results.map((u) => {
            const firstName = u.first_name ?? ""
            const lastName = u.last_name ?? ""
            const nombre = `${firstName} ${lastName}`.trim() || u.email
            const iniciales = `${(firstName?.[0] || "").toUpperCase()}${(lastName?.[0] || "").toUpperCase()}` || "?"
            const rut = u.profile?.rut ?? ""
            const companies = u.companies ?? []
            const primaryCompany = companies?.[0]?.name ?? ""
            const extraCompanies = Math.max(0, companies.length - 1)
            const empresa = primaryCompany
                ? (extraCompanies > 0 ? `${primaryCompany} +${extraCompanies}` : primaryCompany)
                : ""
            const ultimaSesion = u.last_login ?? ""

            const rawGroup = String(u.groups?.[0]?.name ?? "").trim()
            const group = rawGroup.toLowerCase()

            const tipoUsuario: Usuario["tipoUsuario"] = u.is_superuser
                ? "administrador"
                : group === "gerente" || group === "gerencia"
                    ? "gerencia"
                    : group === "operador"
                        ? "operador"
                        : "visualizador"

            const rol = u.is_superuser
                ? "Superusuario"
                : rawGroup || "Visualizador"

            return {
                id: String(u.id),
                nombre,
                iniciales,
                rut,
                email: u.email,
                correo: u.email,
                rol,
                avatar: u.avatar ?? "",
                telefono: u.profile?.telefono ?? u.phone ?? "",
                empresa,
                tipoUsuario,
                ultimaSesion,
                colorAvatar: "blue",
            }
        })

        setUsuarios(mapped)
    }, [users])

    const filteredUsuarios = usuarios.filter((u) => {
        const nombre = u.nombre.toLowerCase()
        const rut = u.rut.toLowerCase()
        const email = u.email.toLowerCase()
        const empresa = u.empresa.toLowerCase()

        if (filters.nombre.trim() && !nombre.includes(filters.nombre.trim().toLowerCase())) return false
        if (filters.rut.trim() && !rut.includes(filters.rut.trim().toLowerCase())) return false
        if (filters.email.trim() && !email.includes(filters.email.trim().toLowerCase())) return false
        if (filters.empresa.trim() && !empresa.includes(filters.empresa.trim().toLowerCase())) return false
        if (filters.tipoUsuario && u.tipoUsuario !== filters.tipoUsuario) return false
        return true
    })

    if (!canRead) {
        return (
            <>
                <Header icon="manage_accounts" title="Gestión de Usuarios" onMenuClick={toggle} />
                <div className="p-8 text-center">
                    <p className="text-gray-500">No tienes permisos para acceder a esta sección.</p>
                </div>
            </>
        )
    }

    return (
        <>
        <Header icon="manage_accounts" title="Gestión de Usuarios" onMenuClick={toggle} />

        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {/* Header */}
            <div className="mb-6 lg:mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <nav aria-label="Breadcrumb" className="flex mb-3 lg:mb-4">
                    <ol className="inline-flex items-center space-x-1 md:space-x-3 text-xs text-gray-500 uppercase tracking-widest font-semibold">
                        <li className="inline-flex items-center">
                        <Link href="/dashboard" className="hover:text-[#2c528c] transition-colors">Sistema</Link>
                        </li>
                        <li>
                        <div className="flex items-center">
                            <span className="material-symbols-outlined text-sm mx-1">chevron_right</span>
                            <span className="text-slate-400">Usuarios</span>
                        </div>
                        </li>
                    </ol>
                    </nav>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-gray-100">Gestión de Usuarios</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-1">Administre las cuentas de acceso y permisos de la plataforma.</p>
                </div>
                <Link
                    href="/usuarios/nuevo"
                    className="bg-[#2c528c] hover:bg-blue-800 text-white text-sm font-bold px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                >
                    <span className="material-symbols-outlined text-lg sm:text-xl">person_add</span>
                    <span className="hidden sm:inline">Crear Usuario</span>
                    <span className="sm:hidden">Crear</span>
                </Link>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-4 sm:p-5 mb-4 lg:mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    <div>
                        <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Nombre</label>
                        <input
                            value={filters.nombre}
                            onChange={(e) => setFilters((p) => ({ ...p, nombre: e.target.value }))}
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">RUT</label>
                        <input
                            value={filters.rut}
                            onChange={(e) => setFilters((p) => ({ ...p, rut: e.target.value }))}
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Email</label>
                        <input
                            value={filters.email}
                            onChange={(e) => setFilters((p) => ({ ...p, email: e.target.value }))}
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Tipo</label>
                        <select
                            value={filters.tipoUsuario}
                            onChange={(e) => setFilters((p) => ({ ...p, tipoUsuario: e.target.value as any }))}
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                        >
                            <option value="">Todos</option>
                            <option value="administrador">Administrador</option>
                            <option value="gerencia">Gerente</option>
                            <option value="operador">Operador</option>
                            <option value="visualizador">Visualizador</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Empresa</label>
                        <input
                            value={filters.empresa}
                            onChange={(e) => setFilters((p) => ({ ...p, empresa: e.target.value }))}
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                        />
                    </div>
                </div>
            </div>

            {/* Tabla Desktop */}
            <div className="hidden lg:block bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Nombre de Usuario</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">RUT</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Empresa</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Tipo de Usuario</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {filteredUsuarios.map((usuario) => (
                    <tr key={usuario.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                        <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className={`size-9 rounded-full flex items-center justify-center font-bold text-sm ${avatarColors[usuario.colorAvatar] || avatarColors.blue}`}>
                            {usuario.iniciales}
                            </div>
                            <div>
                            <p className="text-sm font-semibold text-slate-700 dark:text-gray-200 leading-none">{usuario.nombre}</p>
                            <p className="text-[11px] text-gray-400 mt-1 uppercase tracking-tighter">Última sesión: {usuario.ultimaSesion}</p>
                            </div>
                        </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-gray-400 font-medium">{usuario.rut}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-gray-400">{usuario.email}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-gray-400 font-medium">{usuario.empresa}</td>
                        <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tipoUsuarioBadge[usuario.tipoUsuario]}`}>
                            {tipoUsuarioLabel[usuario.tipoUsuario]}
                        </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                            <Link
                            href={`/usuarios/${usuario.id}/editar`}
                            className="p-1.5 text-slate-400 hover:text-[#2c528c] transition-colors rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                            <span className="material-symbols-outlined text-lg">edit</span>
                            </Link>
                            <button
                            onClick={() => handleDelete(usuario)}
                            className="p-1.5 text-slate-400 hover:text-red-500 transition-colors rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                            <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                        </div>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>

            {/* Paginación */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <p className="text-xs text-slate-500 dark:text-gray-400 font-medium uppercase tracking-wider">Mostrando 1-{usuarios.length} de {usuarios.length} usuarios</p>
                <div className="flex items-center gap-1">
                <button className="p-1 text-slate-400 hover:text-[#2c528c] disabled:opacity-30" disabled>
                    <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button className="size-8 rounded flex items-center justify-center text-xs font-bold bg-[#2c528c] text-white">1</button>
                <button className="p-1 text-slate-400 hover:text-[#2c528c] disabled:opacity-30" disabled>
                    <span className="material-symbols-outlined">chevron_right</span>
                </button>
                </div>
            </div>
            <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">
                    Si un usuario pertenece a más de una empresa, se muestra la primera y luego "+N" con la cantidad de empresas adicionales.
                </p>
            </div>
            </div>

            {/* Cards Mobile */}
            <div className="lg:hidden space-y-3">
            {filteredUsuarios.map((usuario) => (
                <div key={usuario.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                    <div className={`size-10 rounded-full flex items-center justify-center font-bold text-sm ${avatarColors[usuario.colorAvatar] || avatarColors.blue}`}>
                        {usuario.iniciales}
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-700 dark:text-gray-200">{usuario.nombre}</p>
                        <p className="text-sm font-semibold text-slate-700 dark:text-gray-200">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${tipoUsuarioBadge[usuario.tipoUsuario]}`}>
                                {tipoUsuarioLabel[usuario.tipoUsuario]}
                            </span>
                        </p>
                        <p className="text-xs text-gray-400">{usuario.email}</p>
                    </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div>
                    <span className="text-gray-400 uppercase tracking-wider text-[10px]">RUT</span>
                    <p className="text-slate-600 dark:text-gray-300 font-medium">{usuario.rut}</p>
                    </div>
                    <div>
                    <span className="text-gray-400 uppercase tracking-wider text-[10px]">Empresa</span>
                    <p className="text-slate-600 dark:text-gray-300 font-medium truncate">{usuario.empresa}</p>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                    <span className="text-[10px] text-gray-400 uppercase tracking-tighter">Última sesión: {usuario.ultimaSesion}</span>
                    <div className="flex items-center gap-1">
                    <Link
                        href={`/usuarios/${usuario.id}/editar`}
                        className="p-1.5 text-slate-400 hover:text-[#2c528c] transition-colors rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <span className="material-symbols-outlined text-lg">edit</span>
                    </Link>
                    <button
                        onClick={() => handleDelete(usuario)}
                        className="p-1.5 text-slate-400 hover:text-red-500 transition-colors rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                    </div>
                </div>
                </div>
            ))}

            {/* Paginación Mobile */}
            <div className="flex items-center justify-center gap-2 pt-4">
                <button className="p-2 text-slate-400 hover:text-[#2c528c] disabled:opacity-30" disabled>
                <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <span className="text-xs text-slate-500 font-medium">Página 1 de 1</span>
                <button className="p-2 text-slate-400 hover:text-[#2c528c] disabled:opacity-30" disabled>
                <span className="material-symbols-outlined">chevron_right</span>
                </button>
            </div>
            </div>

            <div className="lg:hidden mt-4">
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">
                    Si un usuario pertenece a más de una empresa, se muestra la primera y luego "+N" con la cantidad de empresas adicionales.
                </p>
            </div>
        </div>

        {/* Modal de confirmación */}
        <ConfirmModal
            isOpen={deleteModal.open}
            onClose={() => setDeleteModal({ open: false, usuario: null })}
            onConfirm={confirmDelete}
            title="Eliminar usuario"
            description={`¿Está seguro que desea eliminar el usuario "${deleteModal.usuario?.nombre}"? Esta acción no se puede deshacer.`}
            confirmText="Eliminar"
            variant="danger"
        />
        </>
    )
}

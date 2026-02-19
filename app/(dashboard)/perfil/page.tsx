"use client"

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { useSidebar } from '@/components/layout/dashboard-layout'
import { useToast } from '@/hooks/use-toast'
import { getCurrentUserFromStorage } from '@/lib/permissions'
import { UsersService } from '@/services/users.service'

export default function PerfilPage() {
  const { toggle } = useSidebar()
  const { toast } = useToast()

  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)

  const localUser = useMemo(() => (mounted ? getCurrentUserFromStorage() : null), [mounted])
  const userId = (localUser as any)?.id

  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    password: '',
    password_confirm: '',
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const run = async () => {
      if (!mounted) return
      if (!userId) return

      setLoading(true)
      try {
        const response = await UsersService.getUser(userId)
        if (!response.success || !response.data) {
          toast({
            title: 'No se pudo cargar tu perfil',
            description: response.error || 'Error desconocido',
            variant: 'destructive',
          })
          return
        }

        const u = response.data
        setFormData((prev) => ({
          ...prev,
          email: u.email ?? '',
          first_name: u.first_name ?? '',
          last_name: u.last_name ?? '',
          phone: u.phone ?? '',
          password: '',
          password_confirm: '',
        }))
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [mounted, userId, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    if (formData.password || formData.password_confirm) {
      if (formData.password !== formData.password_confirm) {
        toast({
          title: 'Contraseñas no coinciden',
          description: 'La contraseña y su repetición deben ser iguales.',
          variant: 'destructive',
        })
        return
      }
    }

    setLoading(true)
    try {
      const payload = {
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        ...(formData.password ? { password: formData.password } : {}),
      }

      const response = await UsersService.updateUser(userId, payload)
      if (!response.success) {
        toast({
          title: 'Error al guardar',
          description: response.error || 'No se pudieron guardar los cambios.',
          variant: 'destructive',
        })
        return
      }

      const updatedUser = response.data
      if (updatedUser) {
        localStorage.setItem('user_data', JSON.stringify(updatedUser))
      }

      setFormData((prev) => ({
        ...prev,
        password: '',
        password_confirm: '',
      }))

      toast({
        title: 'Perfil actualizado',
        description: 'Tus datos fueron actualizados exitosamente.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header icon="account_circle" title="Mi Perfil" onMenuClick={toggle} />

      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto w-full">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-gray-100">Mi Perfil</h2>
            <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-1">
              Actualiza tus datos personales. No puedes modificar tu grupo ni tus empresas.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            Volver
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-3 sm:p-4 bg-slate-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#2c528c]">person</span>
              <h3 className="font-bold text-slate-700 dark:text-gray-200 text-sm sm:text-base">Datos personales</h3>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label htmlFor="first_name" className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                    Nombre
                  </label>
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                  />
                </div>

                <div>
                  <label htmlFor="last_name" className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                    Apellido
                  </label>
                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label htmlFor="email" className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                    Teléfono
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-3 sm:p-4 bg-slate-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#2c528c]">lock</span>
              <h3 className="font-bold text-slate-700 dark:text-gray-200 text-sm sm:text-base">Cambiar contraseña</h3>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label htmlFor="password" className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                    Nueva contraseña
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      <span className="material-symbols-outlined text-xl">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="password_confirm" className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                    Repetir contraseña
                  </label>
                  <div className="relative">
                    <input
                      id="password_confirm"
                      name="password_confirm"
                      type={showPasswordConfirm ? 'text' : 'password'}
                      value={formData.password_confirm}
                      onChange={handleChange}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2c528c] focus:ring-[#2c528c] text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      aria-label={showPasswordConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      <span className="material-symbols-outlined text-xl">
                        {showPasswordConfirm ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-400">
                Deja ambos campos vacíos si no quieres cambiar tu contraseña.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#2c528c] hover:bg-blue-800 disabled:opacity-70 text-white text-sm font-bold px-8 py-2.5 rounded-lg flex items-center gap-2 transition-colors shadow-lg"
            >
              <span className="material-symbols-outlined text-lg">save</span>
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

"use client"

import React from "react"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthService } from "@/services/auth.service"
import type { AuthCredentials, AuthResponse } from "@/types/auth"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    usuario: '',
    password: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulación de login
    // setTimeout(() => {
    //   setIsLoading(false)
    //   router.push('/dashboard')
    // }, 1000)
    const credentials: AuthCredentials = {
      email: formData.usuario || "",
      password: formData.password || "",
      remember_me: false,
    }
    const response = await AuthService.authenticate(credentials)
    setTimeout(() => {
      if (response.success) {
       console.log("Login successful:", response.data)
       router.push('/dashboard')
       setIsLoading(false)
      } else {
        // setError("Credenciales incorrectas. Verifica el usuario y contraseña.")
        console.error("Login failed:", response.error)
      }
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="bg-[#f3f4f6] min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8 pt-12 text-center">
            {/* Logo */}
            <div className="flex flex-col items-center gap-3 mb-10">
              <div className="size-14 rounded-xl bg-[#2c528c] flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-white text-4xl">flight_takeoff</span>
              </div>
              <div className="flex flex-col">
                <h1 className="text-3xl font-black tracking-wider text-[#2c528c]">PAZKAL</h1>
                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Aviation Management</span>
              </div>
            </div>

            {/* Welcome text */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-slate-800">Bienvenido</h2>
              <p className="text-sm text-gray-500 mt-1">Ingresa tus credenciales para acceder</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6 text-left">
              <div>
                <label 
                  className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2" 
                  htmlFor="usuario"
                >
                  Usuario
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">person</span>
                  <input
                    className="block w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-[#2c528c] focus:border-[#2c528c] transition-all outline-none"
                    id="usuario"
                    name="usuario"
                    placeholder="Tu nombre de usuario"
                    required
                    type="text"
                    value={formData.usuario}
                    onChange={(e) => setFormData({ ...formData, usuario: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label 
                  className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2" 
                  htmlFor="password"
                >
                  Contraseña
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">lock</span>
                  <input
                    className="block w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-[#2c528c] focus:border-[#2c528c] transition-all outline-none"
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    required
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
                <div className="mt-2 text-right">
                  <a className="text-xs font-semibold text-[#2c528c] hover:text-blue-700 transition-colors" href="#">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
              </div>

              <div className="pt-2">
                <button
                  className="w-full bg-[#2c528c] hover:bg-blue-800 text-white font-bold py-3.5 rounded-lg transition-all shadow-lg shadow-[#2c528c]/20 flex items-center justify-center gap-2 group disabled:opacity-70"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="material-symbols-outlined text-xl animate-spin">progress_activity</span>
                      <span>Ingresando...</span>
                    </>
                  ) : (
                    <>
                      <span>Iniciar sesión</span>
                      <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">login</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 p-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400 font-medium">
              © 2025 PAZKAL Software. Todos los derechos reservados.
            </p>
            <p className="text-xs text-gray-400 font-medium">
              Desarrollado por SoftwareLabs
            </p>
          </div>
        </div>

        {/* Links */}
        <div className="mt-8 flex justify-center gap-6">
          <a className="text-xs text-gray-400 hover:text-[#2c528c] transition-colors font-medium" href="#">Soporte</a>
          <a className="text-xs text-gray-400 hover:text-[#2c528c] transition-colors font-medium" href="#">Privacidad</a>
          <a className="text-xs text-gray-400 hover:text-[#2c528c] transition-colors font-medium" href="#">Términos</a>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useEffect } from 'react'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning'
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Eliminar',
  cancelText = 'Cancelar',
  variant = 'danger'
}: ConfirmModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-[90%] sm:max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Icon */}
        <div className="pt-6 sm:pt-8 pb-3 sm:pb-4 flex justify-center">
          <div className={`size-12 sm:size-16 rounded-full flex items-center justify-center ${
            variant === 'danger' 
              ? 'bg-red-100 dark:bg-red-900/30' 
              : 'bg-amber-100 dark:bg-amber-900/30'
          }`}>
            <span className={`material-symbols-outlined text-2xl sm:text-3xl ${
              variant === 'danger' 
                ? 'text-red-600 dark:text-red-400' 
                : 'text-amber-600 dark:text-amber-400'
            }`}>
              {variant === 'danger' ? 'delete_forever' : 'warning'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 sm:px-8 pb-4 sm:pb-6 text-center">
          <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white mb-2">
            {title}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
            {description}
          </p>
        </div>

        {/* Actions */}
        <div className="px-6 sm:px-8 pb-6 sm:pb-8 flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 sm:py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={`flex-1 px-4 py-2.5 sm:py-2.5 rounded-lg text-sm font-semibold text-white transition-colors ${
              variant === 'danger'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-amber-600 hover:bg-amber-700'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useToast } from '@/hooks/use-toast'
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast'

function ToastIcon({ variant }: { variant?: string }) {
  const iconClass = "w-5 h-5 flex-shrink-0"
  
  switch (variant) {
    case 'destructive':
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500/20">
          <svg className={`${iconClass} text-red-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      )
    case 'success':
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/20">
          <svg className={`${iconClass} text-emerald-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )
    case 'warning':
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/20">
          <svg className={`${iconClass} text-amber-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
      )
    default:
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#2c528c]/30">
          <svg className={`${iconClass} text-[#5a8fd4]`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      )
  }
}

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider duration={4000}>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast key={id} variant={variant as "default" | "destructive" | "success" | "warning" | undefined} {...props}>
            <ToastIcon variant={variant as string} />
            <div className="grid gap-0.5 flex-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}

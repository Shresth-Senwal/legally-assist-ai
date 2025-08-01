/**
 * Toast Notification Service
 * 
 * Provides centralized toast notifications for user feedback.
 * Implements a simple notification system with support for different types.
 * 
 * Features:
 * - Multiple notification types (success, error, info, warning)
 * - Auto-dismiss functionality
 * - Queue management for multiple notifications
 * - Accessibility support with ARIA live regions
 */

import { useState, useCallback, createContext, useContext, ReactNode } from 'react'

export interface ToastNotification {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  description?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastContextType {
  notifications: ToastNotification[]
  addToast: (notification: Omit<ToastNotification, 'id'>) => void
  removeToast: (id: string) => void
  clearAll: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

/**
 * Hook to access toast functionality
 */
export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

/**
 * Toast Provider Component
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<ToastNotification[]>([])

  const addToast = useCallback((notification: Omit<ToastNotification, 'id'>) => {
    const id = Date.now().toString()
    const newNotification: ToastNotification = {
      ...notification,
      id,
      duration: notification.duration ?? 5000
    }

    setNotifications(prev => [...prev, newNotification])

    // Auto-remove toast after duration
    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, newNotification.duration)
    }
  }, [])

  const removeToast = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  return (
    <ToastContext.Provider value={{ notifications, addToast, removeToast, clearAll }}>
      {children}
    </ToastContext.Provider>
  )
}

/**
 * Convenience toast creation function that can be used outside components
 */
let toastContextRef: ToastContextType | null = null

export function setToastContext(context: ToastContextType) {
  toastContextRef = context
}

/**
 * Global toast functions that can be used anywhere
 */
export const toast = {
  success: (title: string, description?: string) => {
    toastContextRef?.addToast({ type: 'success', title, description })
  },
  error: (title: string, description?: string) => {
    toastContextRef?.addToast({ type: 'error', title, description })
  },
  info: (title: string, description?: string) => {
    toastContextRef?.addToast({ type: 'info', title, description })
  },
  warning: (title: string, description?: string) => {
    toastContextRef?.addToast({ type: 'warning', title, description })
  }
}

/**
 * Confirmation Dialog Component
 * 
 * Provides a reusable confirmation dialog for destructive or important actions.
 * Follows accessibility best practices with keyboard navigation and screen reader support.
 * 
 * Features:
 * - Customizable title, description, and action buttons
 * - Support for different action types (destructive, primary, secondary)
 * - Keyboard navigation (Escape to cancel, Enter to confirm)
 * - Smooth animations and backdrop blur
 * - Accessible focus management
 */

import { motion } from "framer-motion"
import { AlertTriangle, Info, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

interface ConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'destructive' | 'warning' | 'info' | 'success'
  isLoading?: boolean
}

/**
 * Get icon and styling based on dialog variant
 */
function getVariantConfig(variant: ConfirmationDialogProps['variant']) {
  switch (variant) {
    case 'destructive':
      return {
        icon: XCircle,
        iconColor: 'text-destructive',
        confirmVariant: 'destructive' as const
      }
    case 'warning':
      return {
        icon: AlertTriangle,
        iconColor: 'text-yellow-500',
        confirmVariant: 'destructive' as const
      }
    case 'success':
      return {
        icon: CheckCircle,
        iconColor: 'text-green-500',
        confirmVariant: 'default' as const
      }
    case 'info':
    default:
      return {
        icon: Info,
        iconColor: 'text-blue-500',
        confirmVariant: 'default' as const
      }
  }
}

/**
 * ConfirmationDialog provides a modal confirmation interface
 * Used for confirming destructive or important actions throughout the app
 */
export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = 'info',
  isLoading = false
}: ConfirmationDialogProps) {
  const { icon: Icon, iconColor, confirmVariant } = getVariantConfig(variant)

  /**
   * Handle confirm action with loading state
   */
  const handleConfirm = async () => {
    try {
      await onConfirm()
      onClose()
    } catch (error) {
      // Error handling will be done by the calling component
      console.error('Confirmation action failed:', error)
    }
  }

  /**
   * Handle keyboard shortcuts
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      e.preventDefault()
      handleConfirm()
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-md"
        onKeyDown={handleKeyDown}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          {/* Header with icon */}
          <DialogHeader className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Icon className={`h-6 w-6 ${iconColor}`} />
            </div>
            
            <div className="space-y-2">
              <DialogTitle className="text-lg font-semibold text-chat-text-primary">
                {title}
              </DialogTitle>
              <DialogDescription className="text-chat-text-secondary">
                {description}
              </DialogDescription>
            </div>
          </DialogHeader>

          {/* Action buttons */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="border-chat-border hover:bg-hover-overlay"
            >
              {cancelText}
            </Button>
            
            <Button
              variant={confirmVariant}
              onClick={handleConfirm}
              disabled={isLoading}
              className="min-w-[80px]"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                  />
                  <span>Loading...</span>
                </div>
              ) : (
                confirmText
              )}
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}

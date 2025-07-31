/**
 * Chat Input Component
 * 
 * Persistent text input interface for the Legally AI app.
 * Provides ChatGPT-style message input with send functionality.
 * 
 * Features:
 * - Auto-expanding textarea with multi-line support
 * - Send button with keyboard shortcuts (Enter to send, Shift+Enter for new line)
 * - Attachment button for file uploads
 * - Responsive design with proper spacing
 * - Smooth animations and focus states
 * - Character limit and input validation
 */

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Send, Paperclip, ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface ChatInputProps {
  onSendMessage?: (message: string) => void
  onAttachFile?: () => void
  placeholder?: string
  disabled?: boolean
  maxLength?: number
}

/**
 * ChatInput provides the main message input interface
 * Handles message composition and sending with ChatGPT-style UX
 */
export function ChatInput({ 
  onSendMessage, 
  onAttachFile,
  placeholder = "Ask anything",
  disabled = false,
  maxLength = 4000
}: ChatInputProps) {
  const [message, setMessage] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  /**
   * Auto-resize textarea based on content
   */
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = "auto"
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px"
    }
  }, [message])

  /**
   * Handle message sending
   */
  const handleSend = () => {
    const trimmedMessage = message.trim()
    if (trimmedMessage && !disabled) {
      onSendMessage?.(trimmedMessage)
      setMessage("")
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"
      }
    }
  }

  /**
   * Handle keyboard shortcuts
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  /**
   * Handle input change with length validation
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    if (value.length <= maxLength) {
      setMessage(value)
    }
  }

  const canSend = message.trim().length > 0 && !disabled

  return (
    <div className="border-t border-chat-border bg-chat-background/80 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto p-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`relative flex items-end gap-3 p-3 rounded-xl border transition-all duration-200 ${
            isFocused 
              ? "border-accent shadow-lg shadow-focus-ring" 
              : "border-chat-border bg-chat-surface hover:border-chat-border/60"
          }`}
        >
          {/* Attach button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onAttachFile}
            disabled={disabled}
            className="h-8 w-8 rounded-lg hover:bg-hover-overlay transition-colors flex-shrink-0"
            aria-label="Attach file"
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          {/* Text input area */}
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              className="min-h-[44px] max-h-[200px] resize-none border-0 bg-transparent p-0 pr-12 text-chat-text-primary placeholder:text-chat-text-secondary focus:ring-0 focus:outline-none"
              style={{ 
                boxShadow: "none",
                outline: "none"
              }}
            />
            
            {/* Character count indicator */}
            {message.length > maxLength * 0.8 && (
              <div className="absolute bottom-1 right-14 text-xs text-chat-text-secondary">
                {message.length}/{maxLength}
              </div>
            )}
          </div>

          {/* Send button */}
          <Button
            onClick={handleSend}
            disabled={!canSend}
            size="sm"
            className={`h-8 w-8 rounded-lg transition-all duration-200 flex-shrink-0 ${
              canSend
                ? "bg-accent hover:bg-accent-hover text-accent-foreground shadow-sm"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            }`}
            aria-label="Send message"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </motion.div>

        {/* Helper text */}
        <div className="mt-2 text-center">
          <p className="text-xs text-chat-text-secondary">
            By messaging Legally, you agree to our{" "}
            <a href="#" className="text-accent hover:underline">Terms</a>
            {" "}and have read our{" "}
            <a href="#" className="text-accent hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  )
}
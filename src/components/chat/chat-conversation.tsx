/**
 * Chat Conversation Component
 * 
 * Manages active chat conversations with Gemini AI integration.
 * Displays conversation history, handles streaming responses, and provides
 * a full chat interface for legal professionals.
 * 
 * Features:
 * - Real-time streaming AI responses
 * - Conversation history with proper threading
 * - Loading states and error handling
 * - Retry functionality for failed messages
 * - Professional styling for legal context
 * - Accessibility compliance with screen readers
 * - Auto-scroll to latest messages
 * - Message timestamps and status indicators
 * 
 * Integration:
 * - Uses useGemini hook for AI functionality
 * - Integrates with ChatInput component
 * - Supports legal-specific conversation context
 * - Handles multi-turn conversations with memory
 */

import { useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bot, User, AlertCircle, RotateCcw, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChatInput } from "./chat-input"
import { useGemini } from "@/hooks/use-gemini"
import { GeminiErrorType, ChatMessage } from "@/lib/gemini"
import { FILE_PROCESSING_STRINGS } from "@/lib/i18n-strings"

interface ChatConversationProps {
  /** Optional initial message to start the conversation */
  initialMessage?: string
  /** Callback when conversation starts */
  onConversationStart?: () => void
  /** Callback when conversation ends */
  onConversationEnd?: () => void
  /** Callback to expose addMessage function for external AI messages */
  onChatReady?: (addAIMessage: (content: string) => void) => void
  /** Callback to open file attachment modal */
  onAttachFile?: () => void
}

/**
 * Individual message component for rendering chat messages
 */
interface MessageProps {
  role: 'user' | 'model' | 'system'
  content: string
  timestamp: Date
  isStreaming?: boolean
  onRetry?: () => void
  error?: boolean
}

function Message({ role, content, timestamp, isStreaming, onRetry, error }: MessageProps) {
  const isUser = role === 'user'
  const isSystem = role === 'system'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 p-4 ${isUser ? 'justify-end' : 'justify-start'} ${isSystem ? 'opacity-70' : ''}`}
      role="article"
      aria-label={`${isUser ? 'User' : isSystem ? 'System' : 'AI Assistant'} message`}
    >
      {!isUser && !isSystem && (
        <div 
          className="flex-shrink-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center"
          aria-label="AI Assistant avatar"
        >
          <Bot className="h-4 w-4 text-accent-foreground" aria-hidden="true" />
        </div>
      )}
      
      <div className={`max-w-[80%] ${isUser ? 'order-first' : ''}`}>
        <div
          className={`rounded-lg px-4 py-3 ${
            isUser
              ? 'bg-accent text-accent-foreground ml-auto'
              : isSystem
              ? 'bg-muted text-muted-foreground text-sm italic'
              : error
              ? 'bg-destructive/10 border border-destructive/20 text-destructive'
              : 'bg-chat-surface border border-chat-border text-chat-text-primary'
          }`}
          role="log"
          aria-live={isStreaming ? 'polite' : 'off'}
        >
          {error && (
            <div className="flex items-center gap-2 mb-2 text-destructive" role="alert">
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
              <span className="text-sm font-medium">Failed to send message</span>
            </div>
          )}
          
          <div 
            className="whitespace-pre-wrap break-words"
            aria-label={isUser ? 'Your message' : 'AI response'}
          >
            {content}
            {isStreaming && (
              <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="inline-block w-2 h-4 bg-current ml-1"
              />
            )}
          </div>
          
          {error && onRetry && (
            <Button
              onClick={onRetry}
              variant="ghost"
              size="sm"
              className="mt-2 h-6 px-2 text-xs hover:bg-destructive/20"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          )}
        </div>
        
        <div className={`text-xs text-muted-foreground mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          <Clock className="h-3 w-3 inline mr-1" />
          {timestamp.toLocaleTimeString()}
        </div>
      </div>
      
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <User className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
    </motion.div>
  )
}

/**
 * ChatConversation provides the main conversation interface
 * Integrates with Gemini AI for intelligent legal assistance
 */
export function ChatConversation({ 
  initialMessage, 
  onConversationStart, 
  onConversationEnd,
  onChatReady,
  onAttachFile
}: ChatConversationProps & { onAttachFile?: () => void }) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  // Track if initial message has been sent to avoid duplicate sends
  const hasSentInitial = useRef(false)
  
  // Initialize Gemini hook with legal context
  const {
    conversation,
    streamingResponse,
    isLoading,
    error,
    isReady,
    sendMessage,
    retry,
    canRetry,
    clearConversation,
    addMessage
  } = useGemini({
    multiTurn: true,
    legalContext: true,
    autoRetry: false, // We'll handle retry manually for better UX
    onError: (error) => {
      console.error('Gemini error:', error.type, error.message)
    }
  })

  // Auto-scroll to latest messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversation, streamingResponse])

  /**
   * Function to add AI messages programmatically from external sources
   * Used for OCR results, file analysis, and other AI-generated content
   * Includes comprehensive security sanitization for user safety
   * 
   * @param content - The AI-generated content to add as a message
   * @returns void
   */
  const addAIMessage = useCallback((content: string) => {
    if (!isReady || !addMessage) {
      console.warn(FILE_PROCESSING_STRINGS.CHAT_NOT_READY_ERROR)
      return
    }

    // Sanitize content before adding to chat to prevent XSS and other security issues
    const sanitizedContent = content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocols
      .trim()

    if (!sanitizedContent) {
      console.warn(FILE_PROCESSING_STRINGS.EMPTY_CONTENT_WARNING)
      return
    }

    const aiMessage: ChatMessage = {
      role: 'model',
      parts: [{ text: sanitizedContent }]
    }

    addMessage(aiMessage)
  }, [isReady, addMessage])

  // Expose addAIMessage function to parent component
  useEffect(() => {
    if (isReady && onChatReady) {
      onChatReady(addAIMessage)
    }
  }, [isReady, onChatReady, addAIMessage])

  // Handle initial message
  useEffect(() => {
    // Only send the initial message if:
    // - initialMessage exists
    // - service is ready
    // - conversation has only the system message (or is empty)
    // - and we haven't already sent it
    if (
      initialMessage &&
      isReady &&
      conversation.length <= 1 &&
      !hasSentInitial.current
    ) {
      hasSentInitial.current = true
      sendMessage(initialMessage)
      onConversationStart?.()
    }
  }, [initialMessage, isReady, conversation.length, sendMessage, onConversationStart])

  // Handle message sending
  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return
    
    try {
      await sendMessage(message)
      if (conversation.length === 1) {
        onConversationStart?.()
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  // Handle conversation clearing
  const handleClearConversation = () => {
    clearConversation()
    onConversationEnd?.()
  }

  // Render conversation messages
  const renderMessages = () => {
    const visibleMessages = conversation.filter(msg => msg.role !== 'system')
    
    return visibleMessages.map((message, index) => {
      const content = message.parts.map(part => part.text).join('')
      return (
        <Message
          key={index}
          role={message.role as 'user' | 'model'}
          content={content}
          timestamp={new Date()}
          onRetry={message.role === 'user' && index === visibleMessages.length - 1 && error ? retry : undefined}
          error={message.role === 'user' && index === visibleMessages.length - 1 && !!error}
        />
      )
    })
  }

  // Show service unavailable state
  if (!isReady) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            AI service is not available. Please check your VITE_GEMINI_API_KEY configuration.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Conversation Header */}
      <div className="border-b border-chat-border p-4 bg-chat-surface">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-chat-text-primary">Legal Assistant</h2>
            <p className="text-sm text-chat-text-secondary">
              Powered by Google Gemini 2.5 Pro
            </p>
          </div>
          {conversation.length > 1 && (
            <Button
              onClick={handleClearConversation}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-chat-text-primary"
            >
              New Conversation
            </Button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-chat-background">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence>
            {renderMessages()}
            
            {/* Streaming response */}
            {streamingResponse && (
              <Message
                role="model"
                content={streamingResponse}
                timestamp={new Date()}
                isStreaming={true}
              />
            )}
            
            {/* Loading indicator */}
            {isLoading && !streamingResponse && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start p-4"
              >
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                    <Bot className="h-4 w-4 text-accent-foreground" />
                  </div>
                  <div className="bg-chat-surface border border-chat-border rounded-lg px-4 py-3">
                    <div className="flex gap-1">
                      <motion.div
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                        className="w-2 h-2 rounded-full bg-chat-text-secondary"
                      />
                      <motion.div
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                        className="w-2 h-2 rounded-full bg-chat-text-secondary"
                      />
                      <motion.div
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                        className="w-2 h-2 rounded-full bg-chat-text-secondary"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4"
            >
              <Alert variant="destructive" className="max-w-2xl">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>
                    {error.type === GeminiErrorType.API_KEY_MISSING 
                      ? 'API key is missing. Please configure VITE_GEMINI_API_KEY.'
                      : error.type === GeminiErrorType.RATE_LIMIT
                      ? 'Rate limit exceeded. Please try again in a moment.'
                      : error.type === GeminiErrorType.NETWORK_ERROR
                      ? 'Network error. Please check your connection.'
                      : error.message
                    }
                  </span>
                  {canRetry && (
                    <Button
                      onClick={retry}
                      variant="ghost"
                      size="sm"
                      className="ml-2 text-destructive hover:text-destructive-foreground hover:bg-destructive"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Retry
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Chat Input */}
      <div className="border-t border-chat-border bg-chat-surface">
        <div className="max-w-4xl mx-auto">
          <ChatInput
            onSendMessage={handleSendMessage}
            onAttachFile={onAttachFile}
            placeholder="Ask me anything about legal matters..."
            disabled={isLoading}
            variant="persistent"
          />
        </div>
      </div>
    </div>
  )
}

export default ChatConversation

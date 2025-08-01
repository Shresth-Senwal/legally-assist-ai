/**
 * React Hook for Google Gemini 2.5 Pro Integration
 * 
 * Provides React components with easy access to Gemini AI functionality
 * including conversation management, streaming responses, and error handling.
 * Optimized for legal assistant use cases with proper state management.
 * 
 * Features:
 * - Real-time streaming response handling
 * - Conversation history management
 * - Loading and error states
 * - Automatic retry logic with exponential backoff
 * - Input validation and sanitization
 * - TypeScript strict typing
 * - Memory-efficient conversation handling
 * - Legal-specific conversation context
 * 
 * Usage Examples:
 * ```typescript
 * // Simple single-turn conversation
 * const { sendMessage, response, isLoading, error } = useGemini()
 * 
 * // Multi-turn conversation with history
 * const { 
 *   conversation, 
 *   sendMessage, 
 *   streamingResponse, 
 *   isLoading 
 * } = useGemini({ 
 *   multiTurn: true,
 *   legalContext: true 
 * })
 * 
 * // With custom configuration
 * const { sendMessage } = useGemini({
 *   config: { temperature: 0.2, maxOutputTokens: 4096 }
 * })
 * ```
 * 
 * Security Considerations:
 * - All user input is validated before sending to API
 * - Sensitive data is never logged or exposed
 * - Error messages are sanitized for user display
 * - Rate limiting is handled automatically
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { 
  getGeminiService, 
  GeminiService, 
  GeminiError, 
  GeminiErrorType,
  ChatMessage, 
  GeminiConfig, 
  StreamingCallback 
} from '../lib/gemini'

/**
 * Configuration options for the useGemini hook
 */
export interface UseGeminiOptions {
  /** Enable multi-turn conversation with history */
  multiTurn?: boolean
  /** Initialize with legal-specific system prompt */
  legalContext?: boolean
  /** Custom system prompt (overrides legalContext) */
  systemPrompt?: string
  /** Custom configuration for Gemini model */
  config?: Partial<GeminiConfig>
  /** Maximum number of retry attempts on failure */
  maxRetries?: number
  /** Enable automatic retry with exponential backoff */
  autoRetry?: boolean
  /** Callback for handling streaming chunks */
  onStreamingChunk?: (chunk: string, isComplete: boolean) => void
  /** Callback for handling errors */
  onError?: (error: GeminiError) => void
  /** Maximum conversation history length (for memory management) */
  maxHistoryLength?: number
}

/**
 * State interface for the useGemini hook
 */
export interface UseGeminiState {
  /** Current conversation history (multi-turn mode only) */
  conversation: ChatMessage[]
  /** Latest complete response */
  response: string
  /** Current streaming response (incomplete) */
  streamingResponse: string
  /** Loading state */
  isLoading: boolean
  /** Error state */
  error: GeminiError | null
  /** Number of retry attempts made */
  retryCount: number
  /** Whether the service is ready to use */
  isReady: boolean
}

/**
 * Return type for the useGemini hook
 */
export interface UseGeminiReturn extends UseGeminiState {
  /** Send a message and get AI response */
  sendMessage: (message: string) => Promise<void>
  /** Clear conversation history and reset state */
  clearConversation: () => void
  /** Retry the last failed request */
  retry: () => Promise<void>
  /** Check if a retry is possible */
  canRetry: boolean
  /** Add a custom message to conversation history */
  addMessage: (message: ChatMessage) => void
  /** Get the underlying Gemini service instance */
  getService: () => GeminiService
}

/**
 * Default configuration for the hook
 */
const DEFAULT_OPTIONS: Required<UseGeminiOptions> = {
  multiTurn: false,
  legalContext: true,
  systemPrompt: '',
  config: {},
  maxRetries: 3,
  autoRetry: true,
  onStreamingChunk: () => {},
  onError: () => {},
  maxHistoryLength: 50
}

/**
 * Utility function to calculate retry delay with exponential backoff
 */
function getRetryDelay(retryCount: number): number {
  return Math.min(1000 * Math.pow(2, retryCount), 30000) // Max 30 seconds
}

/**
 * Utility function to truncate conversation history
 */
function truncateConversation(
  conversation: ChatMessage[], 
  maxLength: number
): ChatMessage[] {
  if (conversation.length <= maxLength) {
    return conversation
  }
  
  // Keep system message if present, and most recent messages
  const systemMessages = conversation.filter(msg => msg.role === 'system')
  const otherMessages = conversation.filter(msg => msg.role !== 'system')
  
  const messagesToKeep = maxLength - systemMessages.length
  const recentMessages = otherMessages.slice(-messagesToKeep)
  
  return [...systemMessages, ...recentMessages]
}

/**
 * React Hook for Google Gemini 2.5 Pro Integration
 * 
 * Provides comprehensive AI chat functionality with state management,
 * error handling, and optimized performance for legal use cases.
 */
export function useGemini(options: UseGeminiOptions = {}): UseGeminiReturn {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  
  // Service instance (singleton)
  const serviceRef = useRef<GeminiService | null>(null)
  
  // Initialize service on first use
  const getServiceInstance = useCallback((): GeminiService => {
    if (!serviceRef.current) {
      try {
        serviceRef.current = getGeminiService()
      } catch (error) {
        throw error
      }
    }
    return serviceRef.current
  }, [])

  // State management
  const [state, setState] = useState<UseGeminiState>(() => {
    let initialConversation: ChatMessage[] = []
    
    // Initialize conversation based on options
    if (opts.multiTurn) {
      try {
        const service = getServiceInstance()
        if (opts.systemPrompt) {
          initialConversation = service.createLegalConversation(opts.systemPrompt)
        } else if (opts.legalContext) {
          initialConversation = service.createLegalConversation()
        }
      } catch {
        // Service not ready, will initialize later
      }
    }

    return {
      conversation: initialConversation,
      response: '',
      streamingResponse: '',
      isLoading: false,
      error: null,
      retryCount: 0,
      isReady: false
    }
  })

  // Track last message for retry functionality
  const lastMessageRef = useRef<string>('')

  // Check service readiness on mount
  useEffect(() => {
    try {
      const service = getServiceInstance()
      setState(prev => ({ 
        ...prev, 
        isReady: service.isReady(),
        conversation: prev.conversation.length === 0 && opts.multiTurn 
          ? (opts.systemPrompt 
              ? service.createLegalConversation(opts.systemPrompt)
              : opts.legalContext 
                ? service.createLegalConversation()
                : []
            )
          : prev.conversation
      }))
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isReady: false,
        error: error as GeminiError 
      }))
    }
  }, [opts.multiTurn, opts.legalContext, opts.systemPrompt])

  /**
   * Streaming callback handler
   */
  const handleStreamingChunk = useCallback<StreamingCallback>((chunk, isComplete) => {
    if (isComplete) {
      setState(prev => ({
        ...prev,
        response: prev.streamingResponse,
        streamingResponse: '',
        isLoading: false
      }))
    } else {
      setState(prev => ({
        ...prev,
        streamingResponse: prev.streamingResponse + chunk
      }))
    }
    
    opts.onStreamingChunk?.(chunk, isComplete)
  }, [opts.onStreamingChunk])

  /**
   * Send a message to Gemini and handle the response
   */
  const sendMessage = useCallback(async (message: string): Promise<void> => {
    if (!message.trim()) {
      const error = new GeminiError(
        GeminiErrorType.INVALID_INPUT, 
        'Message cannot be empty'
      )
      setState(prev => ({ ...prev, error }))
      opts.onError?.(error)
      return
    }

    try {
      const service = getServiceInstance()
      lastMessageRef.current = message

      setState(prev => ({
        ...prev,
        isLoading: true,
        error: null,
        streamingResponse: '',
        retryCount: 0
      }))

      let response: string

      if (opts.multiTurn && state.conversation.length > 0) {
        // Multi-turn conversation
        const updatedConversation = service.addUserMessage(state.conversation, message)
        
        response = await service.generateConversationResponse(
          updatedConversation,
          opts.config,
          handleStreamingChunk
        )

        // Update conversation with both user message and AI response
        const finalConversation = service.addModelResponse(updatedConversation, response)
        const truncatedConversation = truncateConversation(finalConversation, opts.maxHistoryLength)

        setState(prev => ({
          ...prev,
          conversation: truncatedConversation,
          response,
          isLoading: false
        }))

      } else {
        // Single-turn conversation
        response = await service.generateResponse(
          message,
          opts.config,
          handleStreamingChunk
        )

        setState(prev => ({
          ...prev,
          response,
          isLoading: false
        }))
      }

    } catch (error) {
      const geminiError = error as GeminiError
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: geminiError,
        streamingResponse: ''
      }))

      opts.onError?.(geminiError)

      // Auto-retry logic
      if (opts.autoRetry && state.retryCount < opts.maxRetries) {
        const delay = getRetryDelay(state.retryCount)
        
        setTimeout(() => {
          setState(prev => ({ ...prev, retryCount: prev.retryCount + 1 }))
          sendMessage(message)
        }, delay)
      }
    }
  }, [
    state.conversation,
    state.retryCount,
    opts.multiTurn,
    opts.config,
    opts.autoRetry,
    opts.maxRetries,
    opts.maxHistoryLength,
    opts.onError,
    handleStreamingChunk
  ])

  /**
   * Clear conversation history and reset state
   */
  const clearConversation = useCallback(() => {
    let newConversation: ChatMessage[] = []
    
    if (opts.multiTurn) {
      try {
        const service = getServiceInstance()
        if (opts.systemPrompt) {
          newConversation = service.createLegalConversation(opts.systemPrompt)
        } else if (opts.legalContext) {
          newConversation = service.createLegalConversation()
        }
      } catch {
        // Service not ready
      }
    }

    setState(prev => ({
      ...prev,
      conversation: newConversation,
      response: '',
      streamingResponse: '',
      error: null,
      retryCount: 0
    }))

    lastMessageRef.current = ''
  }, [opts.multiTurn, opts.legalContext, opts.systemPrompt])

  /**
   * Retry the last failed request
   */
  const retry = useCallback(async () => {
    if (lastMessageRef.current && state.error) {
      await sendMessage(lastMessageRef.current)
    }
  }, [sendMessage, state.error])

  /**
   * Add a custom message to conversation history
   */
  const addMessage = useCallback((message: ChatMessage) => {
    if (!opts.multiTurn) {
      console.warn('addMessage is only available in multi-turn mode')
      return
    }

    setState(prev => ({
      ...prev,
      conversation: truncateConversation(
        [...prev.conversation, message],
        opts.maxHistoryLength
      )
    }))
  }, [opts.multiTurn, opts.maxHistoryLength])

  /**
   * Check if retry is possible
   */
  const canRetry = Boolean(
    state.error && 
    lastMessageRef.current && 
    state.retryCount < opts.maxRetries
  )

  return {
    ...state,
    sendMessage,
    clearConversation,
    retry,
    canRetry,
    addMessage,
    getService: getServiceInstance
  }
}

/**
 * Higher-order component for providing Gemini context
 * TODO: Implement if global state management is needed
 */

export default useGemini

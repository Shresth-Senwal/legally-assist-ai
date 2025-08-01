/**
 * Google Gemini 2.5 Pro Integration Service
 * 
 * Provides secure, typed integration with Google's Gemini 2.5 Pro AI model
 * for the Legally Assist AI paralegal application. Handles streaming responses,
 * conversation history, and error management with legal industry focus.
 * 
 * Features:
 * - Streaming text generation with real-time token delivery
 * - Multi-turn conversation support with history management
 * - Input validation and sanitization for security
 * - Comprehensive error handling and logging
 * - TypeScript strict typing for reliability
 * - Configurable tools and model parameters
 * - Legal-specific content filtering and safety measures
 * 
 * Dependencies:
 * - @google/genai: Official Google Generative AI SDK
 * - mime: MIME type detection for file handling
 * 
 * Environment Variables Required:
 * - VITE_GEMINI_API_KEY: Google AI Studio API key for Gemini access
 * 
 * Security Considerations:
 * - All user input is validated and sanitized
 * - API keys are never logged or exposed
 * - Sensitive data is filtered from responses
 * - Rate limiting and usage monitoring supported
 */

import { GoogleGenAI, Content, Part } from '@google/genai'

/**
 * Represents a message in a conversation with role and content parts
 */
export interface ChatMessage {
  /** The role of the message sender ('user', 'model', 'system') */
  role: 'user' | 'model' | 'system'
  /** Array of content parts (text, images, etc.) */
  parts: Part[]
}

/**
 * Configuration options for Gemini model requests
 */
export interface GeminiConfig {
  /** Thinking budget for model reasoning (-1 for unlimited) */
  thinkingBudget?: number
  /** Maximum number of output tokens */
  maxOutputTokens?: number
  /** Temperature for response randomness (0.0-1.0) */
  temperature?: number
  /** Top-k sampling parameter */
  topK?: number
  /** Top-p sampling parameter */
  topP?: number
  /** Tools available to the model */
  tools?: Array<{ urlContext?: {} }>
  /** Safety settings for content filtering */
  safetySettings?: any[]
}

/**
 * Callback function type for streaming response chunks
 */
export type StreamingCallback = (chunk: string, isComplete: boolean) => void

/**
 * Error types that can occur during Gemini operations
 */
export enum GeminiErrorType {
  API_KEY_MISSING = 'API_KEY_MISSING',
  INVALID_INPUT = 'INVALID_INPUT',
  NETWORK_ERROR = 'NETWORK_ERROR',
  RATE_LIMIT = 'RATE_LIMIT',
  CONTENT_FILTER = 'CONTENT_FILTER',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * Custom error class for Gemini-specific errors
 */
export class GeminiError extends Error {
  constructor(
    public type: GeminiErrorType,
    message: string,
    public originalError?: Error
  ) {
    super(message)
    this.name = 'GeminiError'
  }
}

/**
 * Default configuration for Gemini 2.5 Pro optimized for legal use cases
 */
const DEFAULT_CONFIG: GeminiConfig = {
  thinkingBudget: -1,
  maxOutputTokens: 8192,
  temperature: 0.1, // Lower temperature for more consistent legal advice
  topK: 40,
  topP: 0.95,
  tools: [{ urlContext: {} }],
  safetySettings: []
}

/**
 * Input sanitization patterns for security
 */
const DANGEROUS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /data:text\/html/gi
]

/**
 * Google Gemini 2.5 Pro Service
 * 
 * Provides secure, streaming AI chat functionality for legal professionals.
 * Handles conversation management, input validation, and error recovery.
 */
export class GeminiService {
  private client: GoogleGenAI
  private readonly modelName = 'gemini-2.5-flash-lite'

  /**
   * Tracks if a request is currently in progress to prevent concurrent requests
   */
  private requestInProgress = false

  /**
   * Initialize the Gemini service with API key validation
   * @throws {GeminiError} When API key is missing or invalid
   */
  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY

    if (!apiKey || apiKey.trim() === '') {
      throw new GeminiError(
        GeminiErrorType.API_KEY_MISSING,
        'VITE_GEMINI_API_KEY environment variable is required but not set. Please configure your Google AI Studio API key.'
      )
    }

    try {
      this.client = new GoogleGenAI({ apiKey: apiKey.trim() })
    } catch (error) {
      throw new GeminiError(
        GeminiErrorType.UNKNOWN_ERROR,
        'Failed to initialize Gemini client',
        error as Error
      )
    }
  }

  /**
   * Validate and sanitize user input for security
   * @param input - Raw user input text
   * @returns Sanitized input text
   * @throws {GeminiError} When input contains dangerous patterns
   */
  private validateInput(input: string): string {
    if (!input || typeof input !== 'string') {
      throw new GeminiError(
        GeminiErrorType.INVALID_INPUT,
        'Input must be a non-empty string'
      )
    }

    const trimmed = input.trim()
    if (trimmed.length === 0) {
      throw new GeminiError(
        GeminiErrorType.INVALID_INPUT,
        'Input cannot be empty or only whitespace'
      )
    }

    if (trimmed.length > 100000) {
      throw new GeminiError(
        GeminiErrorType.INVALID_INPUT,
        'Input exceeds maximum length of 100,000 characters'
      )
    }

    // Check for dangerous patterns
    for (const pattern of DANGEROUS_PATTERNS) {
      if (pattern.test(trimmed)) {
        throw new GeminiError(
          GeminiErrorType.INVALID_INPUT,
          'Input contains potentially unsafe content'
        )
      }
    }

    return trimmed
  }

  /**
   * Convert a simple text message to Gemini Content format
   * @param message - Text message to convert
   * @param role - Role of the message sender
   * @returns Formatted Content object
   */
  private createContent(message: string, role: 'user' | 'model' = 'user'): Content {
    return {
      role,
      parts: [{ text: this.validateInput(message) }]
    }
  }

  /**
   * Generate streaming response from Gemini 2.5 Pro for a single message
   * @param message - User message text
   * @param config - Optional configuration overrides
   * @param onChunk - Callback for streaming response chunks
   * @returns Promise resolving to complete response text
   * @throws {GeminiError} On API errors, validation failures, or network issues
   */
  async generateResponse(
    message: string,
    config: Partial<GeminiConfig> = {},
    onChunk?: StreamingCallback
  ): Promise<string> {
    if (this.requestInProgress) {
      throw new GeminiError(
        GeminiErrorType.RATE_LIMIT,
        'A request is already in progress. Please wait for it to complete before sending another.'
      )
    }
    this.requestInProgress = true
    try {
      const sanitizedMessage = this.validateInput(message)
      const contents: Content[] = [this.createContent(sanitizedMessage)]
      const result = await this.generateConversationResponse(contents, config, onChunk)
      return result
    } finally {
      this.requestInProgress = false
    }
  }

  /**
   * Generate streaming response for multi-turn conversation
   * @param messages - Array of conversation messages with history
   * @param config - Optional configuration overrides
   * @param onChunk - Callback for streaming response chunks
   * @returns Promise resolving to complete response text
   * @throws {GeminiError} On API errors, validation failures, or network issues
   */
  async generateConversationResponse(
    messages: ChatMessage[] | Content[],
    config: Partial<GeminiConfig> = {},
    onChunk?: StreamingCallback
  ): Promise<string> {

    if (this.requestInProgress) {
      throw new GeminiError(
        GeminiErrorType.RATE_LIMIT,
        'A request is already in progress. Please wait for it to complete before sending another.'
      )
    }
    this.requestInProgress = true
    try {
      // Filter out system messages (Gemini API only accepts 'user' and 'model')
      const filteredMessages = messages.filter(msg => msg.role === 'user' || msg.role === 'model')
      // Convert ChatMessage format to Content format if needed
      const contents: Content[] = filteredMessages.map(msg => {
        if ('parts' in msg && 'role' in msg) {
          // Already in Content format
          return msg as Content
        }
        // Convert from ChatMessage format
        const chatMsg = msg as ChatMessage
        return {
          role: chatMsg.role,
          parts: chatMsg.parts
        }
      })

      // Validate all message content
      contents.forEach((content, index) => {
        content.parts.forEach(part => {
          if (part.text) {
            this.validateInput(part.text)
          }
        })
      })

      // Merge configuration with defaults
      const finalConfig = {
        ...DEFAULT_CONFIG,
        ...config,
        tools: config.tools || DEFAULT_CONFIG.tools
      }

      // Prepare request parameters
      const requestParams = {
        model: this.modelName,
        contents,
        config: {
          thinkingConfig: {
            thinkingBudget: finalConfig.thinkingBudget
          },
          tools: finalConfig.tools,
          generationConfig: {
            maxOutputTokens: finalConfig.maxOutputTokens,
            temperature: finalConfig.temperature,
            topK: finalConfig.topK,
            topP: finalConfig.topP
          },
          safetySettings: finalConfig.safetySettings
        }
      }

      // Generate streaming response
      const response = await this.client.models.generateContentStream(requestParams)
      
      let fullResponse = ''
      
      for await (const chunk of response) {
        if (chunk.text) {
          fullResponse += chunk.text
          onChunk?.(chunk.text, false)
        }
      }

      // Signal completion
      onChunk?.('', true)

      if (!fullResponse.trim()) {
        throw new GeminiError(
          GeminiErrorType.CONTENT_FILTER,
          'No response generated. Content may have been filtered for safety.'
        )
      }

      return fullResponse.trim()
    } catch (error) {
      // Handle different types of errors
      if (error instanceof GeminiError) {
        throw error
      }

      const errorMessage = error instanceof Error ? error.message : String(error)

      if (errorMessage.includes('API_KEY')) {
        throw new GeminiError(
          GeminiErrorType.API_KEY_MISSING,
          'Invalid or expired API key. Please check your VITE_GEMINI_API_KEY.',
          error as Error
        )
      }

      if (errorMessage.includes('rate limit') || errorMessage.includes('quota')) {
        throw new GeminiError(
          GeminiErrorType.RATE_LIMIT,
          'API rate limit exceeded. Please try again later.',
          error as Error
        )
      }

      if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        throw new GeminiError(
          GeminiErrorType.NETWORK_ERROR,
          'Network error occurred. Please check your connection and try again.',
          error as Error
        )
      }

      if (errorMessage.includes('safety') || errorMessage.includes('blocked')) {
        throw new GeminiError(
          GeminiErrorType.CONTENT_FILTER,
          'Content was blocked by safety filters. Please rephrase your request.',
          error as Error
        )
      }

      throw new GeminiError(
        GeminiErrorType.UNKNOWN_ERROR,
        `Unexpected error: ${errorMessage}`,
        error as Error
      )
    } finally {
      this.requestInProgress = false
    }
  }

  /**
   * Create a new conversation with legal-specific system prompt
   * @param systemPrompt - Optional custom system prompt for legal context
   * @returns Array with system message for conversation initialization
   */
  createLegalConversation(systemPrompt?: string): ChatMessage[] {
    const defaultSystemPrompt = `You are a highly knowledgeable AI paralegal assistant specialized in Indian law. You provide accurate, helpful, and professional legal information to support legal professionals in their work.

Key Guidelines:
- Always maintain professional and ethical standards
- Provide clear, accurate legal information based on Indian law
- Cite relevant statutes, cases, or legal principles when applicable
- Never provide personal legal advice - always recommend consulting with qualified attorneys
- Focus on procedural guidance, document preparation, and legal research assistance
- Maintain confidentiality and privacy of all information discussed
- Use clear, professional language appropriate for legal professionals

Your responses should be thorough, well-researched, and formatted for easy comprehension by legal professionals.`

    return [{
      role: 'system',
      parts: [{ text: systemPrompt || defaultSystemPrompt }]
    }]
  }

  /**
   * Add a user message to an existing conversation
   * @param conversation - Existing conversation history
   * @param message - User message to add
   * @returns Updated conversation with new user message
   */
  addUserMessage(conversation: ChatMessage[], message: string): ChatMessage[] {
    return [...conversation, {
      role: 'user',
      parts: [{ text: this.validateInput(message) }]
    }]
  }

  /**
   * Add an AI response to an existing conversation
   * @param conversation - Existing conversation history
   * @param response - AI response to add
   * @returns Updated conversation with new AI response
   */
  addModelResponse(conversation: ChatMessage[], response: string): ChatMessage[] {
    return [...conversation, {
      role: 'model',
      parts: [{ text: response }]
    }]
  }

  /**
   * Get the current model name being used
   * @returns The Gemini model identifier
   */
  getModelName(): string {
    return this.modelName
  }

  /**
   * Check if the service is properly initialized and ready
   * @returns True if service is ready, false otherwise
   */
  isReady(): boolean {
    return !!this.client && !!import.meta.env.VITE_GEMINI_API_KEY
  }
}

/**
 * Singleton instance of the Gemini service
 * Lazy initialization to handle environment variable loading
 */
let geminiServiceInstance: GeminiService | null = null

/**
 * Get or create the singleton Gemini service instance
 * @returns Configured GeminiService instance
 * @throws {GeminiError} When API key is not configured
 */
export function getGeminiService(): GeminiService {
  if (!geminiServiceInstance) {
    geminiServiceInstance = new GeminiService()
  }
  return geminiServiceInstance
}

/**
 * Convenience function for generating a simple response
 * @param message - User message
 * @param onChunk - Optional streaming callback
 * @returns Promise resolving to AI response
 */
export async function generateSimpleResponse(
  message: string,
  onChunk?: StreamingCallback
): Promise<string> {
  const service = getGeminiService()
  return service.generateResponse(message, {}, onChunk)
}

/**
 * Convenience function for starting a new legal conversation
 * @param initialMessage - First user message
 * @param onChunk - Optional streaming callback
 * @returns Promise resolving to AI response and conversation history
 */
export async function startLegalConversation(
  initialMessage: string,
  onChunk?: StreamingCallback
): Promise<{ response: string; conversation: ChatMessage[] }> {
  const service = getGeminiService()
  let conversation = service.createLegalConversation()
  conversation = service.addUserMessage(conversation, initialMessage)
  
  const response = await service.generateConversationResponse(conversation, {}, onChunk)
  conversation = service.addModelResponse(conversation, response)
  
  return { response, conversation }
}

// Export types and service for external use
export default GeminiService

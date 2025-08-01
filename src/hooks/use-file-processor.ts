/**
 * React Hook for File Processing with OCR and AI Analysis
 * 
 * Provides a convenient React interface for processing uploaded files
 * with OCR extraction and AI-powered legal document analysis.
 * 
 * Features:
 * - Progress tracking for file processing operations
 * - Error handling and user feedback
 * - Support for multiple analysis types
 * - Integration with toast notifications
 * - Accessible status updates
 * 
 * Usage:
 * ```tsx
 * const { processFile, isProcessing, progress, result, error } = useFileProcessor()
 * 
 * const handleFileUpload = async (file: File) => {
 *   await processFile(file, AnalysisType.SUMMARIZE)
 * }
 * ```
 */

import { useState, useCallback } from 'react'
import { 
  getFileProcessor, 
  ProcessingResult, 
  ProcessingStatus, 
  AnalysisType,
  ProcessingProgressCallback
} from '@/lib/file-processor'
import { toast } from '@/lib/toast-service'

/**
 * Processing state for the hook
 */
interface ProcessingState {
  isProcessing: boolean
  status: ProcessingStatus
  progress: number
  message: string
  result: ProcessingResult | null
  error: string | null
}

/**
 * Initial state for processing
 */
const INITIAL_STATE: ProcessingState = {
  isProcessing: false,
  status: ProcessingStatus.PENDING,
  progress: 0,
  message: '',
  result: null,
  error: null
}

/**
 * Hook return type
 */
interface UseFileProcessorReturn {
  /** Current processing state */
  isProcessing: boolean
  /** Processing progress (0-100) */
  progress: number
  /** Current status */
  status: ProcessingStatus
  /** Status message */
  message: string
  /** Processing result */
  result: ProcessingResult | null
  /** Error message if processing failed */
  error: string | null
  /** Process a file with OCR and AI analysis */
  processFile: (file: File, analysisType?: AnalysisType, customPrompt?: string) => Promise<void>
  /** Extract text only from file (no AI analysis) */
  extractTextOnly: (file: File) => Promise<void>
  /** Clear current result and reset state */
  reset: () => void
}

/**
 * React hook for file processing with OCR and AI analysis
 */
export function useFileProcessor(): UseFileProcessorReturn {
  const [state, setState] = useState<ProcessingState>(INITIAL_STATE)

  /**
   * Update processing state
   */
  const updateState = useCallback((updates: Partial<ProcessingState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  /**
   * Progress callback for file processing
   */
  const onProgress: ProcessingProgressCallback = useCallback((status, progress, message) => {
    updateState({
      status,
      progress,
      message,
      isProcessing: status !== ProcessingStatus.COMPLETED && status !== ProcessingStatus.ERROR
    })
  }, [updateState])

  /**
   * Process a file with OCR and AI analysis
   */
  const processFile = useCallback(async (
    file: File, 
    analysisType: AnalysisType = AnalysisType.SUMMARIZE,
    customPrompt?: string
  ) => {
    try {
      // Reset state
      updateState({
        ...INITIAL_STATE,
        isProcessing: true,
        status: ProcessingStatus.PENDING
      })

      // Show initial toast
      toast.info('Processing File', `Starting OCR and analysis for ${file.name}`)

      const processor = getFileProcessor()
      const result = await processor.processFile(
        file,
        { analysisType, customPrompt },
        onProgress
      )

      if (result.success) {
        updateState({
          isProcessing: false,
          status: ProcessingStatus.COMPLETED,
          progress: 100,
          message: 'Processing completed successfully',
          result,
          error: null
        })

        toast.success(
          'File Processed Successfully',
          `OCR and analysis completed for ${file.name}`
        )
      } else {
        updateState({
          isProcessing: false,
          status: ProcessingStatus.ERROR,
          progress: 0,
          message: result.error || 'Processing failed',
          result,
          error: result.error || 'Unknown error'
        })

        toast.error(
          'Processing Failed',
          result.error || 'Failed to process file'
        )
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      
      updateState({
        isProcessing: false,
        status: ProcessingStatus.ERROR,
        progress: 0,
        message: errorMessage,
        result: null,
        error: errorMessage
      })

      toast.error('Processing Error', errorMessage)
    }
  }, [updateState, onProgress])

  /**
   * Extract text only from file (no AI analysis)
   */
  const extractTextOnly = useCallback(async (file: File) => {
    try {
      // Reset state
      updateState({
        ...INITIAL_STATE,
        isProcessing: true,
        status: ProcessingStatus.PENDING
      })

      // Show initial toast
      toast.info('Extracting Text', `Extracting text content from ${file.name}`)

      const processor = getFileProcessor()
      const result = await processor.processFile(
        file,
        { analysisType: AnalysisType.SUMMARIZE, extractOnly: true },
        onProgress
      )

      if (result.success) {
        updateState({
          isProcessing: false,
          status: ProcessingStatus.COMPLETED,
          progress: 100,
          message: 'Text extraction completed successfully',
          result,
          error: null
        })

        toast.success(
          'Text Extracted Successfully',
          `Text content extracted from ${file.name}`
        )
      } else {
        updateState({
          isProcessing: false,
          status: ProcessingStatus.ERROR,
          progress: 0,
          message: result.error || 'Text extraction failed',
          result,
          error: result.error || 'Unknown error'
        })

        toast.error(
          'Text Extraction Failed',
          result.error || 'Failed to extract text from file'
        )
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      
      updateState({
        isProcessing: false,
        status: ProcessingStatus.ERROR,
        progress: 0,
        message: errorMessage,
        result: null,
        error: errorMessage
      })

      toast.error('Extraction Error', errorMessage)
    }
  }, [updateState, onProgress])

  /**
   * Clear current result and reset state
   */
  const reset = useCallback(() => {
    setState(INITIAL_STATE)
  }, [])

  return {
    isProcessing: state.isProcessing,
    progress: state.progress,
    status: state.status,
    message: state.message,
    result: state.result,
    error: state.error,
    processFile,
    extractTextOnly,
    reset
  }
}

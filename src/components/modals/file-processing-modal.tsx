/**
 * File Processing Modal Component
 * 
 * Modal dialog for uploading files and displaying OCR/AI analysis results.
 * Provides a comprehensive interface for legal document processing with
 * progress tracking, error handling, and accessibility features.
 * 
 * Features:
 * - File upload with drag and drop support
 * - Analysis type selection
 * - Real-time progress tracking
 * - OCR text display with copy functionality
 * - AI analysis results with export options
 * - Comprehensive error handling
 * - Full accessibility support
 * 
 * Usage:
 * ```tsx
 * <FileProcessingModal
 *   isOpen={showFileProcessor}
 *   onClose={() => setShowFileProcessor(false)}
 *   onResult={(result) => handleProcessingResult(result)}
 * />
 * ```
 */

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { X, Upload, FileText, Brain, Copy, Download, AlertCircle, CheckCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { useFileProcessor } from '@/hooks/use-file-processor'
import { AnalysisType, ProcessingResult, ProcessingStatus } from '@/lib/file-processor'
import { openFilePicker } from '@/lib/file-upload'
import { toast } from '@/lib/toast-service'

/**
 * Props for the FileProcessingModal component
 */
interface FileProcessingModalProps {
  /** Whether the modal is open */
  isOpen: boolean
  /** Callback when modal is closed */
  onClose: () => void
  /** Callback when processing is completed with results */
  onResult?: (result: ProcessingResult) => void
  /** Default analysis type */
  defaultAnalysisType?: AnalysisType
  /** Whether to show analysis type selector */
  showAnalysisSelector?: boolean
}

/**
 * Analysis type options for the selector
 */
const ANALYSIS_OPTIONS = [
  { value: AnalysisType.SUMMARIZE, label: 'Document Summary', description: 'Generate a comprehensive summary' },
  { value: AnalysisType.EXTRACT_CLAUSES, label: 'Extract Clauses', description: 'Identify important contract terms' },
  { value: AnalysisType.COMPLIANCE_CHECK, label: 'Compliance Check', description: 'Review for regulatory compliance' },
  { value: AnalysisType.REVIEW, label: 'Legal Review', description: 'Thorough legal document review' },
  { value: AnalysisType.EXTRACT_ENTITIES, label: 'Extract Entities', description: 'Find names, dates, amounts' },
  { value: AnalysisType.RISK_ASSESSMENT, label: 'Risk Assessment', description: 'Identify potential legal risks' }
] as const

/**
 * Status messages for different processing stages
 */
const STATUS_MESSAGES = {
  [ProcessingStatus.PENDING]: 'Ready to process file',
  [ProcessingStatus.UPLOADING]: 'Uploading and validating file...',
  [ProcessingStatus.EXTRACTING]: 'Extracting text content...',
  [ProcessingStatus.ANALYZING]: 'Performing AI analysis...',
  [ProcessingStatus.COMPLETED]: 'Processing completed successfully',
  [ProcessingStatus.ERROR]: 'An error occurred during processing'
} as const

/**
 * File Processing Modal Component
 */
export function FileProcessingModal({
  isOpen,
  onClose,
  onResult,
  defaultAnalysisType = AnalysisType.SUMMARIZE,
  showAnalysisSelector = true
}: FileProcessingModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [analysisType, setAnalysisType] = useState<AnalysisType>(defaultAnalysisType)
  const [customPrompt, setCustomPrompt] = useState('')
  const [showCustomPrompt, setShowCustomPrompt] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    isProcessing,
    progress,
    status,
    message,
    result,
    error,
    processFile,
    extractTextOnly,
    reset
  } = useFileProcessor()

  /**
   * Handle file selection
   */
  const handleFileSelect = useCallback(async () => {
    try {
      const results = await openFilePicker({
        multiple: false,
        maxSizeBytes: 10 * 1024 * 1024, // 10MB
        allowedTypes: [
          'image/png',
          'image/jpeg', 
          'image/jpg',
          'image/gif',
          'image/webp',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain'
        ]
      })

      if (results.length > 0 && results[0].success && results[0].file) {
        setSelectedFile(results[0].file)
        reset() // Clear any previous results
      }
    } catch (error) {
      toast.error('File Selection Failed', 'Unable to select file. Please try again.')
    }
  }, [reset])

  /**
   * Handle file processing
   */
  const handleProcess = useCallback(async () => {
    if (!selectedFile) return

    const prompt = showCustomPrompt && customPrompt.trim() 
      ? customPrompt.trim() 
      : undefined

    await processFile(selectedFile, analysisType, prompt)
  }, [selectedFile, analysisType, customPrompt, showCustomPrompt, processFile])

  /**
   * Handle text-only extraction
   */
  const handleExtractText = useCallback(async () => {
    if (!selectedFile) return
    await extractTextOnly(selectedFile)
  }, [selectedFile, extractTextOnly])

  /**
   * Handle copying text to clipboard
   */
  const handleCopyText = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Copied to Clipboard', 'Text has been copied to your clipboard.')
    } catch (error) {
      toast.error('Copy Failed', 'Unable to copy text to clipboard.')
    }
  }, [])

  // Automatically insert result into chat as soon as processing is complete
  useEffect(() => {
    if (result && result.success && onResult) {
      onResult(result)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result])

  /**
   * Handle modal close
   */
  const handleClose = useCallback(() => {
    reset()
    setSelectedFile(null)
    setCustomPrompt('')
    setShowCustomPrompt(false)
    onClose()
  }, [reset, onClose])

  /**
   * Format file size for display
   */
  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }, [])

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Document Processing with OCR & AI Analysis
          </DialogTitle>
          <DialogDescription>
            Upload legal documents for OCR text extraction and AI-powered analysis.
            Supports images, PDFs, and text documents.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* File Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">File Selection</h3>
            
            {!selectedFile ? (
              <div 
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer"
                onClick={handleFileSelect}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleFileSelect()
                  }
                }}
                aria-label="Click to select file for processing"
              >
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">Select File to Process</p>
                <p className="text-sm text-muted-foreground">
                  Click to choose images, PDFs, or documents for OCR and analysis
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Supported: PNG, JPG, PDF, DOCX, TXT (max 10MB)
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedFile.type} • {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleFileSelect}
                  disabled={isProcessing}
                >
                  Change File
                </Button>
              </div>
            )}
          </div>

          {/* Analysis Options */}
          {selectedFile && showAnalysisSelector && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Analysis Options</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-2 block">Analysis Type</label>
                  <Select 
                    value={analysisType} 
                    onValueChange={(value) => setAnalysisType(value as AnalysisType)}
                    disabled={isProcessing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ANALYSIS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs text-muted-foreground">{option.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCustomPrompt(!showCustomPrompt)}
                    disabled={isProcessing}
                  >
                    {showCustomPrompt ? 'Hide' : 'Show'} Custom Prompt
                  </Button>
                </div>

                {showCustomPrompt && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Custom Analysis Prompt</label>
                    <Textarea
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="Enter custom instructions for AI analysis..."
                      rows={3}
                      disabled={isProcessing}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Processing Controls */}
          {selectedFile && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Processing</h3>
              
              <div className="flex gap-3">
                <Button 
                  onClick={handleProcess}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  {isProcessing ? 'Processing...' : 'OCR + AI Analysis'}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={handleExtractText}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Extract Text Only
                </Button>
              </div>

              {/* Progress Display */}
              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {STATUS_MESSAGES[status] || message}
                    </span>
                    <span className="text-sm text-muted-foreground">{progress}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-destructive" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}
            </div>
          )}

          {/* Results Display */}
          {result && result.success && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Processing Results
                </h3>
                {/* Analysis result is now automatically inserted into chat. No button needed. */}
              </div>

              {/* Metadata */}
              {result.metadata && (
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    {result.metadata.extractionMethod.toUpperCase()}
                  </Badge>
                  <Badge variant="secondary">
                    {result.metadata.processingTime}ms
                  </Badge>
                  <Badge variant="secondary">
                    {formatFileSize(result.metadata.fileSize)}
                  </Badge>
                </div>
              )}

              {/* Extracted Text */}
              {result.extractedText && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Extracted Text</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyText(result.extractedText!)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <ScrollArea className="h-48 border rounded-lg p-3">
                    <p className="text-sm whitespace-pre-wrap">{result.extractedText}</p>
                  </ScrollArea>
                </div>
              )}

              <Separator />

              {/* AI Analysis */}
              {result.analysis && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">AI Analysis</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyText(result.analysis!)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <ScrollArea className="h-64 border rounded-lg p-3">
                    <div className="text-sm whitespace-pre-wrap">{result.analysis}</div>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

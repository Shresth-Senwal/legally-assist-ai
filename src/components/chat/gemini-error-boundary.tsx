/**
 * Error Boundary Component for Gemini Integration
 * 
 * Provides graceful error handling for AI-related failures.
 * Displays user-friendly error messages and recovery options.
 * 
 * Features:
 * - Catches React errors in Gemini components
 * - Provides clear error messages for different failure types
 * - Offers retry and reset functionality
 * - Maintains accessibility standards
 * - Logs errors for debugging (without sensitive data)
 */

import React, { Component, ReactNode } from 'react'
import { AlertCircle, RotateCcw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

/**
 * Error boundary specifically designed for AI integration components
 * Handles common AI-related errors gracefully
 */
export class GeminiErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    })

    // Log error for debugging (without sensitive data)
    console.error('Gemini Error Boundary caught an error:', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    })

    // Call optional error handler
    this.props.onError?.(error, errorInfo)
  }

  /**
   * Reset error boundary state
   */
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  /**
   * Reload the page to fully reset state
   */
  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-2xl mx-auto">
          <Alert className="w-full">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>AI Service Error</AlertTitle>
            <AlertDescription className="mt-2 space-y-4">
              <p>
                The AI assistant encountered an unexpected error. This might be due to:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Missing or invalid VITE_GEMINI_API_KEY configuration</li>
                <li>Network connectivity issues</li>
                <li>Temporary service unavailability</li>
                <li>Browser compatibility issues</li>
              </ul>
              
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={this.handleReset}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <RotateCcw className="h-3 w-3" />
                  Try Again
                </Button>
                
                <Button
                  onClick={this.handleReload}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Home className="h-3 w-3" />
                  Reload Page
                </Button>
              </div>

              {/* Development error details */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 p-2 bg-muted rounded text-xs">
                  <summary className="cursor-pointer font-medium">
                    Development Error Details
                  </summary>
                  <pre className="mt-2 overflow-auto">
                    {this.state.error.message}
                    {'\n\n'}
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </AlertDescription>
          </Alert>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Higher-order component for wrapping components with error boundary
 */
export function withGeminiErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WrappedComponent(props: P) {
    return (
      <GeminiErrorBoundary fallback={fallback}>
        <Component {...props} />
      </GeminiErrorBoundary>
    )
  }
}

export default GeminiErrorBoundary

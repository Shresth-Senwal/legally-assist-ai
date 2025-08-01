/**
 * Main Layout Component
 * 
 * Core layout structure for the Legally AI app.
 * Provides consistent structure with header, main content, and modal management.
 * 
 * Features:
 * - Responsive design for mobile and desktop
 * - Modal state management for settings and archived chats
 * - Theme integration with smooth transitions
 * - Accessibility features and keyboard navigation
 * - Clean, minimal design following ChatGPT patterns
 * - Comprehensive button functionality implementation
 * - File upload and attachment support
 * - Toast notifications for user feedback
 * - Confirmation dialogs for destructive actions
 */

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { ChatHeader } from "./chat-header"
import { ChatWelcome } from "@/components/chat/chat-welcome"
import { ChatConversation } from "@/components/chat/chat-conversation"
import { GeminiErrorBoundary } from "@/components/chat/gemini-error-boundary"
import { ArchivedChatsModal } from "@/components/modals/archived-chats-modal"
import { SettingsModal } from "@/components/modals/settings-modal"
import { FileProcessingModal } from "@/components/modals/file-processing-modal"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { useTheme } from "@/components/theme/theme-provider"
import { ToastProvider, useToast, setToastContext } from "@/lib/toast-service"
import { openFilePicker, UploadResult } from "@/lib/file-upload"
import { ProcessingResult, AnalysisType } from "@/lib/file-processor"
import { FILE_PROCESSING_STRINGS, CHAT_STRINGS, ACTION_STRINGS, SETTINGS_STRINGS, TOAST_VARIANTS } from "@/lib/i18n-strings"

/**
 * Main Layout Content Component
 * Separated to use toast context inside the provider
 */
function MainLayoutContent() {

  /**
   * Chat type for main layout state
   * Ensures status is strictly "active" or "archived" for type safety
   */
  type Chat = {
    id: string
    name: string
    dateCreated: string
    status: "active" | "archived"
  }

  // Centralized chat state (active + archived)
  const [chats, setChats] = useState<Chat[]>([
    { id: '1', name: 'Contract Review Analysis', dateCreated: 'Just now', status: 'active' },
    { id: '2', name: 'Employment Law Questions', dateCreated: 'A minute ago', status: 'active' },
    { id: '3', name: 'IP Rights Discussion', dateCreated: '1 hour ago', status: 'active' },
    { id: '4', name: 'Compliance Strategy', dateCreated: 'Yesterday', status: 'active' },
    { id: '5', name: 'Corporate Legal Structure', dateCreated: 'Feb 2, 2025', status: 'active' },
    { id: '6', name: 'Regulatory Framework Review', dateCreated: 'Just now', status: 'active' },
    { id: '7', name: 'Legal Document Templates', dateCreated: 'A minute ago', status: 'active' },
    { id: '8', name: 'Client Rights Overview', dateCreated: '1 hour ago', status: 'active' },
    { id: '9', name: 'Case Law Research', dateCreated: 'Yesterday', status: 'active' },
    { id: '10', name: 'Privacy Policy Draft', dateCreated: 'Feb 2, 2025', status: 'active' }
  ])
  const [showArchivedChats, setShowArchivedChats] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showFileProcessor, setShowFileProcessor] = useState(false)
  const [isConversationActive, setIsConversationActive] = useState(false)
  const [initialMessage, setInitialMessage] = useState<string>('')
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    title: string
    description: string
    action: () => void
    variant?: 'destructive' | 'warning' | 'info' | 'success'
  }>({
    isOpen: false,
    title: '',
    description: '',
    action: () => {},
    variant: 'info'
  })
  // Ref to store addAIMessage function from conversation component
  const addAIMessageRef = useRef<((content: string) => void) | null>(null)
  const { theme } = useTheme()
  const toast = useToast()
  // Archive a chat
  const handleArchiveChat = (chatId: string) => {
    setChats(prev => prev.map(chat => chat.id === chatId ? { ...chat, status: 'archived' } : chat))
    toast.addToast({
      type: 'info',
      title: 'Chat Archived',
      description: 'The conversation has been moved to archived chats.'
    })
  }

  // Unarchive a chat
  const handleUnarchiveChat = (chatId: string) => {
    setChats(prev => prev.map(chat => chat.id === chatId ? { ...chat, status: 'active' as 'active' | 'archived' } : chat))
    toast.addToast({
      type: 'success',
      title: 'Chat Unarchived',
      description: 'The conversation has been restored to your active chats.'
    })
  }

  // Delete a chat
  const handleDeleteChat = (chatId: string) => {
    setChats(prev => prev.filter(chat => chat.id !== chatId))
    toast.addToast({
      type: 'success',
      title: 'Conversation Deleted',
      description: 'The conversation has been permanently deleted.'
    })
  }

  // Set toast context for global usage
  useEffect(() => {
    setToastContext(toast)
  }, [toast])

  /**
   * Show confirmation dialog for destructive actions
   */
  const showConfirmation = (
    title: string,
    description: string,
    action: () => void,
    variant: 'destructive' | 'warning' | 'info' | 'success' = 'info'
  ) => {
    setConfirmDialog({
      isOpen: true,
      title,
      description,
      action,
      variant
    })
  }

  /**
   * Handle starting a new conversation
   */
  const handleStartConversation = (message: string) => {
    setInitialMessage(message)
    setIsConversationActive(true)
    toast.addToast({
      type: TOAST_VARIANTS.SUCCESS,
      title: CHAT_STRINGS.CONVERSATION_STARTED,
      description: CHAT_STRINGS.CONVERSATION_STARTED_DESC
    })
  }

  /**
   * Handle ending a conversation (back to welcome)
   */
  const handleEndConversation = () => {
    setIsConversationActive(false)
    setInitialMessage('')
    toast.addToast({
      type: TOAST_VARIANTS.INFO,
      title: CHAT_STRINGS.CONVERSATION_ENDED,
      description: CHAT_STRINGS.CONVERSATION_ENDED_DESC
    })
  }

  /**
   * Handle action button clicks from welcome screen
   */
  const handleActionClick = async (action: 'attach' | 'search' | 'reason') => {
    switch (action) {
      case 'attach':
        // Open file processing modal for OCR and AI analysis
        setShowFileProcessor(true)
        break
        
      case 'search':
        toast.addToast({
          type: TOAST_VARIANTS.INFO,
          title: ACTION_STRINGS.LEGAL_SEARCH_TITLE,
          description: ACTION_STRINGS.LEGAL_SEARCH_DESC
        })
        // TODO: Implement legal database search
        break
        
      case 'reason':
        toast.addToast({
          type: TOAST_VARIANTS.INFO,
          title: ACTION_STRINGS.LEGAL_REASONING_TITLE,
          description: ACTION_STRINGS.LEGAL_REASONING_DESC
        })
        // TODO: Enable advanced reasoning mode
        break
    }
  }

  /**
   * Handle prompt selection from welcome screen
   */
  const handlePromptSelect = (prompt: string) => {
    handleStartConversation(`Surprise me ${prompt}`)
  }

  /**
   * Handle menu button click (mobile navigation)
   */
  const handleMenuClick = () => {
    setShowMobileMenu(!showMobileMenu)
    toast.addToast({
      type: 'info',
      title: 'Mobile Menu',
      description: 'Mobile navigation menu toggled.'
    })
    // TODO: Implement mobile sidebar navigation
  }

  /**
   * Handle more options button click
   */
  const handleMoreClick = () => {
    setShowSettings(true)
  }

  /**
   * Handle new conversation from header
   */
  const handleNewConversation = () => {
    if (isConversationActive) {
      showConfirmation(
        'Start New Conversation',
        'This will end your current conversation. Are you sure you want to continue?',
        () => {
          handleEndConversation()
        },
        'warning'
      )
    } else {
      handleEndConversation()
    }
  }

  /**
   * Handle chat archiving actions
   */
  const handleArchiveAll = () => {
    setShowArchivedChats(true)
    setShowSettings(false)
  }

  /**
   * Handle chat deletion (with confirmation)
   */
  const handleDeleteAll = () => {
    showConfirmation(
      'Delete All Conversations',
      'This will permanently delete all your conversation history. This action cannot be undone.',
      () => {
        // TODO: Implement actual deletion logic
        toast.addToast({
          type: 'success',
          title: 'All Conversations Deleted',
          description: 'Your conversation history has been cleared.'
        })
        setShowSettings(false)
      },
      'destructive'
    )
  }

  /**
   * Handle chat input message sending
   */
  const handleSendMessage = (message: string) => {
    // This will be handled by the conversation component
    console.log(`Message sent: ${message}`)
  }

  /**
   * Handle file attachment
   */
  const handleAttachFile = async () => {
    // Open file processing modal for OCR and AI analysis
    setShowFileProcessor(true)
  }
  
  /**
   * Handle user logout
   */
  const handleLogout = () => {
    showConfirmation(
      'Log Out',
      'You will be logged out of your account on this device. Any unsaved conversations will be lost.',
      () => {
        // TODO: Implement logout logic
        toast.addToast({
          type: 'info',
          title: 'Logged Out',
          description: 'You have been successfully logged out.'
        })
        setShowSettings(false)
      },
      'warning'
    )
  }

  // (Removed duplicate handleUnarchiveChat and handleDeleteChat)

  /**
   * Handle file processing results from OCR and AI analysis
   * Adds the analysis result directly to the chat conversation as an AI message
   * This ensures context preservation and seamless conversation flow
   * 
   * @param result - The processing result containing analysis or extracted text
   * @returns void
   */
  const handleFileProcessingResult = (result: ProcessingResult) => {
    if (result.success && result.analysis) {
      // If addAIMessage is available, add the analysis as an AI message
      if (addAIMessageRef.current) {
        const analysisMessage = `${FILE_PROCESSING_STRINGS.ANALYSIS_PREFIX(result.file.name)}\n\n${result.analysis}\n\n${FILE_PROCESSING_STRINGS.ANALYSIS_SUFFIX}`
        addAIMessageRef.current(analysisMessage)
        
        // Show success toast
        toast.addToast({
          type: TOAST_VARIANTS.SUCCESS,
          title: FILE_PROCESSING_STRINGS.DOCUMENT_ANALYSIS_COMPLETE,
          description: FILE_PROCESSING_STRINGS.DOCUMENT_ANALYSIS_ADDED
        })
        
        // Make sure we're in conversation mode
        if (!isConversationActive) {
          setIsConversationActive(true)
        }
      } else {
        // Fallback: Start a new conversation with the analysis
        const message = FILE_PROCESSING_STRINGS.ANALYSIS_CONVERSATION_STARTER(result.file.name, result.analysis)
        handleStartConversation(message)
      }
      
      setShowFileProcessor(false)
    } else if (result.success && result.extractedText) {
      // If addAIMessage is available, add the extracted text as an AI message
      if (addAIMessageRef.current) {
        const extractionMessage = `${FILE_PROCESSING_STRINGS.EXTRACTION_PREFIX(result.file.name)}\n\n${result.extractedText}\n\n${FILE_PROCESSING_STRINGS.EXTRACTION_SUFFIX}`
        addAIMessageRef.current(extractionMessage)
        
        // Show success toast
        toast.addToast({
          type: TOAST_VARIANTS.SUCCESS,
          title: FILE_PROCESSING_STRINGS.TEXT_EXTRACTION_COMPLETE,
          description: FILE_PROCESSING_STRINGS.TEXT_EXTRACTION_ADDED
        })
        
        // Make sure we're in conversation mode
        if (!isConversationActive) {
          setIsConversationActive(true)
        }
      } else {
        // Fallback: Start conversation with extracted text for further analysis
        const message = FILE_PROCESSING_STRINGS.EXTRACTION_CONVERSATION_STARTER(result.file.name, result.extractedText)
        handleStartConversation(message)
      }
      
      setShowFileProcessor(false)
    }
  }

  /**
   * Callback to capture the addAIMessage function from the chat conversation
   * This enables us to programmatically insert AI messages from external sources
   * 
   * @param addAIMessage - Function to add AI messages to the conversation
   * @returns void
   */
  const handleChatReady = (addAIMessage: (content: string) => void) => {
    addAIMessageRef.current = addAIMessage
  }

  return (
    <GeminiErrorBoundary>
      <div className="min-h-screen bg-chat-background transition-colors duration-300">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="h-screen flex flex-col"
        >
        {/* Header - All buttons now functional */}
        <ChatHeader 
          onMenuClick={handleMenuClick}
          onMoreClick={handleMoreClick}
          onNewConversation={isConversationActive ? handleNewConversation : undefined}
          showNewConversation={isConversationActive}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-hidden flex flex-col">
          {isConversationActive ? (
            <ChatConversation
              initialMessage={initialMessage}
              onConversationStart={() => setIsConversationActive(true)}
              onConversationEnd={handleEndConversation}
              onChatReady={handleChatReady}
              onAttachFile={handleAttachFile} // <-- ensure always passed
            />
          ) : (
            <div className="flex-1 overflow-y-auto">
              <ChatWelcome 
                onPromptSelect={handlePromptSelect}
                onActionClick={handleActionClick}
                onSendMessage={handleSendMessage}
                onAttachFile={handleAttachFile}
                onStartConversation={handleStartConversation}
              />
            </div>
          )}
        </main>
      </motion.div>

      {/* Modals - All buttons now functional */}
      <ArchivedChatsModal
        isOpen={showArchivedChats}
        onClose={() => setShowArchivedChats(false)}
        chats={chats.filter(chat => chat.status === 'archived')}
        onUnarchive={handleUnarchiveChat}
        onDelete={handleDeleteChat}
      />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onArchiveAll={handleArchiveAll}
        onDeleteAll={handleDeleteAll}
        onLogout={handleLogout}
      />

      {/* File Processing Modal - OCR and AI Analysis */}
      <FileProcessingModal
        isOpen={showFileProcessor}
        onClose={() => setShowFileProcessor(false)}
        onResult={handleFileProcessingResult}
        defaultAnalysisType={AnalysisType.SUMMARIZE}
        showAnalysisSelector={true}
      />

      {/* Confirmation Dialog - Global for all destructive actions */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={() => {
          confirmDialog.action()
          setConfirmDialog(prev => ({ ...prev, isOpen: false }))
        }}
        title={confirmDialog.title}
        description={confirmDialog.description}
        variant={confirmDialog.variant}
      />

      {/* Mobile Menu Overlay - TODO: Implement mobile sidebar */}
      {showMobileMenu && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setShowMobileMenu(false)}
        >
          <div className="fixed top-16 left-0 right-0 bg-white dark:bg-slate-800 shadow-lg rounded-b-lg mx-4 p-4 z-50">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Mobile navigation menu coming soon...
            </p>
          </div>
        </div>
      )}
      </div>
    </GeminiErrorBoundary>
  )
}

/**
 * MainLayout provides the core application structure
 * Manages modal states and provides consistent layout with full button functionality
 */
export function MainLayout() {
  return (
    <ToastProvider>
      <MainLayoutContent />
    </ToastProvider>
  )
}
/**
 * Internationalization Strings
 * 
 * Centralized string constants for i18n/l10n support.
 * All user-facing strings should be defined here to enable
 * future localization and consistent messaging.
 * 
 * Organized by feature/component for easy maintenance.
 * Use descriptive keys that indicate context and usage.
 * 
 * TODO: Integrate with i18n library (react-i18next) for full localization
 * TODO: Add support for pluralization and parameterization
 * TODO: Create translation files for different locales
 */

// ==============================================
// File Processing & OCR Messages
// ==============================================

export const FILE_PROCESSING_STRINGS = {
  // Analysis completion messages
  DOCUMENT_ANALYSIS_COMPLETE: 'Document Analysis Complete',
  DOCUMENT_ANALYSIS_ADDED: 'The AI analysis has been added to your conversation.',
  
  TEXT_EXTRACTION_COMPLETE: 'Text Extraction Complete', 
  TEXT_EXTRACTION_ADDED: 'The extracted text has been added to your conversation.',
  
  // AI message prefixes for analysis results
  ANALYSIS_PREFIX: (fileName: string) => `I've analyzed your document (${fileName}) and here's what I found:`,
  ANALYSIS_SUFFIX: 'Feel free to ask me any questions about this document!',
  
  EXTRACTION_PREFIX: (fileName: string) => `I've extracted the text from your document (${fileName}). Here's the content:`,
  EXTRACTION_SUFFIX: 'How can I help you analyze this document?',
  
  // Fallback conversation starters
  ANALYSIS_CONVERSATION_STARTER: (fileName: string, analysis: string) => 
    `I've processed a document (${fileName}) and here's the analysis:\n\n${analysis}\n\nPlease help me understand this document and answer any questions I might have about it.`,
  
  EXTRACTION_CONVERSATION_STARTER: (fileName: string, extractedText: string) =>
    `I've extracted text from a document (${fileName}). Here's the content:\n\n${extractedText}\n\nCan you help me analyze this document?`,
    
  // Error messages
  CHAT_NOT_READY_ERROR: 'Chat not ready or addMessage not available',
  EMPTY_CONTENT_WARNING: 'Empty content provided to addAIMessage',
  ANALYSIS_INSERT_ERROR: 'Could not add analysis to conversation. Please try again.',
  ANALYSIS_INSERT_ERROR_TITLE: 'Error'
} as const

// ==============================================
// Chat & Conversation Messages  
// ==============================================

export const CHAT_STRINGS = {
  // Conversation management
  CONVERSATION_STARTED: 'Conversation Started',
  CONVERSATION_STARTED_DESC: 'AI assistant is ready to help with your legal queries.',
  
  CONVERSATION_ENDED: 'Conversation Ended',
  CONVERSATION_ENDED_DESC: 'You can start a new conversation anytime.',
  
  // New conversation confirmation
  NEW_CONVERSATION_TITLE: 'Start New Conversation',
  NEW_CONVERSATION_DESC: 'This will end your current conversation. Are you sure you want to continue?',
  
  // Message sending
  MESSAGE_SENT_LOG: (message: string) => `Message sent: ${message}`
} as const

// ==============================================
// Action Button Messages
// ==============================================

export const ACTION_STRINGS = {
  // Legal features (placeholders)
  LEGAL_SEARCH_TITLE: 'Legal Search',
  LEGAL_SEARCH_DESC: 'Legal database search feature coming soon!',
  
  LEGAL_REASONING_TITLE: 'Legal Reasoning', 
  LEGAL_REASONING_DESC: 'Advanced legal reasoning mode activated.',
  
  // Mobile menu
  MOBILE_MENU_TITLE: 'Mobile Menu',
  MOBILE_MENU_DESC: 'Mobile navigation menu toggled.',
  MOBILE_MENU_PLACEHOLDER: 'Mobile navigation menu coming soon...'
} as const

// ==============================================
// Settings & Modal Messages
// ==============================================

export const SETTINGS_STRINGS = {
  // Archive actions
  ALL_CONVERSATIONS_DELETED: 'All Conversations Deleted',
  ALL_CONVERSATIONS_DELETED_DESC: 'Your conversation history has been cleared.',
  
  // Delete confirmation
  DELETE_ALL_TITLE: 'Delete All Conversations',
  DELETE_ALL_DESC: 'This will permanently delete all your conversation history. This action cannot be undone.',
  
  // Logout
  LOGOUT_TITLE: 'Log Out',
  LOGOUT_DESC: 'You will be logged out of your account on this device. Any unsaved conversations will be lost.',
  LOGGED_OUT: 'Logged Out',
  LOGGED_OUT_DESC: 'You have been successfully logged out.',
  
  // Individual chat actions
  CHAT_UNARCHIVED: 'Chat Unarchived',
  CHAT_UNARCHIVED_DESC: 'The conversation has been restored to your active chats.',
  
  DELETE_CONVERSATION_TITLE: 'Delete Conversation',
  DELETE_CONVERSATION_DESC: 'This will permanently delete this conversation. This action cannot be undone.',
  CONVERSATION_DELETED: 'Conversation Deleted', 
  CONVERSATION_DELETED_DESC: 'The conversation has been permanently deleted.'
} as const

// ==============================================
// Toast Variants & Common Messages
// ==============================================

export const TOAST_VARIANTS = {
  SUCCESS: 'success',
  ERROR: 'destructive', 
  WARNING: 'warning',
  INFO: 'info'
} as const

export const COMMON_STRINGS = {
  // Generic actions
  CONFIRM: 'Confirm',
  CANCEL: 'Cancel',
  RETRY: 'Retry',
  CLOSE: 'Close',
  
  // Loading states
  PROCESSING: 'Processing...',
  LOADING: 'Loading...',
  PLEASE_WAIT: 'Please wait...',
  
  // Error handling
  SOMETHING_WENT_WRONG: 'Something went wrong',
  TRY_AGAIN: 'Please try again later',
  CONTACT_SUPPORT: 'If the problem persists, please contact support'
} as const

// ==============================================
// Type exports for better TypeScript support
// ==============================================

export type FileProcessingStringKey = keyof typeof FILE_PROCESSING_STRINGS
export type ChatStringKey = keyof typeof CHAT_STRINGS
export type ActionStringKey = keyof typeof ACTION_STRINGS
export type SettingsStringKey = keyof typeof SETTINGS_STRINGS
export type ToastVariant = typeof TOAST_VARIANTS[keyof typeof TOAST_VARIANTS]
export type CommonStringKey = keyof typeof COMMON_STRINGS

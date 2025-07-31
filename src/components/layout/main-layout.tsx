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
 */

import { useState } from "react"
import { motion } from "framer-motion"
import { ChatHeader } from "./chat-header"
import { ChatWelcome } from "@/components/chat/chat-welcome"
import { ArchivedChatsModal } from "@/components/modals/archived-chats-modal"
import { SettingsModal } from "@/components/modals/settings-modal"
import { useTheme } from "@/components/theme/theme-provider"

/**
 * MainLayout provides the core application structure
 * Manages modal states and provides consistent layout
 */
export function MainLayout() {
  const [showArchivedChats, setShowArchivedChats] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const { theme } = useTheme()

  /**
   * Handle action button clicks from welcome screen
   */
  const handleActionClick = (action: 'attach' | 'search' | 'reason') => {
    console.log(`Action clicked: ${action}`)
    // TODO: Implement action handlers for file attachment, search, and reasoning
  }

  /**
   * Handle prompt selection from welcome screen
   */
  const handlePromptSelect = (prompt: string) => {
    console.log(`Prompt selected: ${prompt}`)
    // TODO: Start new conversation with selected prompt
  }

  /**
   * Handle menu button click (mobile navigation)
   */
  const handleMenuClick = () => {
    console.log("Menu clicked")
    // TODO: Implement mobile navigation menu
  }

  /**
   * Handle more options button click
   */
  const handleMoreClick = () => {
    setShowSettings(true)
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
    console.log("Delete all chats requested")
    // TODO: Implement confirmation dialog and deletion logic
  }

  /**
   * Handle user logout
   */
  const handleLogout = () => {
    console.log("Logout requested")
    // TODO: Implement logout logic
  }

  /**
   * Handle individual chat unarchive
   */
  const handleUnarchiveChat = (chatId: string) => {
    console.log(`Unarchive chat: ${chatId}`)
    // TODO: Implement chat unarchive logic
  }

  /**
   * Handle individual chat deletion
   */
  const handleDeleteChat = (chatId: string) => {
    console.log(`Delete chat: ${chatId}`)
    // TODO: Implement chat deletion logic
  }

  return (
    <div className="min-h-screen bg-chat-background transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="h-screen flex flex-col"
      >
        {/* Header */}
        <ChatHeader 
          onMenuClick={handleMenuClick}
          onMoreClick={handleMoreClick}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <ChatWelcome 
            onPromptSelect={handlePromptSelect}
            onActionClick={handleActionClick}
          />
        </main>

        {/* Footer - Legal disclaimer */}
        <footer className="text-center p-4 text-sm text-chat-text-secondary border-t border-chat-border bg-chat-background/80 backdrop-blur-sm">
          <p>
            By messaging Legally, you agree to our{" "}
            <a href="#" className="text-accent hover:underline">Terms</a>
            {" "}and have read our{" "}
            <a href="#" className="text-accent hover:underline">Privacy Policy</a>.
          </p>
        </footer>
      </motion.div>

      {/* Modals */}
      <ArchivedChatsModal
        isOpen={showArchivedChats}
        onClose={() => setShowArchivedChats(false)}
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
    </div>
  )
}
/**
 * Chat Welcome Component
 * 
 * Main welcome screen for new conversations in the Legally AI app.
 * Replicates the ChatGPT interface with legal-focused suggestions.
 * 
 * Features:
 * - Centered layout with large welcome text
 * - Action buttons for attach, search, and reason
 * - Predefined legal assistant prompts
 * - Smooth animations and hover effects
 * - Responsive design for all screen sizes
 */

import { motion } from "framer-motion"
import { Paperclip, Search, Scale, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ChatWelcomeProps {
  onPromptSelect?: (prompt: string) => void
  onActionClick?: (action: 'attach' | 'search' | 'reason') => void
}

// Predefined legal assistant suggestions
const suggestionPrompts = [
  "with a contract review for today",
  "with my case research strategy", 
  "with legal document drafting",
  "with a compliance analysis tip"
]

/**
 * Container animation variants for staggered children
 */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

/**
 * Individual item animation variants
 */
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0
  }
}

/**
 * ChatWelcome provides the main welcome interface
 * Displays when no conversation is active
 */
export function ChatWelcome({ onPromptSelect, onActionClick }: ChatWelcomeProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-3xl mx-auto">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-center space-y-8 w-full"
      >
        {/* Main welcome heading */}
        <motion.div variants={itemVariants} className="space-y-4">
          <h1 className="text-3xl lg:text-4xl font-medium text-chat-text-primary">
            What can I help with?
          </h1>
        </motion.div>

        {/* Action buttons - Attach, Search, Reason */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-wrap justify-center gap-3"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => onActionClick?.('attach')}
            className="h-10 px-4 rounded-full border-chat-border hover:bg-hover-overlay transition-all duration-200 flex items-center gap-2"
          >
            <Paperclip className="h-4 w-4" />
            <span className="hidden sm:inline">Attach</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onActionClick?.('search')}
            className="h-10 px-4 rounded-full border-chat-border hover:bg-hover-overlay transition-all duration-200 flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Search</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onActionClick?.('reason')}
            className="h-10 px-4 rounded-full border-chat-border hover:bg-hover-overlay transition-all duration-200 flex items-center gap-2"
          >
            <Scale className="h-4 w-4" />
            <span className="hidden sm:inline">Reason</span>
          </Button>
        </motion.div>

        {/* Suggestion prompts */}
        <motion.div 
          variants={itemVariants}
          className="space-y-3 w-full max-w-2xl mx-auto"
        >
          {suggestionPrompts.map((prompt, index) => (
            <motion.button
              key={prompt}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onPromptSelect?.(prompt)}
              className="w-full p-4 text-left rounded-xl border border-chat-border bg-chat-surface hover:bg-hover-overlay transition-all duration-200 group"
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <Sparkles className="h-4 w-4 text-chat-text-secondary group-hover:text-accent transition-colors" />
                </div>
                <span className="text-chat-text-secondary group-hover:text-chat-text-primary transition-colors">
                  Surprise me <span className="text-chat-text-primary font-medium">{prompt}</span>
                </span>
              </div>
            </motion.button>
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}
/**
 * Chat Header Component
 * 
 * Main navigation header for the Legally AI app.
 * Includes branding, navigation controls, and theme toggle.
 * 
 * Features:
 * - Responsive design for mobile and desktop
 * - Clean branding with Legally logo
 * - Theme toggle in top right
 * - Accessible navigation structure
 */

import { motion } from "framer-motion"
import { Menu, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme/theme-toggle"

interface ChatHeaderProps {
  onMenuClick?: () => void
  onMoreClick?: () => void
}

/**
 * ChatHeader provides the main application header
 * Includes brand name, navigation controls, and theme switching
 */
export function ChatHeader({ onMenuClick, onMoreClick }: ChatHeaderProps) {
  return (
    <motion.header 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-between p-4 border-b border-chat-border bg-chat-background/80 backdrop-blur-sm"
    >
      {/* Left side - Menu button and branding */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onMenuClick}
          aria-label="Open menu"
          className="h-9 w-9 rounded-lg hover:bg-hover-overlay transition-colors duration-200 lg:hidden"
        >
          <Menu className="h-4 w-4" />
        </Button>
        
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex items-center gap-2"
        >
          <h1 className="text-lg font-semibold text-chat-text-primary">
            Legally
          </h1>
        </motion.div>
      </div>

      {/* Right side - Theme toggle and more options */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onMoreClick}
          aria-label="More options"
          className="h-9 w-9 rounded-lg hover:bg-hover-overlay transition-colors duration-200"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </motion.header>
  )
}
/**
 * Theme Toggle Component
 * 
 * Provides an elegant theme switching button with smooth animations.
 * Uses Framer Motion for delightful micro-interactions and Lucide React icons.
 * 
 * Features:
 * - Smooth icon transitions
 * - System theme detection
 * - Accessible button with proper ARIA labels
 * - Hover and focus states
 */

import { Moon, Sun, Monitor } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useTheme } from "./theme-provider"

/**
 * ThemeToggle provides a button to cycle through theme options
 * Cycles: light -> dark -> system -> light
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const handleThemeToggle = () => {
    // Cycle through themes: light -> dark -> system -> light
    if (theme === "light") {
      setTheme("dark")
    } else if (theme === "dark") {
      setTheme("system")
    } else {
      setTheme("light")
    }
  }

  const getIcon = () => {
    switch (theme) {
      case "light":
        return Sun
      case "dark":
        return Moon
      case "system":
      default:
        return Monitor
    }
  }

  const getAriaLabel = () => {
    switch (theme) {
      case "light":
        return "Switch to dark theme"
      case "dark":
        return "Switch to system theme"
      case "system":
      default:
        return "Switch to light theme"
    }
  }

  const Icon = getIcon()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleThemeToggle}
      aria-label={getAriaLabel()}
      className="h-9 w-9 rounded-lg hover:bg-hover-overlay transition-colors duration-200"
    >
      <motion.div
        key={theme}
        initial={{ scale: 0.8, opacity: 0, rotate: -45 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        exit={{ scale: 0.8, opacity: 0, rotate: 45 }}
        transition={{ 
          duration: 0.2,
          ease: "easeInOut"
        }}
      >
        <Icon className="h-4 w-4" />
      </motion.div>
    </Button>
  )
}
/**
 * Settings Modal Component
 * 
 * Comprehensive settings interface for the Legally AI app.
 * Includes theme settings, preferences, and account management.
 * 
 * Features:
 * - Tabbed navigation for different settings categories
 * - Theme switching with system preference detection
 * - Toggle switches for preferences
 * - Destructive actions with confirmation
 * - Smooth animations and transitions
 */

import { motion } from "framer-motion"
import { 
  X, 
  Settings as SettingsIcon, 
  User, 
  MessageSquare, 
  Shield, 
  Database,
  Palette,
  Monitor,
  ChevronDown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTheme } from "@/components/theme/theme-provider"

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onArchiveAll?: () => void
  onDeleteAll?: () => void
  onLogout?: () => void
}

/**
 * SettingsModal provides comprehensive app configuration interface
 */
export function SettingsModal({ 
  isOpen, 
  onClose, 
  onArchiveAll,
  onDeleteAll,
  onLogout 
}: SettingsModalProps) {
  const { theme, setTheme } = useTheme()

  const handleThemeChange = (value: string) => {
    setTheme(value as "light" | "dark" | "system")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full h-[80vh] p-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="flex h-full"
        >
          {/* Sidebar Navigation */}
          <div className="w-64 bg-chat-surface border-r border-chat-border">
            {/* Header */}
            <div className="p-6 border-b border-chat-border">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-chat-text-primary">Settings</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 rounded-lg hover:bg-hover-overlay"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Navigation Items */}
            <nav className="p-4 space-y-1">
              {[
                { icon: SettingsIcon, label: 'General', active: true },
                { icon: User, label: 'Personalization', active: false },
                { icon: MessageSquare, label: 'Speech', active: false },
                { icon: Database, label: 'Data controls', active: false },
                { icon: User, label: 'Builder profile', active: false },
                { icon: Palette, label: 'Connected apps', active: false },
                { icon: Shield, label: 'Security', active: false }
              ].map((item) => (
                <div
                  key={item.label}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                    item.active 
                      ? 'bg-chat-border text-chat-text-primary' 
                      : 'text-chat-text-secondary hover:bg-hover-overlay hover:text-chat-text-primary'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-8 space-y-8">
              {/* Theme Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-chat-text-primary">Theme</h3>
                <Select value={theme} onValueChange={handleThemeChange}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="system">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4" />
                        System
                      </div>
                    </SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Legal Assistant Preferences */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-chat-text-primary">Legal Assistant Preferences</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-chat-text-primary">Always show legal citations</div>
                      <div className="text-sm text-chat-text-secondary">Include case law and statutory references in responses</div>
                    </div>
                    <Switch defaultChecked={false} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-chat-text-primary">Show follow up suggestions in chats</div>
                      <div className="text-sm text-chat-text-secondary">Display related legal topics and questions</div>
                    </div>
                    <Switch defaultChecked={true} />
                  </div>
                </div>
              </div>

              {/* Language Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-chat-text-primary">Language</h3>
                <Select defaultValue="en-us">
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en-us">English (US)</SelectItem>
                    <SelectItem value="en-gb">English (UK)</SelectItem>
                    <SelectItem value="hi">Hindi</SelectItem>
                    <SelectItem value="mr">Marathi</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Chat Management */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-chat-text-primary">Chat Management</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-chat-text-primary">Archived chats</div>
                      <div className="text-sm text-chat-text-secondary">Manage your archived conversations</div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={onArchiveAll}
                      className="border-chat-border hover:bg-hover-overlay"
                    >
                      Manage
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-chat-text-primary">Archive all chats</div>
                      <div className="text-sm text-chat-text-secondary">Move all conversations to archive</div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={onArchiveAll}
                      className="border-chat-border hover:bg-hover-overlay"
                    >
                      Archive all
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-chat-text-primary">Delete all Chats</div>
                      <div className="text-sm text-chat-text-secondary">Permanently remove all conversation history</div>
                    </div>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={onDeleteAll}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      Delete all
                    </Button>
                  </div>
                </div>
              </div>

              {/* Account Actions */}
              <div className="space-y-4 pt-6 border-t border-chat-border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-chat-text-primary">Log out on this device</div>
                    <div className="text-sm text-chat-text-secondary">End your session and clear local data</div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={onLogout}
                    className="border-chat-border hover:bg-hover-overlay"
                  >
                    Log out
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
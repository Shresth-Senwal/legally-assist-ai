/**
 * Archived Chats Modal Component
 * 
 * Displays a modal for managing archived chat conversations.
 * Replicates the ChatGPT archived chats interface with legal-focused content.
 * 
 * Features:
 * - Smooth modal animations with backdrop
 * - Chat list with timestamps and actions
 * - Unarchive and delete functionality
 * - Responsive design
 * - Keyboard navigation support
 */

import { motion, AnimatePresence } from "framer-motion"
import { X, MessageCircle, Calendar, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface ArchivedChat {
  id: string
  name: string
  dateCreated: string
  status: 'archived' | 'unarchived'
}

interface ArchivedChatsModalProps {
  isOpen: boolean
  onClose: () => void
  chats?: ArchivedChat[]
  onUnarchive?: (chatId: string) => void
  onDelete?: (chatId: string) => void
}

// Mock archived chats data - in real app, this would come from props or API
const defaultChats: ArchivedChat[] = [
  { id: '1', name: 'Contract Review Analysis', dateCreated: 'Just now', status: 'archived' },
  { id: '2', name: 'Employment Law Questions', dateCreated: 'A minute ago', status: 'archived' },
  { id: '3', name: 'IP Rights Discussion', dateCreated: '1 hour ago', status: 'archived' },
  { id: '4', name: 'Compliance Strategy', dateCreated: 'Yesterday', status: 'archived' },
  { id: '5', name: 'Corporate Legal Structure', dateCreated: 'Feb 2, 2025', status: 'archived' },
  { id: '6', name: 'Regulatory Framework Review', dateCreated: 'Just now', status: 'archived' },
  { id: '7', name: 'Legal Document Templates', dateCreated: 'A minute ago', status: 'archived' },
  { id: '8', name: 'Client Rights Overview', dateCreated: '1 hour ago', status: 'archived' },
  { id: '9', name: 'Case Law Research', dateCreated: 'Yesterday', status: 'archived' },
  { id: '10', name: 'Privacy Policy Draft', dateCreated: 'Feb 2, 2025', status: 'archived' }
]

/**
 * ArchivedChatsModal provides interface for managing archived conversations
 */
export function ArchivedChatsModal({ 
  isOpen, 
  onClose, 
  chats = defaultChats,
  onUnarchive,
  onDelete 
}: ArchivedChatsModalProps) {
  
  const handleUnarchive = (chatId: string) => {
    onUnarchive?.(chatId)
    // In real app, this would update the chat status
  }

  const handleDelete = (chatId: string) => {
    onDelete?.(chatId)
    // In real app, this would permanently delete the chat
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[80vh] p-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col h-full"
        >
          {/* Modal Header */}
          <DialogHeader className="p-6 border-b border-chat-border">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-semibold text-chat-text-primary">
                Archived Chats
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 rounded-lg hover:bg-hover-overlay"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {/* Table Header */}
              <div className="grid grid-cols-[1fr,200px,120px,40px] gap-4 pb-4 border-b border-chat-border text-sm font-medium text-chat-text-secondary">
                <div>Name</div>
                <div>Date created</div>
                <div>Status</div>
                <div></div>
              </div>

              {/* Chat List Items */}
              <div className="space-y-1 mt-4">
                {chats.map((chat) => (
                  <motion.div
                    key={chat.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-[1fr,200px,120px,40px] gap-4 py-3 px-2 rounded-lg hover:bg-hover-overlay transition-colors group"
                  >
                    {/* Chat Name */}
                    <div className="flex items-center gap-3">
                      <MessageCircle className="h-4 w-4 text-chat-text-secondary flex-shrink-0" />
                      <span className="text-chat-text-primary font-medium truncate">
                        {chat.name}
                      </span>
                    </div>

                    {/* Date Created */}
                    <div className="flex items-center gap-2 text-chat-text-secondary">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">{chat.dateCreated}</span>
                    </div>

                    {/* Status */}
                    <div className="flex items-center">
                      <span className="text-sm text-chat-text-secondary">
                        {chat.status === 'archived' ? 'Unarchived' : 'Archived'}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(chat.id)}
                        className="h-8 w-8 rounded-lg hover:bg-destructive hover:text-destructive-foreground opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
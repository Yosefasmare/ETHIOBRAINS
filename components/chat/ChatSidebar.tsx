'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { HiPlus, HiTrash } from 'react-icons/hi';
import { useChat } from '@/context/ChatContext';
import { format } from 'date-fns';

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatSidebar({ isOpen, onClose }: ChatSidebarProps) {
  const {
    chats,
    currentChatId,
    createNewChat,
    setCurrentChat,
    deleteChat,
  } = useChat();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-50 lg:static lg:z-auto"
          >
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={createNewChat}
                  className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <HiPlus className="w-5 h-5 mr-2" />
                  New Chat
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-2">
                {chats.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`group relative mb-2 rounded-lg p-2 cursor-pointer ${
                      conversation.id === currentChatId
                        ? 'bg-blue-50 dark:bg-blue-900/20'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div
                      onClick={() => setCurrentChat(conversation.id)}
                      className="flex flex-col"
                    >
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {conversation.title}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {format(conversation.createdAt, 'MMM d, h:mm a')}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteChat(conversation.id)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <HiTrash className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 
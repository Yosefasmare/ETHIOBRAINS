'use client';

import { useState, useEffect, useRef } from 'react';
import { useChat } from '@/context/ChatContext';
import MessageBubble from '@/components/chat/MessageBubble';
import ChatInput from '@/components/chat/ChatInput';
import LoadingDots from '@/components/chat/LoadingDots';
import { motion, AnimatePresence } from 'framer-motion';
import { HiPlus, HiChatAlt2, HiTrash } from 'react-icons/hi';
import { format } from 'date-fns';

export default function ChatPage() {
  const {
    chats,
    currentChatId,
    isLoading,
    createNewChat,
    addMessage,
    setCurrentChat,
    deleteChat,
  } = useChat();

  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentChat = chats.find(chat => chat.id === currentChatId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentChat?.messages]);

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;
    
    try {
      setIsSending(true);
      
      // Create new chat if needed and get its ID
      let chatId = currentChatId;
      if (!chatId) {
        chatId = createNewChat();
      }
      
      // Add user message
      addMessage(message, 'user');
      
      // Get current chat after adding message
      const currentChat = chats.find(chat => chat.id === chatId);
      const messagesToSend = currentChat?.messages 
        ? [...currentChat.messages, { content: message, role: 'user' }]
        : [{ content: message, role: 'user' }];

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: messagesToSend }),
      });
      console.log(response)

      if (!response.ok) throw new Error('Failed to get response from AI');
      
      const { response: aiResponse } = await response.json();
      if (aiResponse) {
        // Add AI response
        addMessage(aiResponse, 'assistant');
      }
    } catch (error) {
      console.error('Error:', error);
      addMessage('Sorry, there was an error. Please try again.', 'assistant');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Chat History</h2>
          </div>
          <div className="p-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={createNewChat}
              className="w-full flex items-center gap-2 px-4 py-3 mb-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all"
            >
              <HiPlus className="w-5 h-5" />
              <span>New Chat</span>
            </motion.button>
            <div className="space-y-2 max-h-[calc(100vh-16rem)] overflow-y-auto">
              <AnimatePresence>
                {chats.map(chat => (
                  <motion.div
                    key={chat.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`group relative p-3 rounded-xl cursor-pointer transition-all ${
                      chat.id === currentChatId
                        ? 'bg-blue-50 dark:bg-blue-900/20'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <div onClick={() => setCurrentChat(chat.id)} className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <HiChatAlt2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {chat.title}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {format(chat.createdAt, 'MMM d, h:mm a')}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteChat(chat.id)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <HiTrash className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Chat Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {currentChat?.title || 'AI Chat'}
            </h1>
          </div>

          <div className="flex flex-col h-[calc(100vh-16rem)]">
            <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900/50 dark:to-gray-800">
              {currentChat ? (
                <>
                  {currentChat.messages.map(message => (
                    <MessageBubble key={message.id} message={message} />
                  ))}
                  {isSending && (
                    <div className="flex justify-start mb-4">
                      <div className="bg-gray-100 dark:bg-gray-700 rounded-xl px-4 py-2 shadow-sm">
                        <LoadingDots />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center h-full"
                >
                  <div className="text-center">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Start a New Conversation
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">
                      Select a previous chat or start a new one
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
            {currentChat &&  <ChatInput onSendMessage={handleSendMessage} isLoading={isSending} />}
           
          </div>
        </motion.div>
      </div>
    </div>
  );
}

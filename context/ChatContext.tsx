'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ChatState, Chat, Message } from '@/types/chat';

const ChatContext = createContext<ChatState | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load chats from localStorage
  useEffect(() => {
    const savedChats = localStorage.getItem('chats');
    const savedCurrentId = localStorage.getItem('currentChatId');
    if (savedChats) {
      const parsed = JSON.parse(savedChats);
      setChats(
        parsed.map((chat: any) => ({
          ...chat,
          createdAt: new Date(chat.createdAt),
          messages: chat.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
        }))
      );
      if (savedCurrentId) setCurrentChatId(savedCurrentId);
    }
  }, []);

  // Save chats to localStorage
  useEffect(() => {
    localStorage.setItem('chats', JSON.stringify(chats));
    localStorage.setItem('currentChatId', currentChatId ?? '');
  }, [chats, currentChatId]);

  const createNewChat = () => {
    const newChat: Chat = {
      id: crypto.randomUUID(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
    };

    setChats(prev => [...prev, newChat]);
    setCurrentChatId(newChat.id);
    return newChat.id;
  };

  const addMessage = (content: string, role: 'user' | 'assistant') => {
    const newMessage: Message = {
      id: crypto.randomUUID(),
      content,
      role,
      timestamp: new Date(),
    };

    setChats(prevChats =>
      prevChats.map(chat =>
        chat.id === currentChatId
          ? { ...chat, messages: [...chat.messages, newMessage] }
          : chat
      )
    );

    // Optional: auto-rename the chat based on the first user message
    setChats(prevChats =>
      prevChats.map(chat =>
        chat.id === currentChatId && chat.title === 'New Chat' && role === 'user'
          ? { ...chat, title: content.slice(0, 30) + '...' }
          : chat
      )
    );
  };

  const setCurrentChat = (chatId: string) => {
    setCurrentChatId(chatId);
  };

  const deleteChat = (chatId: string) => {
    setChats(prev => prev.filter(chat => chat.id !== chatId));
    if (currentChatId === chatId) setCurrentChatId(null);
  };

  const value: ChatState = {
    chats,
    currentChatId,
    isLoading,
    error,
    createNewChat,
    addMessage,
    setCurrentChat,
    deleteChat,
    setLoading: setIsLoading,
    setError,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}

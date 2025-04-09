import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Chat, ChatState, Message } from '@/types/chat';

const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      chats: [],
      currentChatId: null,
      isLoading: false,
      error: null,

      // Actions
      createNewChat: () => {
        const newChat: Chat = {
          id: crypto.randomUUID(),
          title: 'New Chat',
          messages: [],
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          chats: [...state.chats, newChat],
          currentChatId: newChat.id,
        }));
        return newChat.id;
      },

      addMessage: (content: string, role: 'user' | 'assistant') => {
        const { currentChatId, chats } = get();
        if (!currentChatId) return;

        const newMessage: Message = {
          id: crypto.randomUUID(),
          content,
          role,
          timestamp: new Date().toISOString(),
        };

        set({
          chats: chats.map((chat) =>
            chat.id === currentChatId
              ? {
                  ...chat,
                  messages: [...chat.messages, newMessage],
                  title: chat.messages.length === 0
                    ? content.slice(0, 30) + '...'
                    : chat.title,
                }
              : chat
          ),
        });
      },

      setCurrentChat: (chatId: string) => {
        set({ currentChatId: chatId });
      },

      deleteChat: (chatId: string) => {
        set((state) => ({
          chats: state.chats.filter((chat) => chat.id !== chatId),
          currentChatId: state.currentChatId === chatId ? null : state.currentChatId,
        }));
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      setError: (error: string | null) => {
        set({ error });
      },
    }),
    {
      name: 'chat-storage', // Unique name for localStorage
      partialize: (state) => ({
        chats: state.chats,
        currentChatId: state.currentChatId,
      }),
    }
  )
);

export default useChatStore;

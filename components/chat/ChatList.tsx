'use client';

import { FiPlus, FiTrash2 } from 'react-icons/fi';
import useChatStore from '@/lib/store';
import { Chat } from '@/types/chat';

export default function ChatList() {
  const { chats, currentChatId, createNewChat, deleteChat, setCurrentChat } = useChatStore();

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={createNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <FiPlus className="w-5 h-5" />
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {chats.map((chat: Chat) => (
          <div
            key={chat.id}
            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
              currentChatId === chat.id
                ? 'bg-blue-100 dark:bg-blue-900'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <div
              className="flex-1 truncate"
              onClick={() => setCurrentChat(chat.id)}
            >
              {chat.title}
            </div>
            <button
              onClick={() => deleteChat(chat.id)}
              className="p-1 text-gray-500 hover:text-red-500 transition-colors"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 
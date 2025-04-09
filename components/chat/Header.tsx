'use client';

import { FiMenu } from 'react-icons/fi';
import { Chat } from '@/types/chat';
import useChatStore from '@/lib/store';

export default function Header() {
  const { chats, currentChatId } = useChatStore();
  const currentChat = chats.find((chat: Chat) => chat.id === currentChatId);

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {currentChat?.title || 'New Chat'}
        </h1>
        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <FiMenu className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
} 
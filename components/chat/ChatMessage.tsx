'use client';

import { Message } from '@/types/chat';

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  return (
    <div
      className={`flex ${
        message.role === 'user' ? 'justify-end' : 'justify-start'
      }`}
    >
      <div
        className={`max-w-[80%] rounded-lg p-4 ${
          message.role === 'user'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        <p className="text-xs mt-2 opacity-70">
          {new Date(message.timestamp).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
} 
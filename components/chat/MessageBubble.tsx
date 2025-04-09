'use client';

import { Message } from '@/types/chat';
import { format } from 'date-fns';

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex ${
        isUser ? 'justify-end' : 'justify-start'
      } mb-4`}
    >
      <div
        className={`max-w-[80%] rounded-lg px-4 py-2 ${
          isUser
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <span
          className={`text-xs mt-1 block ${
            isUser ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          {format(message.timestamp, 'h:mm a')}
        </span>
      </div>
    </div>
  );
} 
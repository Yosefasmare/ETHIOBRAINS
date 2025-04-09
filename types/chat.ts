export type Message = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string | Date;
};

export type Chat = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string | Date;
};

export type ChatState = {
  chats: Chat[];                      // List of all chats
  currentChatId: string | null;      // The active chat
  isLoading: boolean;                // For loading states
  error: string | null;              // For error handling

  createNewChat: () => string;       // Creates a new chat, returns new chat ID
  addMessage: (content: string, role: 'user' | 'assistant') => void; // Adds message to current chat
  setCurrentChat: (chatId: string) => void;  // Sets current chat
  deleteChat: (chatId: string) => void;      // Deletes a chat by ID
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
};

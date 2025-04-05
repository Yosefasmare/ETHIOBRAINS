import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface FileUpload {
  id:string; // Unique identifier for the file
  name: string  // File name
  size: number; // File size in bytes
  url: string ;  
  uploadedAt: Date;  
}

interface User {
  id: string;
  name: string;
  email: string;
  profileUrl: string;
  fireStoreId:string;
  plan: string;
  NoFileUploads: number;
  NoFlashcardsGenerated: number;
  NoExplanationsGenerated: number;
  NoSummariesGenerated: number;
  NoQuizzesGenerated: number;
  createdAt: string;
}



interface StoreTheme {
    theme: "light" | "dark";
    toggleTheme: () => void;
  }

// ✅ Define Store Type
interface StoreState {
  user: User | null;
  isAuthenticated: boolean;
  userFirestoreID: string | null;
  theme: 'light' | 'dark';
 
  setFirestoreID: (id: string | null) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
  toggleTheme: () => void;
}

// ✅ Create Zustand Store
const useStore = create<StoreState>((set) => ({
  user: null,
  isAuthenticated: false,
  userFirestoreID: null,
  theme: 'dark',

  setUser: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
  setFirestoreID: (userFirestoreID) => set({ userFirestoreID }),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' }))
}));



export {useStore}
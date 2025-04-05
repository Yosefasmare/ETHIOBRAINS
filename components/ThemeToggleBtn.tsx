'use client';

import { FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '@/context/ThemeContext';

const ThemeToggleBtn = () => {
  const { darkMode, setDarkMode } = useTheme();

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
      aria-label="Toggle theme"
    >
      {darkMode ? (
        <FiSun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      ) : (
        <FiMoon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      )}
    </button>
  );
};

export default ThemeToggleBtn; 
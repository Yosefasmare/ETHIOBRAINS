'use client';

import { FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '@/context/ThemeContext';

const ThemeToggleBtn = () => {
  const { darkMode, setDarkMode } = useTheme();

  return (
    <button
    onClick={() => setDarkMode(!darkMode)}
    className="p-2 rounded-full bg-white dark:bg-gray-800 transition-colors"
    aria-label="Toggle theme"
  >
    {darkMode ? (
      <FiSun className="w-6 h-6 text-yellow-500" />
    ) : (
      <FiMoon className="w-6 h-6 text-green-500" />
    )}
  </button>
  );
};

export default ThemeToggleBtn; 
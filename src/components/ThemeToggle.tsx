import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { toggleTheme, isDark } = useTheme();

  const handleClick = () => {
    console.log('Theme toggle clicked, current theme:', isDark ? 'dark' : 'light');
    toggleTheme();
  };

  return (
    <button
      onClick={handleClick}
      className="relative inline-flex items-center justify-center p-2 rounded-lg 
                 bg-gray-100 dark:bg-gray-700 
                 hover:bg-gray-200 dark:hover:bg-gray-600
                 transition-all duration-300 ease-in-out
                 group"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {/* Animated icon container */}
      <div className="relative w-5 h-5">
        {/* Sun icon (visible in light mode) */}
        <Sun 
          className={`absolute inset-0 w-5 h-5 text-yellow-600 dark:text-gray-400 
                     transition-all duration-300 ease-in-out
                     ${isDark ? 'opacity-0 rotate-180 scale-0' : 'opacity-100 rotate-0 scale-100'}`}
        />
        
        {/* Moon icon (visible in dark mode) */}
        <Moon 
          className={`absolute inset-0 w-5 h-5 text-blue-600 dark:text-blue-400
                     transition-all duration-300 ease-in-out
                     ${isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-180 scale-0'}`}
        />
      </div>
      
      {/* Subtle glow effect */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 
                      dark:from-blue-400/20 dark:to-purple-400/20
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Focus ring for accessibility */}
      <div className="absolute inset-0 rounded-lg ring-2 ring-blue-500 dark:ring-blue-400 
                      ring-offset-2 ring-offset-white dark:ring-offset-gray-900
                      opacity-0 focus-within:opacity-100 transition-opacity duration-200" />
    </button>
  );
};

export default ThemeToggle;

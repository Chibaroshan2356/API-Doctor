import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  dot?: boolean;
  pulse?: boolean;
}

const Badge = ({ 
  children, 
  variant = 'default', 
  size = 'md',
  dot = false,
  pulse = false
}: BadgeProps) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full';
  
  const variants = {
    default: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    success: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
    warning: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    danger: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    info: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300',
    neutral: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm'
  };

  const dotColors = {
    default: 'bg-blue-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    info: 'bg-cyan-500',
    neutral: 'bg-gray-500'
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${sizes[size]}`}>
      {dot && (
        <span className={`w-2 h-2 rounded-full ${dotColors[variant]} mr-1.5 ${pulse ? 'animate-pulse' : ''}`}></span>
      )}
      {children}
    </span>
  );
};

export default Badge;

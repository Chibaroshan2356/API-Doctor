import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'gradient' | 'bordered';
  hover?: boolean;
  onClick?: () => void;
}

const Card = ({ 
  children, 
  className = '', 
  variant = 'default', 
  hover = true,
  onClick 
}: CardProps) => {
  const baseStyles = 'rounded-2xl overflow-hidden transition-all duration-300 border border-gray-800/50';
  
  const variants = {
    default: 'bg-gray-900/60 backdrop-blur-xl shadow-lg shadow-black/40 hover:shadow-xl hover:shadow-black/60',
    glass: 'bg-gray-900/40 backdrop-blur-2xl border border-gray-700/50 shadow-xl shadow-black/30',
    gradient: 'bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-blue-500/20',
    bordered: 'bg-gray-900/80 border border-gray-700 shadow-lg shadow-black/30'
  };

  const hoverStyles = hover ? 'hover:scale-[1.02] hover:-translate-y-1 hover:border-gray-600/50 cursor-pointer' : '';

  return (
    <div 
      className={`${baseStyles} ${variants[variant]} ${hoverStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;

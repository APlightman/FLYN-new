import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
}

export function Card({ children, className = '', padding = 'md', variant = 'default' }: CardProps) {
  const paddingClasses = {
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  const variantClasses = {
    default: 'bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60 shadow-sm',
    elevated: 'bg-white dark:bg-slate-900 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-800',
    outlined: 'bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700',
    glass: 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 shadow-xl',
  };

  return (
    <div className={`
      rounded-xl sm:rounded-2xl transition-all duration-300 hover:shadow-md hover:shadow-slate-200/60 dark:hover:shadow-slate-900/60
      ${variantClasses[variant]} ${paddingClasses[padding]} ${className}
    `}>
      {children}
    </div>
  );
}
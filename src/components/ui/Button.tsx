import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  loading = false,
  className = '',
  children,
  disabled,
  ...props 
}: ButtonProps) {
  const baseClasses = 'rounded-xl sm:rounded-2xl font-semibold transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden inline-flex items-center justify-center gap-2 touch-manipulation';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 focus:ring-blue-500/30 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 active:scale-[0.98]',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 focus:ring-slate-500/30 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 shadow-sm hover:shadow-md active:scale-[0.98]',
    danger: 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 focus:ring-red-500/30 shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30 active:scale-[0.98]',
    success: 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 focus:ring-green-500/30 shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 active:scale-[0.98]',
    ghost: 'text-slate-600 hover:bg-slate-100 focus:ring-slate-500/30 dark:text-slate-400 dark:hover:bg-slate-800 hover:shadow-sm active:scale-[0.98]',
    outline: 'border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 focus:ring-slate-500/30 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:border-slate-600 shadow-sm hover:shadow-md active:scale-[0.98]',
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-xs sm:text-sm min-h-[36px] sm:min-h-[40px]',
    md: 'px-4 py-2 sm:px-6 sm:py-3 text-sm min-h-[40px] sm:min-h-[44px]',
    lg: 'px-6 py-3 sm:px-8 sm:py-4 text-sm sm:text-base min-h-[44px] sm:min-h-[48px]',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <span className={`flex items-center gap-2 ${loading ? 'opacity-0' : 'opacity-100'}`}>
        {children}
      </span>
    </button>
  );
}
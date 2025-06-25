import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled' | 'outlined';
}

export function Input({ 
  label, 
  error, 
  fullWidth = false,
  leftIcon,
  rightIcon,
  variant = 'default',
  className = '',
  ...props 
}: InputProps) {
  const baseClasses = 'px-3 py-2 sm:px-4 sm:py-3 text-sm transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed min-h-[40px] sm:min-h-[44px]';
  
  const variantClasses = {
    default: 'rounded-xl sm:rounded-2xl border border-slate-200 focus:ring-blue-500/30 focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 bg-white shadow-sm hover:shadow-md',
    filled: 'rounded-xl sm:rounded-2xl bg-slate-100 border border-transparent focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white dark:bg-slate-800 dark:text-slate-100 dark:focus:bg-slate-700',
    outlined: 'rounded-xl sm:rounded-2xl border-2 border-slate-200 focus:ring-blue-500/30 focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 bg-white',
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  const errorClass = error ? 'border-red-500 focus:ring-red-500/30 focus:border-red-500' : '';
  const iconPadding = leftIcon ? 'pl-10 sm:pl-12' : rightIcon ? 'pr-10 sm:pr-12' : '';

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-slate-400">
            {leftIcon}
          </div>
        )}
        <input
          className={`${baseClasses} ${variantClasses[variant]} ${widthClass} ${errorClass} ${iconPadding} ${className}`}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-slate-400">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
      )}
    </div>
  );
}
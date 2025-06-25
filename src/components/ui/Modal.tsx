import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ isOpen, onClose, title, children, footer, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300" 
        onClick={onClose} 
      />
      
      {/* Modal */}
      <div className={`
        relative bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl w-full ${sizeClasses[size]} 
        max-h-[90vh] overflow-hidden shadow-2xl shadow-slate-900/20 
        transform transition-all duration-300 scale-100 opacity-100
        border border-slate-200/60 dark:border-slate-700/60
        mx-4 sm:mx-0
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200/60 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/50">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 pr-4 truncate">{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full p-2 flex-shrink-0">
            <X size={20} />
          </Button>
        </div>
        
        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {children}
        </div>
        
        {/* Footer */}
        {footer && (
          <div className="p-4 sm:p-6 border-t border-slate-200/60 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
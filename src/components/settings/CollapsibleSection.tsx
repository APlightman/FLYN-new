import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Card } from '../ui/Card';

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  className?: string;
}

export function CollapsibleSection({ 
  title, 
  icon, 
  children, 
  defaultExpanded = false,
  className = '' 
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Card variant="elevated" className={className}>
      {/* Заголовок с кнопкой сворачивания */}
      <button
        onClick={toggleExpanded}
        className="w-full flex items-center justify-between p-1 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 group"
      >
        <div className="flex items-center gap-3">
          <div className="transition-transform duration-200 group-hover:scale-110">
            {icon}
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {title}
          </h3>
        </div>
        
        <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}>
          <ChevronRight size={20} className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
        </div>
      </button>

      {/* Содержимое секции */}
      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
        isExpanded ? 'max-h-[2000px] opacity-100 mt-6' : 'max-h-0 opacity-0'
      }`}>
        {children}
      </div>
    </Card>
  );
}
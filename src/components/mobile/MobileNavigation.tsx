import React from 'react';
import { 
  Home, 
  PlusCircle, 
  BarChart3, 
  Target, 
  Settings
} from 'lucide-react';

interface MobileNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Главная', icon: Home },
  { id: 'transactions', label: 'Операции', icon: PlusCircle },
  { id: 'analytics', label: 'Отчёты', icon: BarChart3 },
  { id: 'budget', label: 'Бюджет', icon: Target },
  { id: 'settings', label: 'Ещё', icon: Settings },
];

export function MobileNavigation({ activeTab, onTabChange }: MobileNavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/60 dark:border-slate-700/60 z-40 lg:hidden transition-all duration-300">
      <div className="flex items-center justify-around px-2 py-1 safe-area-inset-bottom">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`
                flex flex-col items-center gap-1 px-2 sm:px-3 py-2 rounded-xl transition-all duration-200 min-w-0 flex-1 max-w-[80px]
                ${isActive
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 scale-105'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }
              `}
            >
              <IconComponent size={20} className={`transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
              <span className={`text-xs font-medium truncate w-full text-center ${isActive ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="w-1 h-1 bg-blue-600 dark:bg-blue-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
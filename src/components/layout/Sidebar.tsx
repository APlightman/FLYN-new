import React, { useEffect, useState } from 'react';
import { 
  Home, 
  PlusCircle, 
  Target, 
  Calendar, 
  BarChart3, 
  Settings,
  Repeat,
  Calculator,
  Tags,
  Download,
  Filter,
  HelpCircle
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Главная', icon: Home, color: 'text-blue-600 dark:text-blue-400' },
  { id: 'transactions', label: 'Транзакции', icon: PlusCircle, color: 'text-green-600 dark:text-green-400' },
  { id: 'budget', label: 'Бюджет', icon: Target, color: 'text-red-600 dark:text-red-400' },
  { id: 'goals', label: 'Цели', icon: Target, color: 'text-orange-600 dark:text-orange-400' },
  { id: 'recurring', label: 'Регулярные', icon: Repeat, color: 'text-indigo-600 dark:text-indigo-400' },
  { id: 'analytics', label: 'Аналитика', icon: BarChart3, color: 'text-emerald-600 dark:text-emerald-400' },
  { id: 'calendar', label: 'Календарь', icon: Calendar, color: 'text-pink-600 dark:text-pink-400' },
  { id: 'categories', label: 'Категории', icon: Tags, color: 'text-cyan-600 dark:text-cyan-400' },
  { id: 'calculator', label: 'Калькулятор', icon: Calculator, color: 'text-amber-600 dark:text-amber-400' },
  { id: 'import-export', label: 'Импорт/Экспорт', icon: Download, color: 'text-slate-600 dark:text-slate-400' },
  { id: 'faq', label: 'ЧаВо', icon: HelpCircle, color: 'text-violet-600 dark:text-violet-400' },
  { id: 'settings', label: 'Настройки', icon: Settings, color: 'text-slate-600 dark:text-slate-400' },
];

export function Sidebar({ activeTab, onTabChange, isOpen, onClose }: SidebarProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleItemClick = (itemId: string) => {
    onTabChange(itemId);
    if (isMobile) {
      onClose();
    }
  };

  return (
    <>
      {isOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 transition-opacity duration-300" 
          onClick={onClose}
        />
      )}
      
      <aside className={`
        fixed lg:static left-0 top-0 h-full lg:h-[calc(100vh-5rem)] w-72 
        bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl 
        border-r border-slate-200/60 dark:border-slate-700/60 
        z-30 lg:z-0 transition-all duration-300 ease-in-out
        ${isMobile 
          ? `transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} pt-20`
          : 'translate-x-0 pt-0'
        }
      `}>
        <div className="p-4 lg:p-6 space-y-2 h-full overflow-y-auto">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200/60 dark:border-slate-700/60">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Навигация
            </span>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-xl lg:rounded-2xl text-left transition-all duration-200 group
                    ${activeTab === item.id 
                      ? 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 text-blue-900 dark:text-blue-100 shadow-lg shadow-blue-500/10 scale-[1.02]' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-100 hover:scale-[1.01]'
                    }
                  `}
                >
                  <div className={`
                    p-1.5 lg:p-2 rounded-lg lg:rounded-xl transition-all duration-200
                    ${activeTab === item.id 
                      ? 'bg-white dark:bg-slate-800 shadow-md' 
                      : 'group-hover:bg-white dark:group-hover:bg-slate-800 group-hover:shadow-sm'
                    }
                  `}>
                    <IconComponent size={16} className={activeTab === item.id ? item.color : 'text-current'} />
                  </div>
                  
                  <span className="font-semibold flex-1 text-sm lg:text-base">{item.label}</span>
                  
                  {activeTab === item.id && (
                    <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
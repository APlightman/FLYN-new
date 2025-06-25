import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface SidebarTab {
  id: string;
  label: string;
  icon: string;
  required: boolean;
}

interface SidebarSettingsProps {
  sidebarTabs: Record<string, boolean>;
  onUpdateTabs: (updates: Record<string, boolean>) => void;
}

const SIDEBAR_TABS: SidebarTab[] = [
  { id: 'dashboard', label: 'Главная', icon: '🏠', required: true },
  { id: 'transactions', label: 'Транзакции', icon: '💳', required: false },
  { id: 'filters', label: 'Фильтры', icon: '🔍', required: false },
  { id: 'budget', label: 'Бюджет', icon: '🎯', required: false },
  { id: 'goals', label: 'Цели', icon: '🏆', required: false },
  { id: 'recurring', label: 'Регулярные', icon: '🔄', required: false },
  { id: 'analytics', label: 'Аналитика', icon: '📊', required: false },
  { id: 'calendar', label: 'Календарь', icon: '📅', required: false },
  { id: 'categories', label: 'Категории', icon: '🏷️', required: false },
  { id: 'calculator', label: 'Калькулятор', icon: '🧮', required: false },
  { id: 'import-export', label: 'Импорт/Экспорт', icon: '📤', required: false },
  { id: 'faq', label: 'ЧаВо', icon: '❓', required: false },
  { id: 'settings', label: 'Настройки', icon: '⚙️', required: true },
];

export function SidebarSettings({ sidebarTabs, onUpdateTabs }: SidebarSettingsProps) {
  const getVisibleTabsCount = () => {
    return Object.values(sidebarTabs).filter(Boolean).length;
  };

  const getHiddenTabsCount = () => {
    return SIDEBAR_TABS.length - getVisibleTabsCount();
  };

  const handleTabToggle = (tabId: string, checked: boolean) => {
    onUpdateTabs({ [tabId]: checked });
  };

  return (
    <div className="space-y-6">
      {/* Статистика */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
        <div className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Видимых вкладок:</strong> {getVisibleTabsCount()} из {SIDEBAR_TABS.length}
        </div>
        <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">
          Выберите, какие вкладки отображать в боковом меню
        </div>
      </div>

      {/* Информация о скрытых вкладках */}
      {getHiddenTabsCount() > 0 && (
        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="text-sm text-slate-700 dark:text-slate-300">
            <strong>Скрыто вкладок:</strong> {getHiddenTabsCount()}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Скрытые вкладки не отображаются в боковом меню, но остаются доступными
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {SIDEBAR_TABS.map(tab => (
          <label 
            key={tab.id} 
            className={`
              flex items-center justify-between p-4 rounded-xl transition-all duration-200 cursor-pointer
              ${sidebarTabs[tab.id]
                ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800'
                : 'bg-slate-50 dark:bg-slate-800 border-2 border-transparent hover:bg-slate-100 dark:hover:bg-slate-700'
              }
              ${tab.required ? 'opacity-75' : ''}
            `}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{tab.icon}</span>
              <div>
                <div className="font-medium text-slate-900 dark:text-slate-100">
                  {tab.label}
                </div>
                {tab.required && (
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Обязательная вкладка
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {sidebarTabs[tab.id] ? (
                <Eye className="text-green-600 dark:text-green-400" size={16} />
              ) : (
                <EyeOff className="text-slate-400" size={16} />
              )}
              
              <input
                type="checkbox"
                checked={sidebarTabs[tab.id]}
                onChange={(e) => {
                  if (!tab.required) {
                    handleTabToggle(tab.id, e.target.checked);
                  }
                }}
                disabled={tab.required}
                className="rounded"
              />
            </div>
          </label>
        ))}
      </div>

      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
        <div className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Примечание:</strong> Вкладки "Главная" и "Настройки" всегда видимы и не могут быть скрыты.
        </div>
      </div>
    </div>
  );
}
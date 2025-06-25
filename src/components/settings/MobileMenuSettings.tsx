import React from 'react';
import { Eye, EyeOff, GripVertical } from 'lucide-react';

interface MobileMenuItem {
  id: string;
  label: string;
  icon: string;
  required: boolean;
}

interface MobileMenuSettingsProps {
  mobileMenuItems: Record<string, boolean>;
  onUpdateItems: (updates: Record<string, boolean>) => void;
}

const MOBILE_MENU_ITEMS: MobileMenuItem[] = [
  { id: 'dashboard', label: 'Главная', icon: '🏠', required: true },
  { id: 'transactions', label: 'Операции', icon: '💳', required: false },
  { id: 'analytics', label: 'Отчёты', icon: '📊', required: false },
  { id: 'budget', label: 'Бюджет', icon: '🎯', required: false },
  { id: 'goals', label: 'Цели', icon: '🏆', required: false },
  { id: 'calendar', label: 'Календарь', icon: '📅', required: false },
  { id: 'categories', label: 'Категории', icon: '🏷️', required: false },
  { id: 'filters', label: 'Фильтры', icon: '🔍', required: false },
  { id: 'recurring', label: 'Регулярные', icon: '🔄', required: false },
  { id: 'calculator', label: 'Калькулятор', icon: '🧮', required: false },
  { id: 'import-export', label: 'Импорт/Экспорт', icon: '📤', required: false },
  { id: 'faq', label: 'ЧаВо', icon: '❓', required: false },
  { id: 'settings', label: 'Ещё', icon: '⚙️', required: true },
];

export function MobileMenuSettings({ mobileMenuItems, onUpdateItems }: MobileMenuSettingsProps) {
  const getVisibleItemsCount = () => {
    return Object.values(mobileMenuItems).filter(Boolean).length;
  };

  const getHiddenItemsCount = () => {
    return MOBILE_MENU_ITEMS.length - getVisibleItemsCount();
  };

  const handleItemToggle = (itemId: string, checked: boolean) => {
    onUpdateItems({ [itemId]: checked });
  };

  const getRecommendedItemsCount = () => {
    return 5; // Оптимальное количество для мобильного меню
  };

  const isOptimalCount = () => {
    const visibleCount = getVisibleItemsCount();
    return visibleCount >= 3 && visibleCount <= 5;
  };

  return (
    <div className="space-y-6">
      {/* Статистика и рекомендации */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Видимых кнопок:</strong> {getVisibleItemsCount()} из {MOBILE_MENU_ITEMS.length}
          </div>
          <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">
            Выберите, какие кнопки отображать в нижнем меню
          </div>
        </div>

        <div className={`p-4 rounded-xl ${
          isOptimalCount() 
            ? 'bg-green-50 dark:bg-green-900/20' 
            : 'bg-orange-50 dark:bg-orange-900/20'
        }`}>
          <div className={`text-sm ${
            isOptimalCount() 
              ? 'text-green-800 dark:text-green-200' 
              : 'text-orange-800 dark:text-orange-200'
          }`}>
            <strong>Рекомендация:</strong> {getRecommendedItemsCount()} кнопок
          </div>
          <div className={`text-xs mt-1 ${
            isOptimalCount() 
              ? 'text-green-700 dark:text-green-300' 
              : 'text-orange-700 dark:text-orange-300'
          }`}>
            {isOptimalCount() 
              ? 'Оптимальное количество кнопок' 
              : 'Слишком много или мало кнопок может ухудшить UX'
            }
          </div>
        </div>
      </div>

      {/* Информация о скрытых кнопках */}
      {getHiddenItemsCount() > 0 && (
        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="text-sm text-slate-700 dark:text-slate-300">
            <strong>Скрыто кнопок:</strong> {getHiddenItemsCount()}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Скрытые функции доступны через кнопку "Ещё" в мобильном меню
          </div>
        </div>
      )}

      {/* Настройка кнопок */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {MOBILE_MENU_ITEMS.map(item => (
          <label 
            key={item.id} 
            className={`
              flex items-center justify-between p-4 rounded-xl transition-all duration-200 cursor-pointer
              ${mobileMenuItems[item.id]
                ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800'
                : 'bg-slate-50 dark:bg-slate-800 border-2 border-transparent hover:bg-slate-100 dark:hover:bg-slate-700'
              }
              ${item.required ? 'opacity-75' : ''}
            `}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{item.icon}</span>
              <div>
                <div className="font-medium text-slate-900 dark:text-slate-100">
                  {item.label}
                </div>
                {item.required && (
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Обязательная кнопка
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {mobileMenuItems[item.id] ? (
                <Eye className="text-green-600 dark:text-green-400" size={16} />
              ) : (
                <EyeOff className="text-slate-400" size={16} />
              )}
              
              <input
                type="checkbox"
                checked={mobileMenuItems[item.id]}
                onChange={(e) => {
                  if (!item.required) {
                    handleItemToggle(item.id, e.target.checked);
                  }
                }}
                disabled={item.required}
                className="rounded"
              />
            </div>
          </label>
        ))}
      </div>

      {/* Предварительный просмотр */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
        <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
          Предварительный просмотр мобильного меню
        </h4>
        
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-around">
            {MOBILE_MENU_ITEMS
              .filter(item => mobileMenuItems[item.id])
              .slice(0, 5) // Показываем максимум 5 кнопок
              .map((item, index) => (
                <div key={item.id} className="flex flex-col items-center gap-1 p-2">
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate max-w-[60px]">
                    {item.label}
                  </span>
                  {index === 0 && (
                    <div className="w-1 h-1 bg-blue-600 dark:bg-blue-400 rounded-full" />
                  )}
                </div>
              ))}
          </div>
        </div>
        
        <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">
          Так будет выглядеть нижнее меню на мобильных устройствах
        </div>
      </div>

      {/* Рекомендации по UX */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
        <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">
          💡 Рекомендации по мобильному UX
        </h4>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• <strong>3-5 кнопок</strong> - оптимальное количество для удобства</li>
          <li>• <strong>Главная и Ещё</strong> - всегда должны быть видны</li>
          <li>• <strong>Часто используемые</strong> - размещайте в центре</li>
          <li>• <strong>Скрытые функции</strong> - доступны через кнопку "Ещё"</li>
        </ul>
      </div>

      {/* Предупреждения */}
      {getVisibleItemsCount() > 5 && (
        <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
          <div className="text-sm text-orange-800 dark:text-orange-200">
            <strong>Внимание:</strong> Слишком много кнопок в мобильном меню может ухудшить пользовательский опыт. 
            Рекомендуем оставить не более 5 кнопок.
          </div>
        </div>
      )}

      {getVisibleItemsCount() < 3 && (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
          <div className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Совет:</strong> Слишком мало кнопок может затруднить навигацию. 
            Рекомендуем добавить ещё несколько часто используемых функций.
          </div>
        </div>
      )}

      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
        <div className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Примечание:</strong> Кнопки "Главная" и "Ещё" всегда видимы и не могут быть скрыты. 
          Через кнопку "Ещё" доступны все скрытые функции.
        </div>
      </div>
    </div>
  );
}
import React, { useMemo, useState } from 'react';
import { Transaction, Category, formatCurrency } from '../../types';
import { getDaysInMonth, isToday, isSameMonth } from '../../utils/dateUtils';
import { Plus, Eye } from 'lucide-react';

interface CalendarMonthProps {
  currentDate: Date;
  transactionsByDate: Record<string, Transaction[]>;
  onDateClick: (date: Date) => void;
  categories: Category[];
  showEmpty: boolean;
}

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export function CalendarMonth({ 
  currentDate, 
  transactionsByDate, 
  onDateClick, 
  categories,
  showEmpty 
}: CalendarMonthProps) {
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const days = useMemo(() => getDaysInMonth(currentDate), [currentDate]);

  const getDayStats = (date: Date) => {
    // Исправляем проблему с датами - используем правильный формат
    const dateKey = date.getFullYear() + '-' + 
                   String(date.getMonth() + 1).padStart(2, '0') + '-' + 
                   String(date.getDate()).padStart(2, '0');
    
    const dayTransactions = transactionsByDate[dateKey] || [];
    
    const income = dayTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = dayTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return { income, expenses, balance: income - expenses, count: dayTransactions.length, transactions: dayTransactions };
  };

  const handleMouseEnter = (date: Date, event: React.MouseEvent) => {
    const dateKey = date.getFullYear() + '-' + 
                   String(date.getMonth() + 1).padStart(2, '0') + '-' + 
                   String(date.getDate()).padStart(2, '0');
    
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
    setHoveredDate(dateKey);
  };

  const handleMouseLeave = () => {
    setHoveredDate(null);
  };

  const getTooltipData = () => {
    if (!hoveredDate) return null;
    const dayTransactions = transactionsByDate[hoveredDate] || [];
    
    const income = dayTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = dayTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      transactions: dayTransactions,
      income,
      expenses,
      balance: income - expenses,
      count: dayTransactions.length
    };
  };

  const tooltipData = getTooltipData();

  return (
    <div className="space-y-4">
      {/* Заголовки дней недели */}
      <div className="grid grid-cols-7 gap-2">
        {WEEKDAYS.map(day => (
          <div key={day} className="text-center text-sm font-semibold text-slate-500 dark:text-slate-400 py-3">
            {day}
          </div>
        ))}
      </div>

      {/* Календарная сетка */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((date, index) => {
          if (!date) return <div key={index} />;
          
          const stats = getDayStats(date);
          const hasTransactions = stats.count > 0;
          const isCurrentMonthDay = isSameMonth(date, currentDate);
          const isTodayDate = isToday(date);
          
          if (!showEmpty && !hasTransactions && !isTodayDate) {
            return (
              <div
                key={index}
                className={`aspect-square p-2 rounded-2xl transition-all duration-200 ${
                  isCurrentMonthDay 
                    ? 'text-slate-300 dark:text-slate-600' 
                    : 'text-slate-200 dark:text-slate-700'
                }`}
              >
                <div className="text-sm font-medium">{date.getDate()}</div>
              </div>
            );
          }
          
          return (
            <button
              key={index}
              onClick={() => onDateClick(date)}
              onMouseEnter={(e) => handleMouseEnter(date, e)}
              onMouseLeave={handleMouseLeave}
              className={`
                aspect-square p-2 rounded-2xl transition-all duration-200 text-left relative group
                hover:scale-105 hover:shadow-lg active:scale-95
                ${isTodayDate
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : hasTransactions
                  ? 'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 hover:from-slate-100 hover:to-slate-200 dark:hover:from-slate-700 dark:hover:to-slate-600 border border-slate-200 dark:border-slate-600'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                }
                ${!isCurrentMonthDay && 'opacity-40'}
              `}
            >
              <div className="space-y-1">
                <div className={`text-sm font-semibold ${
                  isTodayDate 
                    ? 'text-white' 
                    : isCurrentMonthDay 
                    ? 'text-slate-900 dark:text-slate-100' 
                    : 'text-slate-400 dark:text-slate-500'
                }`}>
                  {date.getDate()}
                </div>
                
                {hasTransactions && (
                  <div className="space-y-0.5">
                    {stats.income > 0 && (
                      <div className={`text-xs font-medium ${
                        isTodayDate ? 'text-green-100' : 'text-green-600 dark:text-green-400'
                      }`}>
                        +{formatCurrency(stats.income)}
                      </div>
                    )}
                    {stats.expenses > 0 && (
                      <div className={`text-xs font-medium ${
                        isTodayDate ? 'text-red-100' : 'text-red-600 dark:text-red-400'
                      }`}>
                        -{formatCurrency(stats.expenses)}
                      </div>
                    )}
                    <div className={`text-xs ${
                      isTodayDate 
                        ? 'text-white/80' 
                        : 'text-slate-500 dark:text-slate-400'
                    }`}>
                      {stats.count} оп.
                    </div>
                  </div>
                )}
              </div>

              {/* Индикатор при наведении */}
              {hasTransactions && (
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Eye size={12} className={isTodayDate ? 'text-white/80' : 'text-blue-600 dark:text-blue-400'} />
                </div>
              )}

              {/* Кнопка добавления при наведении */}
              {!hasTransactions && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="p-1 bg-blue-600 text-white rounded-full shadow-lg">
                    <Plus size={12} />
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Tooltip */}
      {hoveredDate && tooltipData && tooltipData.count > 0 && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-3 py-2 rounded-lg shadow-xl text-sm max-w-xs">
            <div className="font-semibold mb-1">
              {new Date(hoveredDate).toLocaleDateString('ru-RU', { 
                day: 'numeric', 
                month: 'long' 
              })}
            </div>
            
            <div className="space-y-1">
              {tooltipData.income > 0 && (
                <div className="text-green-300 dark:text-green-600">
                  Доходы: {formatCurrency(tooltipData.income)}
                </div>
              )}
              {tooltipData.expenses > 0 && (
                <div className="text-red-300 dark:text-red-600">
                  Расходы: {formatCurrency(tooltipData.expenses)}
                </div>
              )}
              <div className="text-blue-300 dark:text-blue-600">
                Баланс: {formatCurrency(tooltipData.balance)}
              </div>
              <div className="text-slate-300 dark:text-slate-600 text-xs">
                {tooltipData.count} транзакций
              </div>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-700 dark:border-slate-300">
              <div className="text-xs text-slate-400 dark:text-slate-600">
                Нажмите для подробностей
              </div>
            </div>

            {/* Стрелка tooltip */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2">
              <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900 dark:border-t-slate-100"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

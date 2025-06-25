import React, { useMemo } from 'react';
import { Transaction, Category, formatCurrency } from '../../types';
import { getDaysInMonth, isToday, isSameMonth } from '../../utils/dateUtils';

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
  const days = useMemo(() => getDaysInMonth(currentDate), [currentDate]);

  const getDayStats = (date: Date) => {
    const dateKey = date.toISOString().split('T')[0];
    const dayTransactions = transactionsByDate[dateKey] || [];
    
    const income = dayTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = dayTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return { income, expenses, balance: income - expenses, count: dayTransactions.length };
  };

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
              className={`
                aspect-square p-2 rounded-2xl transition-all duration-200 text-left
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
            </button>
          );
        })}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Transaction, Category, formatCurrency } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { MONTHS, WEEKDAYS, getDaysInMonth, isToday } from '../../utils/dateUtils';

interface CalendarSidebarProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  transactionsByDate: Record<string, Transaction[]>;
  categories: Category[];
}

export function CalendarSidebar({ 
  currentDate, 
  onDateChange, 
  transactionsByDate, 
  categories 
}: CalendarSidebarProps) {
  const [miniCalendarDate, setMiniCalendarDate] = useState(new Date(currentDate));

  const navigateMiniCalendar = (direction: 'prev' | 'next') => {
    setMiniCalendarDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === currentDate.toDateString();
  };

  const hasTransactions = (date: Date) => {
    const dateKey = date.toISOString().split('T')[0];
    return (transactionsByDate[dateKey] || []).length > 0;
  };

  const getRecentTransactions = () => {
    const allTransactions = Object.values(transactionsByDate).flat();
    return allTransactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  };

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find(c => c.name === categoryName);
    return category?.color || '#6b7280';
  };

  const days = getDaysInMonth(miniCalendarDate);
  const recentTransactions = getRecentTransactions();

  return (
    <div className="space-y-6">
      {/* Мини-календарь */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              {MONTHS[miniCalendarDate.getMonth()]} {miniCalendarDate.getFullYear()}
            </h3>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateMiniCalendar('prev')}
                className="p-1"
              >
                <ChevronLeft size={16} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateMiniCalendar('next')}
                className="p-1"
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>

          {/* Заголовки дней недели */}
          <div className="grid grid-cols-7 gap-1">
            {WEEKDAYS.map(day => (
              <div key={day} className="text-center text-xs font-medium text-slate-500 dark:text-slate-400 py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Календарная сетка */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, index) => (
              <div key={index} className="aspect-square">
                {date && (
                  <button
                    onClick={() => onDateChange(date)}
                    className={`
                      w-full h-full rounded-lg text-xs font-medium transition-all duration-200
                      flex items-center justify-center relative
                      ${isSelected(date)
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                        : isToday(date)
                        ? 'bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-100'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }
                    `}
                  >
                    {date.getDate()}
                    {hasTransactions(date) && !isSelected(date) && (
                      <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-500 rounded-full" />
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Последние транзакции */}
      <Card>
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Последние транзакции
          </h3>
          
          {recentTransactions.length === 0 ? (
            <div className="text-center py-4 text-slate-500 dark:text-slate-400 text-sm">
              Нет транзакций
            </div>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  onClick={() => onDateChange(new Date(transaction.date))}
                >
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: getCategoryColor(transaction.category) }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                      {transaction.description}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(transaction.date).toLocaleDateString('ru-RU')}
                    </div>
                  </div>
                  <div className={`text-sm font-semibold ${
                    transaction.type === 'income' 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Быстрые действия */}
      <Card>
        <div className="space-y-3">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Быстрые действия
          </h3>
          
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onDateChange(new Date())}
            fullWidth
          >
            Перейти к сегодня
          </Button>
          
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              const firstDayOfMonth = new Date();
              firstDayOfMonth.setDate(1);
              onDateChange(firstDayOfMonth);
            }}
            fullWidth
          >
            Начало месяца
          </Button>
        </div>
      </Card>
    </div>
  );
}

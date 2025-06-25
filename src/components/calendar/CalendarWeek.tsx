import React from 'react';
import { Transaction, Category, formatCurrency } from '../../types';

interface CalendarWeekProps {
  currentDate: Date;
  transactionsByDate: Record<string, Transaction[]>;
  onDateClick: (date: Date) => void;
  categories: Category[];
}

const WEEKDAYS = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];

export function CalendarWeek({ 
  currentDate, 
  transactionsByDate, 
  onDateClick, 
  categories 
}: CalendarWeekProps) {
  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    const dayOfWeek = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    
    return days;
  };

  const getDayTransactions = (date: Date) => {
    const dateKey = date.toISOString().split('T')[0];
    return transactionsByDate[dateKey] || [];
  };

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find(c => c.name === categoryName);
    return category?.color || '#6b7280';
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const weekDays = getWeekDays();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-7 gap-4">
        {weekDays.map((date, index) => {
          const dayTransactions = getDayTransactions(date);
          const isTodayDate = isToday(date);
          
          const income = dayTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
          
          const expenses = dayTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

          return (
            <div
              key={index}
              className={`
                min-h-[300px] p-4 rounded-2xl border transition-all duration-200
                ${isTodayDate
                  ? 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-md'
                }
              `}
            >
              {/* Заголовок дня */}
              <div className="mb-4">
                <div className={`text-sm font-semibold ${
                  isTodayDate ? 'text-blue-700 dark:text-blue-300' : 'text-slate-500 dark:text-slate-400'
                }`}>
                  {WEEKDAYS[index]}
                </div>
                <div className={`text-2xl font-bold ${
                  isTodayDate ? 'text-blue-900 dark:text-blue-100' : 'text-slate-900 dark:text-slate-100'
                }`}>
                  {date.getDate()}
                </div>
              </div>

              {/* Статистика дня */}
              {(income > 0 || expenses > 0) && (
                <div className="mb-4 space-y-2">
                  {income > 0 && (
                    <div className="text-sm">
                      <span className="text-green-600 dark:text-green-400 font-semibold">
                        +{formatCurrency(income)}
                      </span>
                    </div>
                  )}
                  {expenses > 0 && (
                    <div className="text-sm">
                      <span className="text-red-600 dark:text-red-400 font-semibold">
                        -{formatCurrency(expenses)}
                      </span>
                    </div>
                  )}
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {dayTransactions.length} транзакций
                  </div>
                </div>
              )}

              {/* Список транзакций */}
              <div className="space-y-2 max-h-[180px] overflow-y-auto">
                {dayTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="p-2 rounded-lg bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors cursor-pointer"
                    onClick={() => onDateClick(date)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getCategoryColor(transaction.category) }}
                      />
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate">
                        {transaction.description}
                      </span>
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

              {/* Кнопка добавления */}
              <button
                onClick={() => onDateClick(date)}
                className="w-full mt-4 p-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-slate-500 dark:text-slate-400 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm"
              >
                + Добавить транзакцию
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

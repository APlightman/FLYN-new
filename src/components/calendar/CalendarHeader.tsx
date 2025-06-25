import React from 'react';
import { Calendar as CalendarIcon, Filter, Plus } from 'lucide-react';
import { Button } from '../ui/Button';

interface CalendarHeaderProps {
  transactionCount: number;
  onShowFilters: () => void;
  onShowTransactionForm: () => void;
}

export function CalendarHeader({ 
  transactionCount, 
  onShowFilters, 
  onShowTransactionForm 
}: CalendarHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl shadow-lg shadow-purple-500/25">
          <CalendarIcon className="text-white" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
            Календарь транзакций
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {transactionCount} транзакций за период
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="secondary"
          onClick={onShowFilters}
        >
          <Filter size={16} />
          Фильтры
        </Button>
        <Button onClick={onShowTransactionForm}>
          <Plus size={16} />
          Добавить
        </Button>
      </div>
    </div>
  );
}

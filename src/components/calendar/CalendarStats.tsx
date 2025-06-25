import React from 'react';
import { Card } from '../ui/Card';

interface CalendarStatsProps {
  stats: {
    income: number;
    expenses: number;
    balance: number;
  };
  transactionCount: number;
}

export function CalendarStats({ stats, transactionCount }: CalendarStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card variant="elevated" className="group hover:scale-[1.02] transition-transform duration-200">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(stats.income)}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Доходы</div>
        </div>
      </Card>

      <Card variant="elevated" className="group hover:scale-[1.02] transition-transform duration-200">
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {formatCurrency(stats.expenses)}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Расходы</div>
        </div>
      </Card>

      <Card variant="elevated" className="group hover:scale-[1.02] transition-transform duration-200">
        <div className="text-center">
          <div className={`text-2xl font-bold ${
            stats.balance >= 0 
              ? 'text-blue-600 dark:text-blue-400' 
              : 'text-orange-600 dark:text-orange-400'
          }`}>
            {formatCurrency(stats.balance)}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Баланс</div>
        </div>
      </Card>

      <Card variant="elevated" className="group hover:scale-[1.02] transition-transform duration-200">
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {transactionCount}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Транзакций</div>
        </div>
      </Card>
    </div>
  );
}

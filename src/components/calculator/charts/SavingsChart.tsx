import React from 'react';
import { Card } from '../../ui/Card';

interface SavingsChartProps {
  data: Array<{
    month: number;
    balance: number;
    realValue: number;
    simpleInterestBalance?: number;
  }>;
  showComparison: boolean;
  adjustForInflation: boolean;
}

export function SavingsChart({ data, showComparison, adjustForInflation }: SavingsChartProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const maxBalance = Math.max(...data.map(d => d.balance));
  const maxRealValue = adjustForInflation ? Math.max(...data.map(d => d.realValue)) : maxBalance;
  const maxSimpleBalance = showComparison && data[0]?.simpleInterestBalance 
    ? Math.max(...data.map(d => d.simpleInterestBalance || 0)) 
    : 0;

  const chartData = data.filter((_, index) => index % Math.ceil(data.length / 20) === 0 || index === data.length - 1);

  return (
    <Card>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
        График роста капитала
      </h3>
      
      <div className="h-80 flex items-end justify-between gap-1 mb-4">
        {chartData.map((item, index) => {
          const nominalHeight = (item.balance / maxBalance) * 80;
          const realHeight = adjustForInflation ? (item.realValue / maxRealValue) * 80 : nominalHeight;
          const simpleHeight = showComparison && item.simpleInterestBalance 
            ? (item.simpleInterestBalance / maxSimpleBalance) * 80 
            : 0;
          
          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-1 max-w-[40px]">
              <div className="w-full flex flex-col-reverse gap-0.5">
                {/* Сложный процент (основной) */}
                <div
                  className="w-full bg-gradient-to-t from-blue-600 to-blue-500 rounded-t transition-all duration-300 hover:from-blue-700 hover:to-blue-600 relative group"
                  style={{ height: `${nominalHeight}%`, minHeight: item.balance > 0 ? '4px' : '0px' }}
                  title={`Месяц ${item.month}: ${formatCurrency(item.balance)} (сложный процент)`}
                >
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {formatCurrency(item.balance)}
                  </div>
                </div>
                
                {/* Простой процент (для сравнения) */}
                {showComparison && item.simpleInterestBalance && (
                  <div
                    className="w-full bg-gradient-to-t from-red-500 to-red-400 rounded-t transition-all duration-300 hover:from-red-600 hover:to-red-500 opacity-70 relative group"
                    style={{ height: `${simpleHeight}%`, minHeight: '4px' }}
                    title={`Месяц ${item.month}: ${formatCurrency(item.simpleInterestBalance)} (простой процент)`}
                  >
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {formatCurrency(item.simpleInterestBalance)}
                    </div>
                  </div>
                )}
                
                {/* Реальная стоимость (с учетом инфляции) */}
                {adjustForInflation && (
                  <div
                    className="w-full bg-gradient-to-t from-green-600 to-green-500 rounded-t transition-all duration-300 hover:from-green-700 hover:to-green-600 opacity-80 relative group"
                    style={{ height: `${realHeight}%`, minHeight: '4px' }}
                    title={`Месяц ${item.month}: ${formatCurrency(item.realValue)} (реальная стоимость)`}
                  >
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {formatCurrency(item.realValue)}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 text-center">
                {Math.ceil(item.month / 12)}г
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="flex justify-center gap-4 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gradient-to-r from-blue-600 to-blue-500 rounded" />
          <span className="text-sm text-slate-600 dark:text-slate-400">Сложный процент</span>
        </div>
        {showComparison && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-red-400 rounded opacity-70" />
            <span className="text-sm text-slate-600 dark:text-slate-400">Простой процент</span>
          </div>
        )}
        {adjustForInflation && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-r from-green-600 to-green-500 rounded opacity-80" />
            <span className="text-sm text-slate-600 dark:text-slate-400">Реальная стоимость</span>
          </div>
        )}
      </div>
      
      <div className="text-center text-sm text-slate-600 dark:text-slate-400">
        График показывает рост капитала за {Math.ceil(data.length / 12)} лет
        {adjustForInflation && ` с учетом инфляции`}
        {showComparison && ` и сравнением типов процента`}
      </div>
    </Card>
  );
}

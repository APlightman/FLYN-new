import React from 'react';
import { Card } from '../../ui/Card';

interface LoanChartProps {
  data: Array<{
    month: number;
    payment: number;
    principal: number;
    interest: number;
    balance: number;
    realPayment: number;
    carValue?: number;
    fees?: number;
  }>;
  adjustForInflation: boolean;
  title: string;
  showCarValue?: boolean;
}

export function LoanChart({ data, adjustForInflation, title, showCarValue = false }: LoanChartProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const maxPayment = Math.max(...data.map(d => d.payment));
  const maxBalance = Math.max(...data.map(d => d.balance));
  const maxCarValue = showCarValue ? Math.max(...data.map(d => d.carValue || 0)) : 0;
  
  const chartData = data.filter((_, index) => 
    index % Math.ceil(data.length / 20) === 0 || index === data.length - 1
  );

  return (
    <Card>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
        {title}
      </h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* График платежей */}
        <div>
          <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-3">
            Ежемесячные платежи
          </h4>
          <div className="h-64 flex items-end justify-between gap-1 mb-4">
            {chartData.map((item, index) => {
              const nominalHeight = (item.payment / maxPayment) * 100;
              const realHeight = adjustForInflation 
                ? (item.realPayment / maxPayment) * 100 
                : nominalHeight;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-1 max-w-[25px]">
                  <div className="w-full flex flex-col gap-0.5">
                    <div
                      className="w-full bg-gradient-to-t from-red-600 to-red-500 rounded-t transition-all duration-300 hover:from-red-700 hover:to-red-600"
                      style={{ height: `${nominalHeight}%`, minHeight: '3px' }}
                      title={`Месяц ${item.month}: ${formatCurrency(item.payment)} (номинал)`}
                    />
                    {adjustForInflation && (
                      <div
                        className="w-full bg-gradient-to-t from-green-600 to-green-500 rounded-t transition-all duration-300 hover:from-green-700 hover:to-green-600 opacity-70"
                        style={{ height: `${realHeight}%`, minHeight: '3px' }}
                        title={`Месяц ${item.month}: ${formatCurrency(item.realPayment)} (реальная стоимость)`}
                      />
                    )}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {Math.ceil(item.month / 12)}г
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* График остатка долга или стоимости авто */}
        <div>
          <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-3">
            {showCarValue ? 'Остаток долга vs Стоимость авто' : 'Остаток задолженности'}
          </h4>
          <div className="h-64 flex items-end justify-between gap-1 mb-4">
            {chartData.map((item, index) => {
              const balanceHeight = (item.balance / maxBalance) * 100;
              const carValueHeight = showCarValue && item.carValue 
                ? (item.carValue / maxCarValue) * 100 
                : 0;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-1 max-w-[25px]">
                  <div className="w-full flex flex-col gap-0.5">
                    <div
                      className="w-full bg-gradient-to-t from-purple-600 to-purple-500 transition-all duration-300 hover:from-purple-700 hover:to-purple-600"
                      style={{ height: `${balanceHeight}%`, minHeight: '2px' }}
                      title={`Остаток долга: ${formatCurrency(item.balance)}`}
                    />
                    {showCarValue && item.carValue && (
                      <div
                        className="w-full bg-gradient-to-t from-blue-600 to-blue-500 transition-all duration-300 hover:from-blue-700 hover:to-blue-600 opacity-70"
                        style={{ height: `${carValueHeight}%`, minHeight: '2px' }}
                        title={`Стоимость авто: ${formatCurrency(item.carValue)}`}
                      />
                    )}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {Math.ceil(item.month / 12)}г
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-4 mt-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gradient-to-r from-red-600 to-red-500 rounded" />
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {adjustForInflation ? 'Номинальные платежи' : 'Ежемесячные платежи'}
          </span>
        </div>
        {adjustForInflation && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-r from-green-600 to-green-500 rounded opacity-70" />
            <span className="text-sm text-slate-600 dark:text-slate-400">Реальная стоимость</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gradient-to-r from-purple-600 to-purple-500 rounded" />
          <span className="text-sm text-slate-600 dark:text-slate-400">Остаток долга</span>
        </div>
        {showCarValue && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-600 to-blue-500 rounded opacity-70" />
            <span className="text-sm text-slate-600 dark:text-slate-400">Стоимость авто</span>
          </div>
        )}
      </div>
    </Card>
  );
}
